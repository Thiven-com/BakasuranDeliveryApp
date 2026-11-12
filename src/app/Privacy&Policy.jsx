import { useState } from "react";

import {
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";

// Sample Privacy Policy content.
// Replace this with your company's approved privacy policy before publishing.

const PRIVACY_DATA = [
  {
    id: "1",
    title: "Information We Collect",
    description: "Details we collect when you use the app.",
    icon: "server-outline",
    color: "#F10D16",
    background: "#650B12",
    details: [
      "Personal information such as your name, mobile number and email address.",
      "Identity documents and verification information submitted during registration.",
      "Vehicle details, driving licence and registration information.",
      "Bank account details required for processing payments.",
      "Location information when required for delivery services and with the appropriate permissions.",
      "App usage, device and diagnostic information.",
    ],
  },
  {
    id: "2",
    title: "How We Use Your Information",
    description: "How your data is used to provide services.",
    icon: "lock-closed-outline",
    color: "#FFC107",
    background: "#715600",
    details: [
      "To create and manage your delivery partner account.",
      "To verify your identity and submitted documents.",
      "To assign orders and coordinate deliveries.",
      "To calculate earnings, incentives and process payouts.",
      "To communicate important updates and account notifications.",
      "To troubleshoot technical problems and improve app performance.",
      "To protect the platform against fraud and misuse.",
    ],
  },
  {
    id: "3",
    title: "Information Sharing",
    description: "When and with whom we may share your data.",
    icon: "share-social-outline",
    color: "#03A9F4",
    background: "#064B70",
    details: [
      "Relevant delivery information may be shared with customers to complete orders.",
      "Information may be shared with restaurants and delivery service partners when necessary.",
      "Payment details may be shared with authorised payment service providers.",
      "Information may be disclosed when required by applicable law or a valid legal request.",
      "We do not intend to sell your personal information.",
    ],
  },
  {
    id: "4",
    title: "Data Security",
    description: "How we protect your personal information.",
    icon: "shield-checkmark-outline",
    color: "#D946EF",
    background: "#581078",
    details: [
      "We aim to use appropriate technical and organisational security measures.",
      "Access to personal information should be limited to authorised personnel.",
      "Sensitive account information should be protected against unauthorised access.",
      "No electronic storage or internet transmission method can be guaranteed to be completely secure.",
      "Please keep your login credentials confidential.",
    ],
  },
  {
    id: "5",
    title: "Your Rights & Choices",
    description: "Your control over your personal data.",
    icon: "person-outline",
    color: "#00C853",
    background: "#075D29",
    details: [
      "You may request access to your personal information.",
      "You may request correction of inaccurate account details.",
      "You may request information about how your data is processed.",
      "You may contact support regarding privacy-related concerns.",
      "You may request account closure, subject to applicable legal and operational retention requirements.",
    ],
  },
  {
    id: "6",
    title: "Cookies & App Tracking",
    description: "Use of cookies and similar technologies.",
    icon: "eye-outline",
    color: "#F06292",
    background: "#791638",
    details: [
      "The app or its web services may use technologies that help maintain sessions.",
      "Diagnostic information may be collected to identify errors and improve performance.",
      "Analytics technologies may be used if enabled in the application.",
      "Device and permission settings may affect certain app features.",
    ],
  },
  {
    id: "7",
    title: "Policy Updates",
    description: "Changes to this Privacy Policy and how we inform you.",
    icon: "document-text-outline",
    color: "#00BCD4",
    background: "#075B65",
    details: [
      "This Privacy Policy may be updated when our practices or legal requirements change.",
      "The latest version should be made available through the app or our website.",
      "Important changes may be communicated through appropriate notifications.",
      "The effective date will be updated when a revised policy is published.",
    ],
  },
];

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  const [expandedSection, setExpandedSection] = useState(null);

  // Expand or collapse a policy section

  const handleSectionPress = (id) => {
    setExpandedSection((previous) => (previous === id ? null : id));
  };

  // Policy section component

  const PolicyCard = ({ item, index }) => {
    const isExpanded = expandedSection === item.id;

    return (
      <View style={styles.policyCard}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.policyCardHeader}
          onPress={() => handleSectionPress(item.id)}
        >
          {/* ICON */}

          <View
            style={[styles.policyIcon, { backgroundColor: item.background }]}
          >
            <Ionicons name={item.icon} size={30} color={item.color} />
          </View>

          {/* CONTENT */}

          <View style={styles.policyContent}>
            <Text style={styles.policyTitle}>
              {index + 1}. {item.title}
            </Text>

            <Text style={styles.policyDescription}>{item.description}</Text>
          </View>

          {/* ARROW */}

          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-forward"}
            size={24}
            color={Colors.white}
          />
        </TouchableOpacity>

        {/* EXPANDED CONTENT */}

        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.expandedDivider} />

            {item.details.map((detail, detailIndex) => (
              <View key={detailIndex} style={styles.detailRow}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={19}
                  color={Colors.primary}
                />

                <Text style={styles.detailText}>{detail}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <LinearGradient
        colors={Colors.gradients.background}
        style={styles.background}
      >
        <View style={styles.container}>
          {/* HEADER */}

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={28} color={Colors.white} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Privacy Policy</Text>

            <View style={styles.headerRight} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* HERO SECTION */}

            <View style={styles.heroSection}>
              <LinearGradient
                colors={["#450909", "#180303", "#050505"]}
                style={styles.heroCircle}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={105}
                  color={Colors.white}
                />

                <View style={styles.heroLock}>
                  <Ionicons
                    name="lock-closed"
                    size={31}
                    color={Colors.primary}
                  />
                </View>
              </LinearGradient>

              <Text style={styles.heroTitle}>Bakasuran Delivery Partner</Text>

              <Text style={styles.heroSubtitle}>Privacy Policy</Text>
            </View>

            {/* POLICY SECTIONS */}

            <View style={styles.policyContainer}>
              {PRIVACY_DATA.map((item, index) => (
                <PolicyCard key={item.id} item={item} index={index} />
              ))}
            </View>

            {/* PRIVACY NOTICE */}

            <LinearGradient
              colors={["#260606", "#100303"]}
              style={styles.privacyNotice}
            >
              <View style={styles.noticeIcon}>
                <Ionicons
                  name="information-circle-outline"
                  size={34}
                  color={Colors.white}
                />
              </View>

              <Text style={styles.noticeText}>
                We value your privacy and are committed to protecting your
                personal information. Please read this policy carefully to
                understand our data practices.
              </Text>
            </LinearGradient>

            {/* LAST UPDATED */}

            <View style={styles.updatedContainer}>
              <Ionicons
                name="calendar-outline"
                size={24}
                color={Colors.primary}
              />

              <Text style={styles.updatedText}>
                Last Updated: 12 November 2026
              </Text>
            </View>

            {/* FOOTER */}

            <Text style={styles.footerText}>BAKASURAN DELIVERY PARTNER</Text>
          </ScrollView>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  background: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },

  // HEADER

  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  backButton: {
    width: 40,
    alignItems: "flex-start",
  },

  headerTitle: {
    color: Colors.white,
    fontSize: 21,
    fontFamily: Fonts.extraBold,
  },

  headerRight: {
    width: 40,
  },

  // HERO SECTION

  heroSection: {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 28,
  },

  heroCircle: {
    width: 195,
    height: 195,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  heroLock: {
    position: "absolute",
    bottom: 23,
    right: 27,
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.background,
  },

  heroTitle: {
    color: Colors.white,
    fontSize: 21,
    fontFamily: Fonts.extraBold,
    textAlign: "center",
    marginTop: 12,
  },

  heroSubtitle: {
    color: Colors.textSecondary,
    fontSize: 17,
    fontFamily: Fonts.regular,
    marginTop: 5,
  },

  // POLICY CARDS

  policyContainer: {
    gap: 12,
  },

  policyCard: {
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    overflow: "hidden",
  },

  policyCardHeader: {
    minHeight: 105,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 13,
    gap: 12,
  },

  policyIcon: {
    width: 62,
    height: 62,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  policyContent: {
    flex: 1,
  },

  policyTitle: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: Fonts.bold,
    marginBottom: 5,
  },

  policyDescription: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: Fonts.regular,
    lineHeight: 19,
  },

  // EXPANDED DETAILS

  expandedContent: {
    paddingHorizontal: 15,
    paddingBottom: 16,
  },

  expandedDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 13,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
    marginBottom: 12,
  },

  detailText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: Fonts.regular,
    lineHeight: 20,
  },

  // PRIVACY NOTICE

  privacyNotice: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 17,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    marginTop: 28,
  },

  noticeIcon: {
    width: 65,
    height: 65,
    borderRadius: 15,
    backgroundColor: Colors.primaryDark,
    justifyContent: "center",
    alignItems: "center",
  },

  noticeText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: Fonts.regular,
    lineHeight: 21,
  },

  // LAST UPDATED

  updatedContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginTop: 28,
  },

  updatedText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: Fonts.medium,
  },

  // FOOTER

  footerText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: Fonts.bold,
    letterSpacing: 1.5,
    textAlign: "center",
    marginTop: 25,
  },
});
