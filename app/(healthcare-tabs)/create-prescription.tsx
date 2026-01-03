import { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Pill,
  Save,
  Download,
  Plus,
  Trash2,
  FileText,
  User,
  Calendar,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function CreatePrescriptionScreen() {
  const { colors } = useTheme();

  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');

  const [medications, setMedications] = useState([
    { id: 1, name: '', dosage: '', frequency: '', duration: '' },
  ]);

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
      medications.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleSave = () => {
    if (!patientName.trim()) {
      Alert.alert('Error', 'Please enter patient name');
      return;
    }
    Alert.alert('Success', 'Prescription saved to records (Dummy)');
    router.back();
  };

  const handleDownload = () => {
    Alert.alert(
      'Coming Soon',
      'PDF Download will be available in the next update.'
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          New Prescription
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {/* Patient Details */}
          <Animated.View
            entering={FadeInDown.delay(100)}
            style={[styles.card, { backgroundColor: colors.surface }]}
          >
            <View style={styles.cardHeader}>
              <User size={20} color={Colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Patient Details
              </Text>
            </View>

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
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Ex. John Doe"
                placeholderTextColor={colors.textSecondary}
                value={patientName}
                onChangeText={setPatientName}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Age
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="Ex. 32"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  value={patientAge}
                  onChangeText={setPatientAge}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 2 }]}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Date
                </Text>
                <View
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background,
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: colors.text }}>
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
              <FileText size={20} color={Colors.primary} />
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
                  borderColor: colors.border,
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
              <Pill size={20} color={Colors.primary} />
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Medications
              </Text>
            </View>

            {medications.map((med, index) => (
              <View
                key={med.id}
                style={[styles.medicationItem, { borderColor: colors.border }]}
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
                    <TouchableOpacity onPress={() => removeMedication(med.id)}>
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
                      borderColor: colors.border,
                      marginBottom: 8,
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
                        marginRight: 8,
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    placeholder="Dosage (500mg)"
                    placeholderTextColor={colors.textSecondary}
                    value={med.dosage}
                    onChangeText={(t) => updateMedication(med.id, 'dosage', t)}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      {
                        flex: 1,
                        backgroundColor: colors.background,
                        color: colors.text,
                        borderColor: colors.border,
                      },
                    ]}
                    placeholder="Freq (Twice daily)"
                    placeholderTextColor={colors.textSecondary}
                    value={med.frequency}
                    onChangeText={(t) =>
                      updateMedication(med.id, 'frequency', t)
                    }
                  />
                </View>
              </View>
            ))}

            <TouchableOpacity style={styles.addButton} onPress={addMedication}>
              <Plus size={20} color={Colors.primary} />
              <Text style={styles.addButtonText}>Add Medicine</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.downloadButton]}
              onPress={handleDownload}
            >
              <Download size={20} color={Colors.primary} />
              <Text style={[styles.buttonText, { color: Colors.primary }]}>
                Download PDF
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <Save size={20} color="white" />
              <Text style={[styles.buttonText, { color: 'white' }]}>
                Save Record
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  medicationItem: {
    borderBottomWidth: 1,
    paddingBottom: 16,
    marginBottom: 16,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationCount: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    borderStyle: 'dashed',
    gap: 8,
  },
  addButtonText: {
    color: Colors.primary,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  downloadButton: {
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
  },
});
