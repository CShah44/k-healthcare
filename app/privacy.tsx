import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Shield, Lock, EyeOff, UserCheck } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

export default function PrivacySecurityScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    const sections = [
        {
            icon: Lock,
            title: 'Your Data is Secure',
            content: 'Your health records are encrypted using advanced security standards. This means your personal information and medical history are scrambled and unreadable to anyone without authorized access. We verify every request to ensure your data stays safe.',
        },
        {
            icon: UserCheck,
            title: 'You Are in Control',
            content: 'Your medical records are yours. Doctors can only view your data if you explicitly grant them access. You can choose to share your records for a specific time period, and you have the power to revoke this access instantly at any time from your profile.',
        },
        {
            icon: EyeOff,
            title: 'Private by Design',
            content: 'We strictly protect your privacy. Hospital administrators, technical support staff, and other systems cannot view your private medical details. Your records are not sold or shared with third parties without your clear consent.',
        },
        {
            icon: Shield,
            title: 'Secure Technology',
            content: 'Our platform is built with industry-leading security measures to protect against unauthorized access. We continuously monitor our systems to prevent security threats and keep your account safe.',
        },
    ];

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: colors.surface }]}
                    onPress={() => router.back()}
                >
                    <ChevronLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy & Security</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.introContainer}>
                    <View style={[styles.shieldContainer, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                        <Shield size={48} color={Colors.primary} />
                    </View>
                    <Text style={[styles.introTitle, { color: colors.text }]}>Your Privacy Matters</Text>
                    <Text style={[styles.introText, { color: colors.textSecondary }]}>
                        We believe your health data belongs to you. Our security measures ensures that you always stay in control.
                    </Text>
                </View>

                <View style={styles.sectionsContainer}>
                    {sections.map((section, index) => (
                        <View key={index} style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                                <section.icon size={24} color={Colors.primary} />
                            </View>
                            <View style={styles.sectionContent}>
                                <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
                                <Text style={[styles.sectionText, { color: colors.textSecondary }]}>
                                    {section.content}
                                </Text>
                            </View>
                        </View>
                    ))}
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
        alignItems: 'center',
        padding: 24,
        marginBottom: 8,
    },
    shieldContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    introTitle: {
        fontSize: 24,
        fontFamily: 'Satoshi-Variable',
        fontWeight: '700',
        marginBottom: 8,
        textAlign: 'center',
    },
    introText: {
        fontSize: 16,
        fontFamily: 'Satoshi-Variable',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: '90%',
    },
    sectionsContainer: {
        paddingHorizontal: 20,
        gap: 16,
    },
    sectionCard: {
        borderRadius: 20,
        padding: 20,
        flexDirection: 'row',
        gap: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionContent: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontFamily: 'Satoshi-Variable',
        fontWeight: '700',
        marginBottom: 8,
    },
    sectionText: {
        fontSize: 14,
        fontFamily: 'Satoshi-Variable',
        lineHeight: 22,
    },
});
