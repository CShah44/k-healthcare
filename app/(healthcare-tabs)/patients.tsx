import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Users,
  User,
  Search,
  Plus,
  X,
  ChevronRight,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  collection,
  query,
  onSnapshot,
  getDocs,
  where,
  addDoc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { db } from '@/constants/firebase';
import Animated, { FadeInDown } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function PatientsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, userData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'doctorAccess'),
      where('doctorId', '==', user.uid),
    );

    const unsubscribe = onSnapshot(
      q,
      async (querySnapshot) => {
        const patientsPromises = querySnapshot.docs.map(async (accessDoc) => {
          const accessData = accessDoc.data();
          const patientUid = accessData.patientUid;
          if (accessData.active === false) return null;

          const expiresAt =
            accessData.expiresAt instanceof Timestamp
              ? accessData.expiresAt.toDate()
              : new Date(accessData.expiresAt);

          const isExpired = expiresAt < new Date();
          const accessStatus = isExpired ? 'Expired' : 'Active';

          try {
            const userDoc = await getDocs(
              query(collection(db, 'users'), where('uid', '==', patientUid)),
            );
            if (!userDoc.empty) {
              const userData = userDoc.docs[0].data();
              const dob = userData.dateOfBirth
                ? new Date(userData.dateOfBirth)
                : null;
              const age = dob
                ? new Date().getFullYear() - dob.getFullYear()
                : 'N/A';

              return {
                id: userDoc.docs[0].id,
                name: `${userData.firstName} ${userData.lastName}`,
                age: age,
                gender: userData.gender || 'Unknown',
                patientId: userData.patientId || userData.customUserId || 'N/A',
                accessStatus: accessStatus,
                avatar: userData.avatarUrl || null,
                condition: 'Stable',
                lastVisit: new Date(),
              };
            }
          } catch (err) {
            console.error('Error fetching user details for', patientUid, err);
          }

          return null;
        });

        const activePatients = (await Promise.all(patientsPromises)).filter(
          (p) => p !== null,
        );
        setPatients(activePatients);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching patients:', error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user]);

  const filteredPatients = patients.filter((patient) => {
    const query = searchQuery.toLowerCase();
    return (
      patient.name.toLowerCase().includes(query) ||
      patient.patientId?.toLowerCase().includes(query)
    );
  });

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestPatientId, setRequestPatientId] = useState('');
  const [requestLoading, setRequestLoading] = useState(false);

  const handleSendRequest = async () => {
    if (!requestPatientId.trim()) {
      Alert.alert('Error', 'Please enter a Patient ID');
      return;
    }

    setRequestLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q1 = query(
        usersRef,
        where('patientId', '==', requestPatientId.trim()),
      );
      const q2 = query(
        usersRef,
        where('customUserId', '==', requestPatientId.trim()),
      );

      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

      let patientDoc = null;
      if (!snap1.empty) patientDoc = snap1.docs[0];
      else if (!snap2.empty) patientDoc = snap2.docs[0];

      if (!patientDoc) {
        Alert.alert(
          'Error',
          'Patient not found. Please check the ID and try again.',
        );
        return;
      }

      const patientData = patientDoc.data();
      const patientUid = patientDoc.id;

      const requestsRef = collection(db, 'accessRequests');
      const duplicateQuery = query(
        requestsRef,
        where('patientUid', '==', patientUid),
        where('doctorId', '==', user?.uid),
        where('status', '==', 'pending'),
      );

      const duplicateSnap = await getDocs(duplicateQuery);
      if (!duplicateSnap.empty) {
        Alert.alert(
          'Request Pending',
          'You already have a pending request for this patient.',
        );
        return;
      }

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5);

      await addDoc(requestsRef, {
        patientId: patientData.patientId || patientData.customUserId,
        patientUid: patientUid,
        patientName: `${patientData.firstName} ${patientData.lastName}`,
        patientDob: patientData.dateOfBirth || null,
        patientAvatar: patientData.avatarUrl || null,
        doctorId: user?.uid,
        doctorName: `${userData?.firstName} ${userData?.lastName}`,
        doctorSpecialty: userData?.specialty || '',
        doctorAvatar: userData?.avatarUrl || null,
        status: 'pending',
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
      });

      Alert.alert(
        'Success',
        'Access request sent. Waiting for patient approval.',
      );
      setShowRequestModal(false);
      setRequestPatientId('');
    } catch (error) {
      console.error('Error sending request:', error);
      Alert.alert('Error', 'Failed to send request. Please try again.');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleRemovePatient = async (
    patientUid: string,
    patientName: string,
  ) => {
    // ... same logic
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={{ alignItems: 'center' }}>
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Patients
              </Text>
              <Text
                style={[styles.headerSubtitle, { color: colors.textSecondary }]}
              >
                {patients.length} active patients
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowRequestModal(true)}
            >
              <Plus size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View
              style={[styles.searchBar, { backgroundColor: colors.surface }]}
            >
              <Search size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={colors.textSecondary}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Patients List */}
          <ScrollView
            style={styles.patientsList}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <View style={{ padding: 40, alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            ) : filteredPatients.length > 0 ? (
              filteredPatients.map((patient, index) => (
                <Animated.View
                  entering={FadeInDown.delay(index * 50).springify()}
                  key={patient.id}
                  style={[
                    styles.patientCard,
                    { backgroundColor: colors.surface },
                  ]}
                >
                  <TouchableOpacity
                    style={styles.cardMain}
                    onPress={() =>
                      router.push({
                        pathname: '/(healthcare-tabs)/records',
                        params: {
                          patientUid: patient.id,
                          patientName: patient.name,
                        },
                      })
                    }
                  >
                    {patient.avatar ? (
                      <Image
                        source={{ uri: patient.avatar }}
                        style={styles.patientAvatar}
                      />
                    ) : (
                      <View
                        style={[
                          styles.patientAvatar,
                          {
                            backgroundColor: colors.surfaceSecondary,
                            alignItems: 'center',
                            justifyContent: 'center',
                          },
                        ]}
                      >
                        <User size={24} color={colors.textSecondary} />
                      </View>
                    )}

                    <View style={styles.patientInfo}>
                      <Text
                        style={[styles.patientName, { color: colors.text }]}
                      >
                        {patient.name}
                      </Text>
                      <View style={styles.patientMetaRow}>
                        <Text
                          style={[
                            styles.patientId,
                            { color: colors.textSecondary },
                          ]}
                        >
                          ID: {patient.patientId}
                        </Text>
                        <View
                          style={[
                            styles.dotSeparator,
                            { backgroundColor: colors.border },
                          ]}
                        />
                        <Text
                          style={[
                            styles.patientAge,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {patient.age} yrs
                        </Text>
                      </View>
                    </View>

                    <ChevronRight size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                </Animated.View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <View
                  style={[
                    styles.emptyIcon,
                    { backgroundColor: colors.surfaceSecondary },
                  ]}
                >
                  <Users size={40} color={colors.textSecondary} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  No patients found
                </Text>
                <Text
                  style={[styles.emptyText, { color: colors.textSecondary }]}
                >
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Request access to start treating patients'}
                </Text>
                {!searchQuery && (
                  <TouchableOpacity
                    style={styles.emptyButton}
                    onPress={() => setShowRequestModal(true)}
                  >
                    <Text style={styles.emptyButtonText}>Request Access</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Request Access Modal */}
      <Modal
        visible={showRequestModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRequestModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Request Access
              </Text>
              <TouchableOpacity onPress={() => setShowRequestModal(false)}>
                <X size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text
              style={[styles.modalDescription, { color: colors.textSecondary }]}
            >
              Enter the Patient ID to request access to their medical records.
            </Text>

            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Patient ID
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="e.g. SVP-123456"
              placeholderTextColor={colors.textSecondary}
              value={requestPatientId}
              onChangeText={setRequestPatientId}
              autoCapitalize="characters"
            />

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleSendRequest}
              disabled={requestLoading}
            >
              {requestLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.modalButtonText}>Send Request</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    width: '100%',
    maxWidth: 1000, // Constrain width same as patient tabs
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    marginTop: 4,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
  },
  patientsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  patientCard: {
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  patientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
    marginBottom: 4,
  },
  patientMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientId: {
    fontSize: 13,
    fontFamily: 'Satoshi-Variable',
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 8,
  },
  patientAge: {
    fontSize: 13,
    fontFamily: 'Satoshi-Variable',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'Satoshi-Variable',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Satoshi-Variable',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#111',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontFamily: 'Satoshi-Variable',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Satoshi-Variable',
  },
  modalDescription: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    marginBottom: 24,
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Satoshi-Variable',
  },
  modalInput: {
    borderRadius: 12,
    padding: 16,
    fontFamily: 'Satoshi-Variable',
    borderWidth: 1,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
  },
});
