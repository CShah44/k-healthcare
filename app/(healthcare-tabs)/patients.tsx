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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Users,
  User,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  Calendar,
  ChevronRight,
  TriangleAlert as AlertTriangle,
  FileText,
  Trash2,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, onSnapshot, getDocs, where, addDoc, serverTimestamp, Timestamp, writeBatch, updateDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { db } from '@/constants/firebase';

export default function PatientsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, userData } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all'); // This state is no longer used for filtering patients, but kept if needed for UI filter chips

  const filters = [
    { id: 'all', label: 'All Patients' },
    { id: 'critical', label: 'Critical' },
    { id: 'monitoring', label: 'Monitoring' },
    { id: 'stable', label: 'Stable' },
  ];

  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'doctorAccess'),
      where('doctorId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      async (querySnapshot) => {
        const patientsPromises = querySnapshot.docs.map(async (accessDoc) => {
          const accessData = accessDoc.data();
          const patientUid = accessData.patientUid;
          const expiresAt = accessData.expiresAt instanceof Timestamp ? accessData.expiresAt.toDate() : new Date(accessData.expiresAt);

          const isExpired = expiresAt < new Date();
          const accessStatus = isExpired ? 'Expired' : 'Active';

          try {
            const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', patientUid)));
            if (!userDoc.empty) {
              const userData = userDoc.docs[0].data();
              const dob = userData.dateOfBirth ? new Date(userData.dateOfBirth) : null;
              const age = dob ? new Date().getFullYear() - dob.getFullYear() : 'N/A';

              return {
                id: userDoc.docs[0].id, // Use actual user ID as the key
                name: `${userData.firstName} ${userData.lastName}`,
                age: age,
                gender: userData.gender || 'Unknown',
                patientId: userData.patientId || userData.customUserId || 'N/A',
                accessStatus: accessStatus,
                avatar: userData.avatarUrl || null,
                accessExpiresAt: expiresAt
              };
            }
          } catch (err) {
            console.error("Error fetching user details for", patientUid, err);
          }

          return null;
        });

        const activePatients = (await Promise.all(patientsPromises)).filter(p => p !== null);
        setPatients(activePatients);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching patients:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patientId?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
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
      // 1. Find the patient by patientId OR customUserId
      const usersRef = collection(db, 'users');
      // Create two queries to check both potential ID fields
      const q1 = query(usersRef, where('patientId', '==', requestPatientId.trim()));
      const q2 = query(usersRef, where('customUserId', '==', requestPatientId.trim()));

      const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);

      let patientDoc = null;
      if (!snap1.empty) patientDoc = snap1.docs[0];
      else if (!snap2.empty) patientDoc = snap2.docs[0];

      if (!patientDoc) {
        Alert.alert('Error', 'Patient not found. Please check the ID and try again.');
        setRequestLoading(false);
        return;
      }

      const patientData = patientDoc.data();
      const patientUid = patientDoc.id;

      // 2. Check for duplicate pending requests
      const requestsRef = collection(db, 'accessRequests');
      const duplicateQuery = query(
        requestsRef,
        where('patientUid', '==', patientUid),
        where('doctorId', '==', user?.uid),
        where('status', '==', 'pending')
      );

      const duplicateSnap = await getDocs(duplicateQuery);
      if (!duplicateSnap.empty) {
        Alert.alert('Request Pending', 'You already have a pending request for this patient.');
        setRequestLoading(false);
        return;
      }

      // 3. Create new request
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
        doctorSpecialty: userData?.specialty || 'General',
        doctorAvatar: userData?.avatarUrl || null,
        status: 'pending',
        createdAt: serverTimestamp(),
        expiresAt: Timestamp.fromDate(expiresAt),
      });

      Alert.alert('Success', 'Access request sent. Waiting for patient approval.');
      setShowRequestModal(false);
      setRequestPatientId('');

    } catch (error) {
      console.error('Error sending request:', error);
      Alert.alert('Error', 'Failed to send request. Please try again.');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleRemovePatient = async (patientUid: string, patientName: string) => {
    Alert.alert(
      'Remove Patient',
      `Are you sure you want to remove ${patientName}? You will no longer be able to view their records.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              // Find the active access document
              const accessQuery = query(
                collection(db, 'doctorAccess'),
                where('doctorId', '==', user?.uid),
                where('patientUid', '==', patientUid),
                where('active', '==', true)
              );

              const snapshot = await getDocs(accessQuery);

              if (!snapshot.empty) {
                const docRef = snapshot.docs[0].ref;
                await updateDoc(docRef, { active: false });

                // Optimistically update state
                setPatients(prev => prev.filter(p => p.id !== patientUid));
                Alert.alert('Success', 'Patient removed successfully');
              } else {
                Alert.alert('Error', 'Could not find active access record.');
              }
            } catch (error) {
              console.error('Error removing patient:', error);
              Alert.alert('Error', 'Failed to remove patient');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Patients
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowRequestModal(true)}
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search patients..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: `${Colors.primary}15` },
          ]}
        >
          <Filter size={20} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    selectedFilter === filter.id
                      ? Colors.primary
                      : colors.surface,
                  borderColor:
                    selectedFilter === filter.id
                      ? Colors.primary
                      : colors.border,
                },
              ]}
              onPress={() => setSelectedFilter(filter.id)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      selectedFilter === filter.id
                        ? 'white'
                        : colors.textSecondary,
                  },
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginTop: 12, gap: 8 }}>
          <AlertTriangle size={14} color={colors.textSecondary} />
          <Text style={{ fontSize: 13, color: colors.textSecondary, fontFamily: 'Satoshi-Variable' }}>
            Patients appear here only after they approve access
          </Text>
        </View>
      </View>

      {/* Patients List */}
      <ScrollView
        style={styles.patientsList}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.patientsContainer}>
          {loading ? (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <View
                key={patient.id}
                style={[styles.patientCard, { backgroundColor: colors.surface }]}
              >
                <View style={[styles.patientHeader, { marginBottom: 12 }]}>
                  {patient.avatar ? (
                    <Image
                      source={{ uri: patient.avatar }}
                      style={styles.patientAvatar}
                    />
                  ) : (
                    <View style={[styles.patientAvatar, { backgroundColor: colors.surfaceSecondary, alignItems: 'center', justifyContent: 'center' }]}>
                      <User size={24} color={colors.textSecondary} />
                    </View>
                  )}
                  <View style={styles.patientInfo}>
                    <Text style={[styles.patientName, { color: colors.text }]}>
                      {patient.name}
                    </Text>
                    <Text
                      style={[
                        styles.patientDetails,
                        { color: colors.textSecondary, marginTop: 4 },
                      ]}
                    >
                      ID: {patient.patientId || 'N/A'}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: patient.accessStatus === 'Active'
                          ? 'rgba(34, 197, 94, 0.1)'
                          : 'rgba(239, 68, 68, 0.1)'
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: patient.accessStatus === 'Active'
                            ? Colors.medical.green
                            : Colors.medical.red
                        },
                      ]}
                    >
                      {patient.accessStatus}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <View style={[styles.patientActions, { borderTopColor: colors.border }]}>
                  <TouchableOpacity
                    style={[
                      styles.viewButton,
                      {
                        backgroundColor: colors.surfaceSecondary,
                        opacity: patient.accessStatus === 'Active' ? 1 : 0.5,
                      },
                    ]}
                    disabled={patient.accessStatus !== 'Active'}
                    onPress={() => router.push({
                      pathname: '/(healthcare-tabs)/records',
                      params: { patientUid: patient.id, patientName: patient.name }
                    })}
                  >
                    <FileText size={16} color={colors.textSecondary} />
                    <Text style={[styles.viewButtonText, { color: colors.textSecondary }]}>
                      View Records
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.viewButton,
                      {
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        maxWidth: 44,
                        paddingHorizontal: 0,
                      }
                    ]}
                    onPress={() => handleRemovePatient(patient.id, patient.name)}
                  >
                    <Trash2 size={20} color={Colors.medical.red} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={{ alignItems: 'center', justifyContent: 'center', padding: 40, marginTop: 40 }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16
              }}>
                <Users size={40} color={colors.textSecondary} />
              </View>
              <Text style={{
                fontSize: 18,
                fontFamily: 'Satoshi-Variable',
                fontWeight: '600',
                color: colors.text,
                marginBottom: 8
              }}>
                No patients yet
              </Text>
              <Text style={{
                textAlign: 'center',
                color: colors.textSecondary,
                fontFamily: 'Satoshi-Variable',
                lineHeight: 22,
                maxWidth: 260,
                marginBottom: 24
              }}>
                Request access using Patient ID to view patient records
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: Colors.primary,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                }}
                onPress={() => setShowRequestModal(true)}
              >
                <Plus size={18} color="white" />
                <Text style={{ color: 'white', fontFamily: 'Satoshi-Variable', fontWeight: '600', fontSize: 16 }}>
                  Request Patient Access
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Request Access Modal */}
      <Modal
        visible={showRequestModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRequestModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: colors.surface, borderRadius: 24, padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={{ fontSize: 20, fontFamily: 'Satoshi-Variable', fontWeight: '700', color: colors.text }}>
                Request Patient Access
              </Text>
              <TouchableOpacity onPress={() => setShowRequestModal(false)}>
                <Plus size={24} color={colors.textSecondary} style={{ transform: [{ rotate: '45deg' }] }} />
              </TouchableOpacity>
            </View>

            <Text style={{ color: colors.textSecondary, fontFamily: 'Satoshi-Variable', marginBottom: 24 }}>
              Enter the Patient ID to request access to their medical records. The patient will need to approve this request.
            </Text>

            <Text style={{ fontSize: 14, fontFamily: 'Satoshi-Variable', fontWeight: '600', color: colors.text, marginBottom: 8 }}>
              Patient ID
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.background,
                borderRadius: 12,
                padding: 16,
                color: colors.text,
                fontFamily: 'Satoshi-Variable',
                borderWidth: 1,
                borderColor: colors.border,
                marginBottom: 24,
              }}
              placeholder="e.g. SVP-123456"
              placeholderTextColor={colors.textSecondary}
              value={requestPatientId}
              onChangeText={setRequestPatientId}
              autoCapitalize="characters"
            />

            <TouchableOpacity
              style={{
                backgroundColor: Colors.primary,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: 'center',
              }}
              onPress={handleSendRequest}
            >
              {requestLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={{ color: 'white', fontFamily: 'Satoshi-Variable', fontWeight: '600', fontSize: 16 }}>
                  Send Request
                </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '700',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    fontFamily: 'Satoshi-Variable',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '500',
  },
  patientsList: {
    flex: 1,
  },
  patientsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  patientCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  patientHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  patientAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  patientInfo: {
    flex: 1,
  },
  patientNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  patientName: {
    fontSize: 18,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },
  patientDetails: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    marginBottom: 2,
  },
  patientCondition: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },
  patientDetailsRow: {
    marginBottom: 12,
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    marginLeft: 8,
  },
  patientActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
    color: Colors.primary,
  },
  viewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    gap: 6,
  },
  viewButtonText: {
    fontSize: 14,
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
    color: 'white',
  },
});
