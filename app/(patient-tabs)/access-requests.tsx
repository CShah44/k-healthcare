import { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    Modal,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Clock, User, Check, X, Shield, Lock } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/constants/firebase';
import { collection, query, where, onSnapshot, Timestamp, writeBatch, doc, serverTimestamp, updateDoc } from 'firebase/firestore';

interface AccessRequest {
    id: string;
    doctorName: string;
    specialty: string;
    timestamp: Date;
    avatar: string;
    expiresAt: Date;
    doctorId: string;
    patientId: string;
}

interface ActiveAccess {
    id: string;
    doctorId: string;
    doctorName: string;
    specialty: string;
    avatar: string;
    accessGrantedAt: Date;
    expiresAt: Date;
    active: boolean;
}

export default function AccessRequestsScreen() {
    const { colors } = useTheme();
    const router = useRouter();
    const { user } = useAuth();

    // State for access requests
    const [requests, setRequests] = useState<AccessRequest[]>([]);
    const [activeAccessList, setActiveAccessList] = useState<ActiveAccess[]>([]);
    const [activeTab, setActiveTab] = useState<'pending' | 'active'>('pending');

    // State for approval modal
    const [approvalModalVisible, setApprovalModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);
    const [selectedDuration, setSelectedDuration] = useState(7); // Default 7 days
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState(false);
    const [revoking, setRevoking] = useState(false);

    const DURATION_OPTIONS = [
        { label: '24 Hours', value: 1 },
        { label: '7 Days', value: 7 },
        { label: '30 Days', value: 30 },
        { label: '1 Year', value: 365 },
    ];

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'accessRequests'),
            where('patientUid', '==', user.uid),
            where('status', '==', 'pending')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const now = new Date();
            const fetchedRequests: AccessRequest[] = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                const expiresAt = data.expiresAt instanceof Timestamp ? data.expiresAt.toDate() : new Date(data.expiresAt); // Handle Timestamp or Date string

                // Only include requests that haven't expired
                if (expiresAt > now) {
                    fetchedRequests.push({
                        id: doc.id,
                        doctorName: data.doctorName || 'Unknown Doctor',
                        specialty: data.doctorSpecialty || 'General',
                        timestamp: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
                        avatar: data.doctorAvatar || 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=200', // Fallback
                        expiresAt: expiresAt,
                        doctorId: data.doctorId,
                        patientId: data.patientId,
                    });
                }
            });

            // Sort by most recent
            fetchedRequests.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

            setRequests(fetchedRequests);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching access requests:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    // Fetch Active Access List
    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, 'doctorAccess'),
            where('patientUid', '==', user.uid),
            where('active', '==', true)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const now = new Date();
            const fetchedAccess: ActiveAccess[] = [];

            snapshot.forEach((doc) => {
                const data = doc.data();
                const expiresAt = data.expiresAt instanceof Timestamp ? data.expiresAt.toDate() : new Date(data.expiresAt);

                if (expiresAt > now) {
                    fetchedAccess.push({
                        id: doc.id,
                        doctorId: data.doctorId,
                        doctorName: data.doctorName || 'Unknown Doctor',
                        specialty: data.specialty || 'General',
                        avatar: data.doctorAvatar || 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=200',
                        accessGrantedAt: data.accessGrantedAt instanceof Timestamp ? data.accessGrantedAt.toDate() : new Date(),
                        expiresAt: expiresAt,
                        active: data.active
                    });
                }
            });

            setActiveAccessList(fetchedAccess);
        }, (error) => {
            console.error("Error fetching active access:", error);
        });

        return () => unsubscribe();
    }, [user]);

    const handleApprove = (id: string, name: string) => {
        const request = requests.find(r => r.id === id);
        if (!request) return;

        setSelectedRequest(request);
        setApprovalModalVisible(true);
    };

    const confirmApproval = async () => {
        if (!selectedRequest || !user) return;

        try {
            setApproving(true);
            const batch = writeBatch(db);

            // 1. Mark request as approved
            const requestRef = doc(db, 'accessRequests', selectedRequest.id);
            batch.update(requestRef, { status: 'approved' });

            // 2. Create access record with more metadata
            const accessRef = doc(collection(db, 'doctorAccess'));
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + selectedDuration);

            batch.set(accessRef, {
                doctorId: selectedRequest.doctorId,
                doctorName: selectedRequest.doctorName,
                specialty: selectedRequest.specialty,
                doctorAvatar: selectedRequest.avatar,
                patientId: selectedRequest.patientId,
                patientUid: user.uid,
                accessGrantedAt: serverTimestamp(),
                expiresAt: Timestamp.fromDate(expiresAt),
                active: true
            });

            await batch.commit();

            setApprovalModalVisible(false);
            setSelectedRequest(null);

            Alert.alert('Access Granted', `You have granted access to ${selectedRequest.doctorName} for ${selectedDuration} days.`);
            // State updates automatically via onSnapshot
        } catch (error) {
            console.error('Error approving request:', error);
            Alert.alert('Error', 'Failed to approve request.');
        } finally {
            setApproving(false);
        }
    };

    const handleRevokeAccess = (accessId: string, doctorName: string) => {
        Alert.alert(
            'Revoke Access',
            `Are you sure you want to revoke access for ${doctorName}? They will no longer be able to view your records.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Revoke',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setRevoking(true);
                            await updateDoc(doc(db, 'doctorAccess', accessId), { active: false });
                            Alert.alert('Success', 'Access revoked successfully');
                        } catch (error) {
                            console.error('Error revoking access:', error);
                            Alert.alert('Error', 'Failed to revoke access');
                        } finally {
                            setRevoking(false);
                        }
                    }
                }
            ]
        );
    };

    const handleReject = (id: string, name: string) => {
        Alert.alert(
            'Reject Request',
            `Are you sure you want to reject the request from ${name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reject',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const batch = writeBatch(db);
                            const requestRef = doc(db, 'accessRequests', id);
                            batch.update(requestRef, { status: 'rejected' });
                            await batch.commit();
                            Alert.alert('Request Rejected', `You have rejected the request from ${name}.`);
                            // State updates automatically via onSnapshot
                        } catch (error) {
                            console.error('Error rejecting request:', error);
                            Alert.alert('Error', 'Failed to reject request.');
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: colors.surface }]}
                    onPress={() => router.back()}
                >
                    <ChevronLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                    Shared Access
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'pending' && styles.activeTab]}
                    onPress={() => setActiveTab('pending')}
                >
                    <Text style={[styles.tabText, activeTab === 'pending' && styles.activeTabText]}>
                        Requests ({requests.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'active' && styles.activeTab]}
                    onPress={() => setActiveTab('active')}
                >
                    <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
                        Shared Access
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {activeTab === 'pending' ? (
                    <>
                        <View style={styles.infoBox}>
                            <Shield size={20} color={Colors.primary} style={styles.infoIcon} />
                            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                                Doctors listed here are requesting access to your medical records.
                                Granting access will allow them to view your history and add new records.
                            </Text>
                        </View>

                        {loading ? (
                            <View style={{ padding: 40, alignItems: 'center' }}>
                                <ActivityIndicator size="large" color={Colors.primary} />
                                <Text style={{ marginTop: 16, color: colors.textSecondary, fontFamily: 'Satoshi-Variable' }}>
                                    Loading requests...
                                </Text>
                            </View>
                        ) : requests.length > 0 ? (
                            requests.map((request) => (
                                <View
                                    key={request.id}
                                    style={[styles.requestCard, { backgroundColor: colors.surface }]}
                                >
                                    <View style={styles.cardHeader}>
                                        <Image
                                            source={{ uri: request.avatar }}
                                            style={styles.avatar}
                                        />
                                        <View style={styles.doctorInfo}>
                                            <Text style={[styles.doctorName, { color: colors.text }]}>
                                                {request.doctorName}
                                            </Text>
                                            <Text style={[styles.specialty, { color: colors.textSecondary }]}>
                                                {request.specialty}
                                            </Text>
                                            <View style={styles.timeContainer}>
                                                <Clock size={12} color={colors.textSecondary} />
                                                <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
                                                    {formatDistanceToNow(request.timestamp, { addSuffix: true })}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                                    <View style={styles.actions}>
                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.rejectButton]}
                                            onPress={() => handleReject(request.id, request.doctorName)}
                                        >
                                            <X size={18} color={Colors.medical.red} />
                                            <Text style={styles.rejectText}>Reject</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.actionButton, styles.approveButton]}
                                            onPress={() => handleApprove(request.id, request.doctorName)}
                                        >
                                            <Check size={18} color="white" />
                                            <Text style={styles.approveText}>Approve</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
                                    <Lock size={40} color={colors.textSecondary} />
                                </View>
                                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                                    No Pending Requests
                                </Text>
                                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                                    You don't have any pending access requests at the moment.
                                </Text>
                            </View>
                        )}
                    </>
                ) : (
                    <>
                        <View style={[styles.infoBox, { backgroundColor: 'rgba(52, 211, 153, 0.1)' }]}>
                            <Check size={20} color={Colors.medical.green} style={styles.infoIcon} />
                            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                                These doctors currently have access to your medical records.
                                You can revoke their access at any time.
                            </Text>
                        </View>

                        {activeAccessList.length > 0 ? (
                            activeAccessList.map((access) => (
                                <View
                                    key={access.id}
                                    style={[styles.requestCard, { backgroundColor: colors.surface }]}
                                >
                                    <View style={styles.cardHeader}>
                                        <Image
                                            source={{ uri: access.avatar }}
                                            style={styles.avatar}
                                        />
                                        <View style={styles.doctorInfo}>
                                            <Text style={[styles.doctorName, { color: colors.text }]}>
                                                {access.doctorName}
                                            </Text>
                                            <Text style={[styles.specialty, { color: colors.textSecondary }]}>
                                                {access.specialty}
                                            </Text>
                                            <View style={styles.timeContainer}>
                                                <Clock size={12} color={colors.textSecondary} />
                                                <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
                                                    Expires: {access.expiresAt.toLocaleDateString()}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={{
                                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                            paddingHorizontal: 8,
                                            paddingVertical: 4,
                                            borderRadius: 6,
                                            alignSelf: 'flex-start'
                                        }}>
                                            <Text style={{
                                                fontSize: 12,
                                                fontFamily: 'Satoshi-Variable',
                                                fontWeight: '600',
                                                color: Colors.medical.green
                                            }}>
                                                Active
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                                    <TouchableOpacity
                                        style={[styles.actionButton, styles.rejectButton]}
                                        onPress={() => handleRevokeAccess(access.id, access.doctorName)}
                                    >
                                        <X size={18} color={Colors.medical.red} />
                                        <Text style={styles.rejectText}>Revoke Access</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface }]}>
                                    <Lock size={40} color={colors.textSecondary} />
                                </View>
                                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                                    No Active Access
                                </Text>
                                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                                    You haven't granted access to any doctors yet.
                                </Text>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>

            <Modal
                visible={approvalModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setApprovalModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: colors.text }]}>
                            Grant Access
                        </Text>
                        <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                            How long should {selectedRequest?.doctorName} have access to your records?
                        </Text>

                        <View style={styles.optionsContainer}>
                            {DURATION_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.optionButton,
                                        {
                                            borderColor: selectedDuration === option.value ? Colors.primary : colors.border,
                                            backgroundColor: selectedDuration === option.value ? 'rgba(56, 189, 248, 0.1)' : 'transparent'
                                        }
                                    ]}
                                    onPress={() => setSelectedDuration(option.value)}
                                >
                                    <View style={[
                                        styles.radioOuter,
                                        { borderColor: selectedDuration === option.value ? Colors.primary : colors.textSecondary }
                                    ]}>
                                        {selectedDuration === option.value && (
                                            <View style={[styles.radioInner, { backgroundColor: Colors.primary }]} />
                                        )}
                                    </View>
                                    <Text style={[
                                        styles.optionLabel,
                                        {
                                            color: selectedDuration === option.value ? Colors.primary : colors.text,
                                            fontWeight: selectedDuration === option.value ? '700' : '400'
                                        }
                                    ]}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: colors.border }]}
                                onPress={() => setApprovalModalVisible(false)}
                            >
                                <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, { backgroundColor: Colors.primary }]}
                                onPress={confirmApproval}
                            >
                                {approving ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text style={[styles.modalButtonText, { color: 'white' }]}>Confirm Access</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView >
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
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Satoshi-Variable',
        fontWeight: '700',
    },
    content: {
        flex: 1,
    },
    tabContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 10,
    },
    tab: {
        marginRight: 20,
        paddingBottom: 8,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: Colors.primary,
    },
    tabText: {
        fontSize: 16,
        fontFamily: 'Satoshi-Variable',
        color: '#666',
        fontWeight: '500',
    },
    activeTabText: {
        color: Colors.primary,
        fontWeight: '700',
    },
    contentContainer: {
        padding: 20,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: 'rgba(56, 189, 248, 0.1)',
        padding: 16,
        borderRadius: 12,
        marginBottom: 24,
        gap: 12,
    },
    infoIcon: {
        marginTop: 2,
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        fontFamily: 'Satoshi-Variable',
        lineHeight: 20,
    },
    requestCard: {
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 16,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
    },
    doctorInfo: {
        flex: 1,
        justifyContent: 'center',
    },
    doctorName: {
        fontSize: 16,
        fontFamily: 'Satoshi-Variable',
        fontWeight: '700',
        marginBottom: 4,
    },
    specialty: {
        fontSize: 14,
        fontFamily: 'Satoshi-Variable',
        marginBottom: 8,
    },
    timeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    timestamp: {
        fontSize: 12,
        fontFamily: 'Satoshi-Variable',
    },
    divider: {
        height: 1,
        width: '100%',
        marginBottom: 16,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    rejectButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
    },
    approveButton: {
        backgroundColor: Colors.primary,
    },
    rejectText: {
        fontSize: 14,
        fontFamily: 'Satoshi-Variable',
        fontWeight: '600',
        color: Colors.medical.red,
    },
    approveText: {
        fontSize: 14,
        fontFamily: 'Satoshi-Variable',
        fontWeight: '600',
        color: 'white',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        marginTop: 40,
    },
    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontFamily: 'Satoshi-Variable',
        fontWeight: '700',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        fontFamily: 'Satoshi-Variable',
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 240,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Satoshi-Variable',
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 14,
        fontFamily: 'Satoshi-Variable',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 20,
    },
    optionsContainer: {
        gap: 12,
        marginBottom: 24,
    },
    optionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        gap: 12,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    optionLabel: {
        fontSize: 16,
        fontFamily: 'Satoshi-Variable',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalButtonText: {
        fontSize: 16,
        fontFamily: 'Satoshi-Variable',
        fontWeight: '600',
    },
});
