import { useState } from "react";

import {
  Alert,
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

// Sample terms content.
// Replace with your company's approved legal terms before publishing.

const TERMS_DATA = [
  {
    id: "1",
    title: "Eligibility",
    description:
      "You must be 18 years or above and have valid documents to become a delivery partner.",
    icon: "people-outline",
    color: "#F10D16",
    background: "#650B12",
    details: [
      "You must be at least 18 years old.",
      "You must provide accurate personal information during registration.",
      "You must complete the required identity verification process.",
      "You must comply with applicable laws and regulations.",
    ],
  },
  {
    id: "2",
    title: "Vehicle & Documents",
    description:
      "You must have a valid driving licence, vehicle registration and insurance.",
    icon: "bicycle-outline",
    color: "#FFC107",
    background: "#715600",
    details: [
      "Maintain a valid driving licence for your vehicle category.",
      "Keep your vehicle registration certificate up to date.",
      "Maintain valid vehicle insurance wherever required.",
      "Keep your vehicle in safe and roadworthy condition.",
      "Submit genuine documents for verification.",
    ],
  },
  {
    id: "3",
    title: "Work & Conduct",
    description:
      "Maintain professional behaviour, deliver orders safely and follow platform guidelines.",
    icon: "briefcase-outline",
    color: "#03A9F4",
    background: "#064B70",
    details: [
      "Treat customers, restaurant staff and support teams respectfully.",
      "Follow delivery instructions and applicable traffic rules.",
      "Handle food packages carefully during delivery.",
      "Do not misuse customer information.",
      "Report delivery problems through the official support process.",
    ],
  },
  {
    id: "4",
    title: "Earnings & Payments",
    description:
      "You will earn based on completed deliveries, incentives and applicable bonus programs.",
    icon: "wallet-outline",
    color: "#D946EF",
    background: "#581078",
    details: [
      "Delivery earnings are calculated according to the applicable payout policy.",
      "Incentives are subject to their individual eligibility conditions.",
      "Payments are processed using the registered payment details.",
      "You are responsible for providing accurate bank information.",
      "Applicable deductions or adjustments will be communicated according to company policy.",
    ],
  },
  {
    id: "5",
    title: "Account & Data",
    description:
      "Keep your account secure and provide accurate and up-to-date information.",
    icon: "shield-checkmark-outline",
    color: "#00C853",
    background: "#075D29",
    details: [
      "Keep your login credentials confidential.",
      "Do not share your account with another person.",
      "Update your personal and bank details when they change.",
      "Use customer information only for fulfilling delivery responsibilities.",
      "Refer to the Privacy Policy for information about personal data handling.",
    ],
  },
  {
    id: "6",
    title: "Restrictions",
    description:
      "Activities like order fraud, misuse of the app or violating policies may lead to account suspension.",
    icon: "ban-outline",
    color: "#F06292",
    background: "#791638",
    details: [
      "Do not create fake orders or manipulate delivery records.",
      "Do not submit false documents or misleading information.",
      "Do not misuse customer or business information.",
      "Do not engage in fraudulent payment or incentive activities.",
      "Policy violations may result in investigation or account action under applicable procedures.",
    ],
  },
  {
    id: "7",
    title: "Updates to Terms",
    description:
      "We may update these terms. Continued use of the app is subject to applicable updated terms.",
    icon: "document-text-outline",
    color: "#00BCD4",
    background: "#075B65",
    details: [
      "Terms may be updated when business or legal requirements change.",
      "Important changes should be communicated through appropriate channels.",
      "The latest published version should be reviewed regularly.",
      "Where required, your renewed acceptance will be requested.",
    ],
  },
];

export default function TermsScreen() {
  const router = useRouter();

  const [expandedSection, setExpandedSection] = useState(null);
  const [isAccepted, setIsAccepted] = useState(false);

  // Expand or collapse a terms section

  const handleSectionPress = (id) => {
    setExpandedSection((previous) => (previous === id ? null : id));
  };

  // Privacy Policy navigation

  const handlePrivacyPolicy = () => {
    router.push("/privacy-policy");
  };

  // Accept terms

  const handleAcceptTerms = () => {
    if (!isAccepted) {
      Alert.alert(
        "Agreement Required",
        "Please confirm that you have read and agree to the Terms & Conditions.",
      );
      return;
    }

    Alert.alert(
      "Terms Accepted",
      "Your agreement has been recorded in this demo screen.",
      [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ],
    );
  };

  // Terms section card

  const TermsCard = ({ item, index }) => {
    const isExpanded = expandedSection === item.id;

    return (
      <View style={styles.termsCard}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.termsCardHeader}
          onPress={() => handleSectionPress(item.id)}
        >
          {/* ICON */}

          <View
            style={[styles.termsIcon, { backgroundColor: item.background }]}
          >
            <Ionicons name={item.icon} size={31} color={item.color} />
          </View>

          {/* CONTENT */}

          <View style={styles.termsContent}>
            <Text style={styles.termsTitle}>
              {index + 1}. {item.title}
            </Text>

            <Text style={styles.termsDescription}>{item.description}</Text>
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

            <Text style={styles.headerTitle}>Terms & Conditions</Text>

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
                  name="document-text"
                  size={100}
                  color={Colors.white}
                />

                <View style={styles.heroCheck}>
                  <Ionicons name="checkmark" size={27} color={Colors.white} />
                </View>
              </LinearGradient>

              <Text style={styles.heroTitle}>Bakasuran Delivery Partner</Text>

              <Text style={styles.heroSubtitle}>Terms & Conditions</Text>
            </View>

            {/* TERMS SECTIONS */}

            <View style={styles.termsContainer}>
              {TERMS_DATA.map((item, index) => (
                <TermsCard key={item.id} item={item} index={index} />
              ))}
            </View>

            {/* PRIVACY POLICY */}

            <View style={styles.privacyContainer}>
              <Text style={styles.privacyText}>
                By using the Bakasuran Delivery Partner app, you agree to these
                Terms & Conditions and our{" "}
              </Text>

              <TouchableOpacity onPress={handlePrivacyPolicy}>
                <Text style={styles.privacyLink}>Privacy Policy</Text>
              </TouchableOpacity>

              <Text style={styles.privacyText}>.</Text>
            </View>

            {/* ACCEPTANCE CHECKBOX */}

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.acceptRow}
              onPress={() => setIsAccepted(!isAccepted)}
            >
              <View
                style={[styles.checkbox, isAccepted && styles.checkedCheckbox]}
              >
                {isAccepted && (
                  <Ionicons name="checkmark" size={18} color={Colors.white} />
                )}
              </View>

              <Text style={styles.acceptText}>
                I have read and agree to the Terms & Conditions.
              </Text>
            </TouchableOpacity>

            {/* ACCEPT BUTTON */}

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.buttonWrapper}
              onPress={handleAcceptTerms}
            >
              <LinearGradient
                colors={Colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.acceptButton}
              >
                <Ionicons name="checkmark" size={29} color={Colors.white} />

                <Text style={styles.acceptButtonText}>I Agree & Continue</Text>
              </LinearGradient>
            </TouchableOpacity>

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
    fontSize: 25,
    fontFamily: Fonts.regular
  },

  headerRight: {
    width: 40,
  },

  // HERO

  heroSection: {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 28,
  },

  heroCircle: {
    width: 190,
    height: 190,
    borderRadius: 95,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  heroCheck: {
    position: "absolute",
    bottom: 15,
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primary,
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

  // TERMS CARDS

  termsContainer: {
    gap: 12,
  },

  termsCard: {
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 21,
    overflow: "hidden",
  },

  termsCardHeader: {
    minHeight: 45,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    paddingVertical: 13,
    gap: 12,
  },

  termsIcon: {
    width: 62,
    height: 62,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  termsContent: {
    flex: 1,
  },

  termsTitle: {
    color: Colors.white,
    fontSize: 17,
    fontFamily: Fonts.regular,
    marginBottom: 5,
  },

  termsDescription: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: Fonts.regular,
    lineHeight: 19,
  },

  // EXPANDED CONTENT

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

  // PRIVACY POLICY

  privacyContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
    paddingHorizontal: 8,
  },

  privacyText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: Fonts.regular,
    lineHeight: 23,
    textAlign: "center",
  },

  privacyLink: {
    color: Colors.primary,
    fontSize: 13,
    fontFamily: Fonts.bold,
    textDecorationLine: "underline",
  },

  // ACCEPT CHECKBOX

  acceptRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginTop: 22,
    paddingHorizontal: 5,
  },

  checkbox: {
    width: 23,
    height: 23,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    justifyContent: "center",
    alignItems: "center",
  },

  checkedCheckbox: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  acceptText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: Fonts.medium,
  },

  // ACCEPT BUTTON

  buttonWrapper: {
    marginTop: 22,
    borderRadius: 16,
    overflow: "hidden",
  },

  acceptButton: {
    height: 66,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 13,
  },

  acceptButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontFamily: Fonts.extraBold,
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
