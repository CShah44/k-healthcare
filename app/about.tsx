import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, ShieldCheck, Share2, UserCheck, HeartHandshake } from 'lucide-react-native';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';

export default function AboutScreen() {
    const { colors } = useTheme();
    const router = useRouter();

    const features = [
        {
            icon: ShieldCheck,
            title: 'Secure Storage',
            description: 'Your medical history, safe and encrypted in one place.',
        },
        {
            icon: Share2,
            title: 'Easy Sharing',
            description: 'Share records with doctors instantly, only when you need to.',
        },
        {
            icon: UserCheck,
            title: 'Full Control',
            description: 'You decide who sees your data. You own your health journey.',
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
                <Text style={[styles.headerTitle, { color: colors.text }]}>About Svastheya</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.heroContainer}>
                    <View style={[styles.logoContainer, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                        <HeartHandshake size={48} color={Colors.primary} />
                    </View>
                    <Text style={[styles.heroTitle, { color: colors.text }]}>
                        A secure space for your health journey.
                    </Text>
                    <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
                        Svastheya connects you with your healthcare providers while keeping your data private and secure.
                    </Text>
                </View>

                <View style={styles.featuresContainer}>
                    {features.map((feature, index) => (
                        <View key={index} style={[styles.featureCard, { backgroundColor: colors.surface }]}>
                            <View style={[styles.iconContainer, { backgroundColor: 'rgba(56, 189, 248, 0.1)' }]}>
                                <feature.icon size={24} color={Colors.primary} />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={[styles.featureTitle, { color: colors.text }]}>{feature.title}</Text>
                                <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
                                    {feature.description}
                                </Text>
                            </View>
                        </View>
                    ))}
                </View>

                <View style={[styles.trustContainer, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.trustText, { color: colors.textSecondary }]}>
                        We prioritize your privacy above all else. Your trust is our foundation.
                    </Text>
                </View>

                <View style={styles.versionContainer}>
                    <Text style={[styles.versionText, { color: colors.textSecondary }]}>
                        Version 1.0.0
                    </Text>
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
    heroContainer: {
        alignItems: 'center',
        padding: 32,
        marginBottom: 8,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    heroTitle: {
        fontSize: 24,
        fontFamily: 'Satoshi-Variable',
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 12,
        lineHeight: 32,
    },
    heroSubtitle: {
        fontSize: 16,
        fontFamily: 'Satoshi-Variable',
        textAlign: 'center',
        lineHeight: 24,
        maxWidth: '90%',
    },
    featuresContainer: {
        paddingHorizontal: 20,
        gap: 16,
        marginBottom: 32,
    },
    featureCard: {
        flexDirection: 'row',
        borderRadius: 20,
        padding: 20,
        gap: 16,
        alignItems: 'center',
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
    textContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 18,
        fontFamily: 'Satoshi-Variable',
        fontWeight: '700',
        marginBottom: 4,
    },
    featureDescription: {
        fontSize: 14,
        fontFamily: 'Satoshi-Variable',
        lineHeight: 20,
    },
    trustContainer: {
        marginHorizontal: 20,
        padding: 24,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    trustText: {
        fontSize: 16,
        fontFamily: 'Satoshi-Variable',
        fontStyle: 'italic',
        textAlign: 'center',
        lineHeight: 24,
    },
    versionContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    versionText: {
        fontSize: 14,
        fontFamily: 'Satoshi-Variable',
    },
});
