import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Modal,
  Image,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  FileText,
  Search,
  Plus,
  Clock,
  Eye,
  X,
} from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { db } from '@/constants/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  where,
  Timestamp,
} from 'firebase/firestore';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function DoctorRecordsScreen() {
  const { patientUid, patientName } = useLocalSearchParams<{
    patientUid: string;
    patientName: string;
  }>();
  const { user } = useAuth();
  const { colors } = useTheme();

  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [accessData, setAccessData] = useState<any>(null);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  // Fetch Access Data
  useEffect(() => {
    if (!user?.uid || !patientUid) return;
    const q = query(
      collection(db, 'doctorAccess'),
      where('doctorId', '==', user.uid),
      where('patientUid', '==', patientUid),
      where('active', '==', true),
    );
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setAccessData(snapshot.docs[0].data());
      } else {
        setAccessData(null);
        // Don't auto-back immediately to allow reading existing state if needed, but usually good to warn
      }
    });
    return () => unsub();
  }, [user, patientUid]);

  // Fetch Records
  useEffect(() => {
    if (!patientUid) return;
    // Ensure path is correct: patients/{uid}/records
    const q = query(
      collection(db, 'patients', patientUid, 'records'),
      orderBy('date', 'desc'),
    );
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecords(fetched);
        setLoading(false);
      },
      (err) => {
        console.error('Fetch records error:', err);
        setLoading(false);
      },
    );
    return () => unsub();
  }, [patientUid]);

  const getExpirationText = () => {
    if (!accessData?.expiresAt) return 'Checking access...';
    const expireTime =
      accessData.expiresAt instanceof Timestamp
        ? accessData.expiresAt.toDate()
        : new Date(accessData.expiresAt);
    const now = new Date();
    const diffMs = expireTime.getTime() - now.getTime();
    const diffHrs = Math.ceil(diffMs / (1000 * 60 * 60));

    if (diffHrs < 0) return 'Expired';
    if (diffHrs > 24) return `${Math.ceil(diffHrs / 24)} days left`;
    return `${diffHrs} hours left`;
  };

  const handleViewRecord = (record: any) => {
    setSelectedRecord(record);
    setViewerVisible(true);
  };

  const filteredRecords = records.filter(
    (r) =>
      (r.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.type || '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface }]}
        onPress={() => handleViewRecord(item)}
      >
        <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
          <FileText size={20} color="#3B82F6" />
        </View>
        <View style={styles.cardContent}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.title || 'Untitled'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {new Date(item.date).toLocaleDateString()} •{' '}
            {item.type || 'General'}
          </Text>
        </View>
        <Eye size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {patientName || 'Patient Records'}
          </Text>
          <View style={styles.badge}>
            <Clock size={12} color="#F59E0B" />
            <Text style={styles.badgeText}>{getExpirationText()}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            router.push({
              pathname: '/(healthcare-tabs)/create-prescription',
              params: { patientUid, patientName },
            })
          }
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Search records..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* List */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color={Colors.primary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={filteredRecords}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[{ color: colors.textSecondary }]}>
                No records found.
              </Text>
            </View>
          }
        />
      )}

      {/* Viewer Modal */}
      <Modal
        visible={viewerVisible}
        animationType="slide"
        onRequestClose={() => setViewerVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
          <View style={styles.viewerHeader}>
            <TouchableOpacity
              onPress={() => setViewerVisible(false)}
              style={styles.closeButton}
            >
              <X size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.viewerTitle} numberOfLines={1}>
              {selectedRecord?.title}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            {selectedRecord?.fileUrl ? (
              Platform.OS === 'web' ? (
                selectedRecord.fileType === 'application/pdf' ? (
                  <iframe
                    src={selectedRecord.fileUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="PDF Viewer"
                  />
                ) : (
                  <Image
                    source={{ uri: selectedRecord.fileUrl }}
                    style={{ flex: 1, width: '100%', height: '100%' }}
                    resizeMode="contain"
                  />
                )
              ) : selectedRecord.fileType === 'application/pdf' ? (
                <WebView
                  source={{ uri: selectedRecord.fileUrl }}
                  style={{ flex: 1 }}
                />
              ) : (
                <Image
                  source={{ uri: selectedRecord.fileUrl }}
                  style={{ flex: 1 }}
                  resizeMode="contain"
                />
              )
            ) : (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: 'white' }}>
                  Content not supported or empty.
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  backButton: { padding: 4 },
  headerInfo: { flex: 1 },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Satoshi-Variable',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#F59E0B',
    fontFamily: 'Satoshi-Variable',
    fontWeight: '600',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: { padding: 16 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Satoshi-Variable',
  },
  list: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: { flex: 1 },
  title: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Satoshi-Variable',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Satoshi-Variable',
  },
  empty: {
    alignItems: 'center',
    marginTop: 40,
  },
  viewerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  closeButton: { padding: 4 },
  viewerTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
});
