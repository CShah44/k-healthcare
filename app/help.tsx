import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, HelpCircle, Mail, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useState } from 'react';

export default function HelpSupportScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    const [expandedId, setExpandedId] = useState<string | null>(null);

    const faqs = [
        {
            id: 'upload',
            question: 'How do I upload medical records?',
            answer: 'Go to the "Records" tab at the bottom of the screen. Tap the "+" (Plus) button, then select "Upload Record". You can choose a file from your device or take a photo.',
        },
        {
            id: 'share',
            question: 'How do I share records with a doctor?',
            answer: 'Sharing is done by granting access. When a doctor requests access, you will see it in the "Shared Access" section of your Profile. Tap "Approve" to let them see your records.',
        },
        {
            id: 'revoke',
            question: 'How do I stop sharing with a doctor?',
            answer: 'Go to Profile > Shared Access. You will see a list of doctors who can view your data. Tap "Revoke Access" on the doctor you wish to remove.',
        },
        {
            id: 'mistake',
            question: 'I gave access by mistake. What do I do?',
            answer: 'Don\'t worry! You can revoke access immediately. Follow the steps above to revoke access, and the doctor will lose permission instantly.',
        },
        {
            id: 'delete',
            question: 'How do I delete a record?',
            answer: 'Navigate to the "Records" tab used to view your files. Find the record you want to remove, tap the delete (trash can) icon, and confirm your choice.',
        },
    ];

    const handleEmailSupport = () => {
        Linking.openURL('mailto:support@svastheya.com');
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: colors.surface }]}
                    onPress={() => router.back()}
                >
                    <ChevronLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Help & Support</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.introContainer}>
                    <Text style={[styles.introTitle, { color: colors.text }]}>How can we help?</Text>
                    <Text style={[styles.introText, { color: colors.textSecondary }]}>
                        Find answers to common questions or get in touch with our team.
                    </Text>
                </View>

                <View style={styles.sectionTitleContainer}>
                    <HelpCircle size={20} color={Colors.primary} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
                </View>

                <View style={styles.faqContainer}>
                    {faqs.map((faq) => (
                        <View key={faq.id} style={[styles.faqCard, { backgroundColor: colors.surface }]}>
                            <TouchableOpacity
                                style={styles.faqHeader}
                                onPress={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                            >
                                <Text style={[styles.questionText, { color: colors.text }]}>{faq.question}</Text>
                                {expandedId === faq.id ? (
                                    <ChevronUp size={20} color={colors.textSecondary} />
                                ) : (
                                    <ChevronDown size={20} color={colors.textSecondary} />
                                )}
                            </TouchableOpacity>
                            {expandedId === faq.id && (
                                <View style={styles.answerContainer}>
                                    <Text style={[styles.answerText, { color: colors.textSecondary }]}>
                                        {faq.answer}
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                <View style={styles.contactContainer}>
                    <Text style={[styles.contactTitle, { color: colors.text }]}>Still need help?</Text>
                    <TouchableOpacity
                        style={[styles.contactCard, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}
                        onPress={handleEmailSupport}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: Colors.primary }]}>
                            <Mail size={24} color="white" />
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={[styles.contactMethod, { color: colors.text }]}>Email Support</Text>
                            <Text style={[styles.contactDetail, { color: colors.textSecondary }]}>support@svastheya.com</Text>
                            <Text style={[styles.contactTime, { color: colors.textSecondary }]}>Replies within 24 hours</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
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
    introContainer: {
        padding: 24,
        marginBottom: 8,
    },
    introTitle: {
        fontSize: 28,
        fontFamily: 'Satoshi-Variable',
        fontWeight: '700',
        marginBottom: 8,
    },
    introText: {
        fontSize: 16,
        fontFamily: 'Satoshi-Variable',
        lineHeight: 24,
    },
    sectionTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: 16,
        gap: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Satoshi-Variable',
        fontWeight: '700',
    },
    faqContainer: {
        paddingHorizontal: 20,
        gap: 12,
        marginBottom: 32,
    },
    faqCard: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        gap: 16,
    },
    questionText: {
        flex: 1,
        fontSize: 16,
        fontFamily: 'Satoshi-Variable',
        fontWeight: '600',
        lineHeight: 22,
    },
    answerContainer: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 0,
    },
    answerText: {
        fontSize: 15,
        fontFamily: 'Satoshi-Variable',
        lineHeight: 22,
    },
    contactContainer: {
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    contactTitle: {
        fontSize: 18,
        fontFamily: 'Satoshi-Variable',
        fontWeight: '700',
        marginBottom: 16,
        marginLeft: 4,
    },
    contactCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 20,
        gap: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    contactInfo: {
        flex: 1,
    },
    contactMethod: {
        fontSize: 16,
        fontFamily: 'Satoshi-Variable',
        fontWeight: '700',
        marginBottom: 2,
    },
    contactDetail: {
        fontSize: 15,
        fontFamily: 'Satoshi-Variable',
        marginBottom: 4,
    },
    contactTime: {
        fontSize: 12,
        fontFamily: 'Satoshi-Variable',
    },
});
