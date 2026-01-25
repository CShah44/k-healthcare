import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { uploadFile } from '@/app/(patient-tabs)/services/uploadHelpers';
import { generatePrescriptionPdf } from '@/utils/pdfGenerator';
import { useAuth } from '@/contexts/AuthContext';
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/constants/firebase';
import * as FileSystem from 'expo-file-system';
import {
  ArrowLeft,
  Pill,
  Save,
  Plus,
  Trash2,
  FileText,
  User,
  Calendar,
  Search,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function CreatePrescriptionScreen() {
  const { colors } = useTheme();
  // Params might be empty if coming from dashboard shortcut
  const { patientUid: paramPatientUid, patientName: paramPatientName } =
    useLocalSearchParams<{
      patientUid?: string;
      patientName?: string;
    }>();

  const [patientUid, setPatientUid] = useState(paramPatientUid || '');
  const [patientName, setPatientName] = useState(paramPatientName || '');
  const [patientAge, setPatientAge] = useState('');
  const [svastheyaIdSearch, setSvastheyaIdSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  const [medications, setMedications] = useState([
    { id: 1, name: '', dosage: '', frequency: '', duration: '' },
  ]);

  const { userData: doctorData, user: authUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);

  // If params are present, verify and load age if possible (optional, or just rely on user input)
  useEffect(() => {
    if (paramPatientUid) {
      // Could fetch age here if needed
      const fetchAge = async () => {
        const q = query(
          collection(db, 'users'),
          where('uid', '==', paramPatientUid),
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
          const u = snap.docs[0].data();
          if (u.dateOfBirth) {
            const dob = new Date(u.dateOfBirth);
            const age = new Date().getFullYear() - dob.getFullYear();
            setPatientAge(age.toString());
          }
        }
      };
      fetchAge();
    }
  }, [paramPatientUid]);

  // Reset and Sync State
  useFocusEffect(
    useCallback(() => {
      // If navigation provides params, update state
      if (paramPatientUid) {
        setPatientUid(paramPatientUid);
        setPatientName(paramPatientName || '');
      } else {
        // Reset if no params (fresh entry from dashboard)
        setPatientUid('');
        setPatientName('');
        setPatientAge('');
        setDiagnosis('');
        setNotes('');
        setMedications([
          { id: Date.now(), name: '', dosage: '', frequency: '', duration: '' },
        ]);
        setSvastheyaIdSearch('');
      }

      return () => {
        // Optional: Cleanup on blur (leave)
        setPatientUid('');
        setPatientName('');
        setPatientAge('');
        setDiagnosis('');
        setNotes('');
        setMedications([
          { id: Date.now(), name: '', dosage: '', frequency: '', duration: '' },
        ]);
        setSvastheyaIdSearch('');
        setIsSearching(false);
      };
    }, [paramPatientUid, paramPatientName]),
  );

  const handleSearchPatient = async () => {
    if (!svastheyaIdSearch.trim()) {
      Alert.alert('Error', 'Please enter a Svastheya ID or Patient ID');
      return;
    }
    setIsSearching(true);
    try {
      // Search by customUserId (Svastheya ID) OR patientId
      const usersRef = collection(db, 'users');
      const q1 = query(
        usersRef,
        where('customUserId', '==', svastheyaIdSearch.trim()),
      );
      const q2 = query(
        usersRef,
        where('patientId', '==', svastheyaIdSearch.trim()),
      );

      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
      let foundUser = null;
      let uid = null;

      if (!snap1.empty) {
        foundUser = snap1.docs[0].data();
        uid = snap1.docs[0].id;
      } else if (!snap2.empty) {
        foundUser = snap2.docs[0].data();
        uid = snap2.docs[0].id;
      }

      if (foundUser && uid) {
        setPatientName(`${foundUser.firstName} ${foundUser.lastName}`);
        setPatientUid(uid);
        if (foundUser.dateOfBirth) {
          const dob = new Date(foundUser.dateOfBirth);
          const age = new Date().getFullYear() - dob.getFullYear();
          setPatientAge(age.toString());
        } else {
          setPatientAge('');
        }
        Alert.alert('Success', 'Patient found!');
      } else {
        Alert.alert('Not Found', 'No patient found with this ID.');
        setPatientName('');
        setPatientUid('');
        setPatientAge('');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to search patient');
    } finally {
      setIsSearching(false);
    }
  };

  const addMedication = () => {
    setMedications([
      ...medications,
      { id: Date.now(), name: '', dosage: '', frequency: '', duration: '' },
    ]);
  };

  const removeMedication = (id: number) => {
    if (medications.length === 1) return;
    setMedications(medications.filter((m) => m.id !== id));
  };

  const updateMedication = (id: number, field: string, value: string) => {
    setMedications(
      medications.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    );
  };

  const fetchImageToBase64 = async (url: string) => {
    try {
      if (Platform.OS === 'web') {
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        const { uri } = await FileSystem.downloadAsync(
          url,
          FileSystem.cacheDirectory + 'letterhead_temp.jpg',
        );
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return `data:image/jpeg;base64,${base64}`;
      }
    } catch (e) {
      console.warn('Failed to fetch image base64:', e);
      return undefined;
    }
  };

  const handleSave = async () => {
    if (!patientName.trim()) {
      Alert.alert('Error', 'Please enter patient name or search by ID');
      return;
    }

    if (!patientUid) {
      Alert.alert(
        'Error',
        'Patient ID is missing. Please search for a registered patient via ID.',
      );
      return;
    }

    try {
      setIsSaving(true);
      const fileName = `Prescription_${new Date().toISOString().split('T')[0]}_${Date.now()}.pdf`;

      let letterheadBase64: string | undefined;
      if (doctorData?.letterheadUrl) {
        letterheadBase64 = await fetchImageToBase64(doctorData.letterheadUrl);
      }

      const { uri, blob } = await generatePrescriptionPdf({
        doctor: { ...doctorData, letterheadBase64 },
        patient: {
          name: patientName,
          age: patientAge,
          uid: patientUid,
        },
        diagnosis,
        medications,
        notes,
        date: new Date().toLocaleDateString(),
      } as any);

      // Upload PDF
      const uploadResult = await uploadFile(
        uri,
        fileName,
        'application/pdf',
        patientUid,
        `Prescription - ${diagnosis}`,
        ['prescriptions'],
        blob,
      );

      // Save Record
      await addDoc(collection(db, 'patients', patientUid, 'records'), {
        patientId: patientUid,
        doctorId: authUser?.uid,
        assignedDoctor: authUser?.uid,
        doctorName: `Dr. ${doctorData?.firstName} ${doctorData?.lastName}`,
        type: 'prescription',
        title: `Prescription for ${diagnosis}`,
        date: new Date().toISOString(),
        createdAt: serverTimestamp(),
        uploadedAt: serverTimestamp(),
        fileUrl: uploadResult.url,
        fileType: 'application/pdf',
        fileName: fileName,
        tags: ['prescriptions'],
        diagnosis,
        medications,
        notes,
        patientName,
      });

      Alert.alert('Success', 'Prescription saved and sent to patient records.');
      router.back();
    } catch (error: any) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save prescription: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={{ flex: 1, alignItems: 'center' }}>
        <View style={{ width: '100%', maxWidth: 600, flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.backButton, { backgroundColor: colors.surface }]}
            >
              <ArrowLeft size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              New Prescription
            </Text>
            <View style={{ width: 40 }} />
          </View>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
          >
            <ScrollView
              contentContainerStyle={styles.content}
              showsVerticalScrollIndicator={false}
            >
              {/* Patient Details */}
              <Animated.View
                entering={FadeInDown.delay(100)}
                style={[styles.card, { backgroundColor: colors.surface }]}
              >
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: '#DBEAFE' },
                    ]}
                  >
                    <User size={20} color="#3B82F6" />
                  </View>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Patient Details
                  </Text>
                </View>

                {/* NEW: Search Bar only if no patientUid passed initially */}
                {!paramPatientUid && (
                  <View style={styles.searchSection}>
                    <Text
                      style={[styles.label, { color: colors.textSecondary }]}
                    >
                      Search Patient
                    </Text>
                    <View style={styles.searchRow}>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            flex: 1,
                            backgroundColor: colors.background,
                            color: colors.text,
                            marginRight: 10,
                          },
                        ]}
                        placeholder="Enter Svastheya ID or Patient ID"
                        placeholderTextColor={colors.textSecondary}
                        value={svastheyaIdSearch}
                        onChangeText={setSvastheyaIdSearch}
                        autoCapitalize="characters"
                      />
                      <TouchableOpacity
                        style={styles.searchButton}
                        onPress={handleSearchPatient}
                        disabled={isSearching}
                      >
                        {isSearching ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <Search size={20} color="white" />
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>
                    Full Name
                  </Text>
                  <TextInput
                    style={[
                      styles.input,
                      {
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor: 'transparent',
                      },
                    ]}
                    placeholder="Patient Name"
                    placeholderTextColor={colors.textSecondary}
                    value={patientName}
                    onChangeText={setPatientName}
                    editable={false} // Name is auto-filled
                  />
                </View>

                <View style={styles.row}>
                  <View
                    style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}
                  >
                    <Text
                      style={[styles.label, { color: colors.textSecondary }]}
                    >
                      Age
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.background,
                          color: colors.text,
                          borderColor: 'transparent',
                        },
                      ]}
                      placeholder="Age"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                      value={patientAge}
                      onChangeText={setPatientAge}
                      // editable={false} // Generally calculated
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 2 }]}>
                    <Text
                      style={[styles.label, { color: colors.textSecondary }]}
                    >
                      Date
                    </Text>
                    <View
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.background,
                          flexDirection: 'row',
                          alignItems: 'center',
                          borderColor: 'transparent',
                        },
                      ]}
                    >
                      <Calendar
                        size={18}
                        color={colors.textSecondary}
                        style={{ marginRight: 8 }}
                      />
                      <Text
                        style={{
                          color: colors.text,
                          fontFamily: 'Satoshi-Variable',
                        }}
                      >
                        {new Date().toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              </Animated.View>

              {/* Diagnosis */}
              <Animated.View
                entering={FadeInDown.delay(200)}
                style={[styles.card, { backgroundColor: colors.surface }]}
              >
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: '#FCE7F3' },
                    ]}
                  >
                    <FileText size={20} color="#EC4899" />
                  </View>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Diagnosis
                  </Text>
                </View>
                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                    {
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: 'transparent',
                    },
                  ]}
                  placeholder="Enter diagnosis and observations..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={3}
                  value={diagnosis}
                  onChangeText={setDiagnosis}
                />
              </Animated.View>

              {/* Medications */}
              <Animated.View
                entering={FadeInDown.delay(300)}
                style={[styles.card, { backgroundColor: colors.surface }]}
              >
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: '#FEF3C7' },
                    ]}
                  >
                    <Pill size={20} color="#F59E0B" />
                  </View>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Medications
                  </Text>
                </View>

                {medications.map((med, index) => (
                  <View
                    key={med.id}
                    style={[
                      styles.medicationItem,
                      { borderColor: colors.border },
                    ]}
                  >
                    <View style={styles.medicationHeader}>
                      <Text
                        style={[
                          styles.medicationCount,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Medicine {index + 1}
                      </Text>
                      {medications.length > 1 && (
                        <TouchableOpacity
                          onPress={() => removeMedication(med.id)}
                        >
                          <Trash2 size={18} color={Colors.medical.red} />
                        </TouchableOpacity>
                      )}
                    </View>

                    <TextInput
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.background,
                          color: colors.text,
                          borderColor: 'transparent',
                          marginBottom: 12,
                        },
                      ]}
                      placeholder="Medicine Name (e.g. Amoxicillin)"
                      placeholderTextColor={colors.textSecondary}
                      value={med.name}
                      onChangeText={(t) => updateMedication(med.id, 'name', t)}
                    />

                    <View style={styles.row}>
                      <TextInput
                        style={[
                          styles.input,
                          {
                            flex: 1,
                            marginRight: 12,
                            backgroundColor: colors.background,
                            color: colors.text,
                            borderColor: 'transparent',
                          },
                        ]}
                        placeholder="Dosage"
                        placeholderTextColor={colors.textSecondary}
                        value={med.dosage}
                        onChangeText={(t) =>
                          updateMedication(med.id, 'dosage', t)
                        }
                      />
                      <TextInput
                        style={[
                          styles.input,
                          {
                            flex: 1,
                            backgroundColor: colors.background,
                            color: colors.text,
                            borderColor: 'transparent',
                          },
                        ]}
                        placeholder="Frequency"
                        placeholderTextColor={colors.textSecondary}
                        value={med.frequency}
                        onChangeText={(t) =>
                          updateMedication(med.id, 'frequency', t)
                        }
                      />
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.addButton}
                  onPress={addMedication}
                >
                  <Plus size={20} color={Colors.primary} />
                  <Text style={styles.addButtonText}>Add Medicine</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton]}
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Text style={[styles.buttonText, { color: 'white' }]}>
                      Saving...
                    </Text>
                  ) : (
                    <>
                      <Save size={20} color="white" />
                      <Text style={[styles.buttonText, { color: 'white' }]}>
                        Generate & Save Prescription
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
  },
  content: {
    padding: 20,
    paddingBottom: 100, // Extra space
  },
  card: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
  },
  searchSection: {
    marginBottom: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  medicationItem: {
    borderBottomWidth: 1,
    paddingBottom: 20,
    marginBottom: 20,
    borderStyle: 'dashed',
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationCount: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 16,
    borderStyle: 'dashed',
    gap: 8,
    marginTop: 8,
  },
  addButtonText: {
    color: Colors.primary,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
    fontSize: 16,
  },
  actions: {
    marginTop: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
  },
});
