import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ArrowLeft, Stethoscope } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/constants/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { createRecordsStyles } from '../../styles/records';

export default function DiagnosesScreen() {
    const { user } = useAuth();
    const { colors, isDarkMode } = useTheme();
    const styles = createRecordsStyles(colors, isDarkMode);

    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) return;

        const q = query(
            collection(db, 'patients', user.uid, 'records'),
            orderBy('uploadedAt', 'desc')
        );

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const allRecords = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                // Filter for diagnoses
                const diagnosisRecords = allRecords.filter(
                    (r: any) =>
                        r.diagnosis ||
                        r.tags?.includes('diagnosis') ||
                        r.type === 'diagnosis' ||
                        r.title?.toLowerCase().includes('diagnosis')
                );

                setRecords(diagnosisRecords);
                setLoading(false);
            },
            (error) => {
                console.error('Failed to fetch records:', error);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [user?.uid]);

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={Colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.header, { flexDirection: 'row', alignItems: 'center' }]}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <View style={{ marginLeft: 16 }}>
                    <Text style={styles.headerTitle}>Past Diagnoses</Text>
                    <Text style={styles.headerSubtitle}>{records.length} records</Text>
                </View>
            </View>

            <ScrollView
                style={styles.recordsList}
                contentContainerStyle={styles.recordsContent}
                showsVerticalScrollIndicator={false}
            >
                {records.length > 0 ? (
                    records.map((record) => (
                        <TouchableOpacity
                            key={record.id}
                            style={[styles.recordCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                            activeOpacity={0.9}
                        >
                            <View style={styles.recordCardContent}>
                                <View style={styles.recordMain}>
                                    <View style={styles.recordLeft}>
                                        <View style={[styles.recordIcon, { backgroundColor: '#FCE7F3' }]}>
                                            <Stethoscope size={20} color="#EC4899" />
                                        </View>
                                        <View style={styles.recordInfo}>
                                            <Text style={styles.recordTitle}>{record.title}</Text>
                                            <View style={styles.recordMetaRow}>
                                                <Text style={styles.recordSource}>
                                                    {record.date ? new Date(record.date).toLocaleDateString() : 'No date'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                                {record.description && (
                                    <Text style={[styles.recordDescription, { marginTop: 8, color: colors.textSecondary }]} numberOfLines={2}>
                                        {record.description}
                                    </Text>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyStateIconContainer, { backgroundColor: '#FCE7F3' }]}>
                            <Stethoscope size={48} color="#EC4899" />
                        </View>
                        <Text style={styles.emptyStateTitle}>No diagnoses recorded</Text>
                        <Text style={styles.emptyStateText}>
                            You haven't added any diagnosis records yet.
                        </Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
