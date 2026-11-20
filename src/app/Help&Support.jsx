import { useState } from "react";

import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";

const SUPPORT_CATEGORIES = [
  {
    id: "1",
    title: "Order Related Issue",
    description: "Issues with orders, delivery or customers",
    icon: "cube-outline",
    color: "#F10D16",
    background: "#650B12",
  },
  {
    id: "2",
    title: "Earnings & Payouts",
    description: "Payment, incentives and payout issues",
    icon: "wallet-outline",
    color: "#FFC107",
    background: "#715600",
  },
  {
    id: "3",
    title: "Account & Verification",
    description: "Profile, documents and account access",
    icon: "person-outline",
    color: "#03A9F4",
    background: "#064B70",
  },
  {
    id: "4",
    title: "Vehicle Related Issue",
    description: "Vehicle verification and related updates",
    icon: "bicycle-outline",
    color: "#D946EF",
    background: "#581078",
  },
  {
    id: "5",
    title: "App & Technical Issue",
    description: "App not working, login or other technical issues",
    icon: "settings-outline",
    color: "#00BCD4",
    background: "#075B65",
  },
  {
    id: "6",
    title: "Other Issue",
    description: "Report any other problem or share feedback",
    icon: "chatbubble-ellipses-outline",
    color: "#BBBBBB",
    background: "#454545",
  },
];

export default function SupportScreen() {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState(null);

  // Call support
  const handleCallSupport = () => {
    Alert.alert(
      "Call Support",
      "Customer support phone number has not been configured yet.",
    );
  };

  // WhatsApp support
  const handleWhatsAppSupport = () => {
    Alert.alert(
      "WhatsApp Support",
      "WhatsApp support number has not been configured yet.",
    );
  };

  // Select support category
  const handleCategoryPress = (category) => {
    setSelectedCategory(category);

    Alert.alert(
      category.title,
      `You selected ${category.title}. The support request form can be connected here.`,
      [
        {
          text: "OK",
          onPress: () => setSelectedCategory(null),
        },
      ],
    );
  };

  // My support requests
  const handleMyRequests = () => {
    router.push("/support/my-requests");
  };

  // Support category card
  const SupportCategoryCard = ({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.categoryCard,
          selectedCategory?.id === item.id && styles.selectedCategoryCard,
        ]}
        onPress={() => handleCategoryPress(item)}
      >
        <View
          style={[styles.categoryIcon, { backgroundColor: item.background }]}
        >
          <Ionicons name={item.icon} size={32} color={item.color} />
        </View>

        <View style={styles.categoryContent}>
          <Text style={styles.categoryTitle}>{item.title}</Text>

          <Text style={styles.categoryDescription}>{item.description}</Text>
        </View>

        <Ionicons name="chevron-forward" size={25} color={Colors.white} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <LinearGradient
        colors={Colors.gradients.background}
        style={styles.background}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER */}

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={28} color={Colors.white} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Help & Support</Text>

            <View style={styles.headerRight} />
          </View>

          {/* SUPPORT HERO SECTION */}

          <View style={styles.heroSection}>
            <View style={styles.heroImageContainer}>
              <LinearGradient
                colors={["#450909", "#180303", "#050505"]}
                style={styles.heroCircle}
              >
                <Ionicons name="headset" size={105} color={Colors.primary} />

                <View style={styles.chatBubble}>
                  <Ionicons name="chatbubbles" size={28} color={Colors.white} />
                </View>
              </LinearGradient>
            </View>

            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>How can we help you?</Text>

              <Text style={styles.heroDescription}>
                Get quick support for your delivery partner account.
              </Text>
            </View>
          </View>

          {/* QUICK SUPPORT */}

          <View style={styles.quickSupportCard}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.quickSupportItem}
              onPress={handleCallSupport}
            >
              <View
                style={[
                  styles.quickIcon,
                  { backgroundColor: Colors.primaryDark },
                ]}
              >
                <Ionicons name="call" size={32} color={Colors.white} />
              </View>

              <View style={styles.quickContent}>
                <Text style={styles.quickTitle}>Call Support</Text>

                <Text style={styles.quickDescription}>
                  Talk to our support team
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.quickDivider} />

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.quickSupportItem}
              onPress={handleWhatsAppSupport}
            >
              <View style={[styles.quickIcon, { backgroundColor: "#079C3B" }]}>
                <Ionicons name="logo-whatsapp" size={34} color={Colors.white} />
              </View>

              <View style={styles.quickContent}>
                <Text style={styles.quickTitle}>WhatsApp</Text>

                <Text style={styles.quickDescription}>
                  Chat with us instantly
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* RAISE REQUEST SECTION */}

          <LinearGradient
            colors={["#260606", "#100303"]}
            style={styles.sectionHeader}
          >
            <Ionicons
              name="chatbox-ellipses-outline"
              size={29}
              color={Colors.primary}
            />

            <Text style={styles.sectionTitle}>Raise a Request</Text>
          </LinearGradient>

          {/* SUPPORT CATEGORIES */}

          <View style={styles.categoryContainer}>
            {SUPPORT_CATEGORIES.map((item) => (
              <SupportCategoryCard key={item.id} item={item} />
            ))}
          </View>

          {/* MY SUPPORT REQUESTS */}

          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.myRequestsWrapper}
            onPress={handleMyRequests}
          >
            <LinearGradient
              colors={["#260606", "#100303"]}
              style={styles.myRequestsCard}
            >
              <View style={styles.myRequestsIcon}>
                <Ionicons
                  name="document-text-outline"
                  size={32}
                  color={Colors.white}
                />
              </View>

              <View style={styles.myRequestsContent}>
                <Text style={styles.myRequestsTitle}>My Support Requests</Text>

                <Text style={styles.myRequestsDescription}>
                  View and track your raised requests
                </Text>
              </View>

              <Ionicons name="chevron-forward" size={26} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>

          {/* FOOTER */}

          <Text style={styles.footerText}>BAKASURAN DELIVERY PARTNER</Text>
        </ScrollView>
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

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  // HEADER

  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginBottom: 20,
    gap: 12,
  },

  heroImageContainer: {
    width: "48%",
  },

  heroCircle: {
    height: 210,
    borderRadius: 110,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  chatBubble: {
    position: "absolute",
    top: 25,
    right: 0,
    width: 55,
    height: 45,
    backgroundColor: Colors.primary,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },

  heroContent: {
    flex: 1,
  },

  heroTitle: {
    color: Colors.white,
    fontSize: 23,
    fontFamily: Fonts.extraBold,
    lineHeight: 30,
  },

  heroDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: Fonts.regular,
    lineHeight: 22,
    marginTop: 10,
  },

  // QUICK SUPPORT

  quickSupportCard: {
    minHeight: 120,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 17,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 25,
  },

  quickSupportItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  quickIcon: {
    width: 55,
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  quickContent: {
    alignItems: "center",
  },

  quickTitle: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: Fonts.bold,
  },

  quickDescription: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: Fonts.regular,
    textAlign: "center",
    marginTop: 4,
  },

  quickDivider: {
    width: 1,
    height: 75,
    backgroundColor: Colors.border,
    marginHorizontal: 8,
  },

  // SECTION HEADER

  sectionHeader: {
    height: 65,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 17,
    gap: 14,
    marginHorizontal: -20,
    marginBottom: 14,
  },

  sectionTitle: {
    color: Colors.white,
    fontSize: 20,
    fontFamily: Fonts.bold,
  },

  // CATEGORY CARDS

  categoryContainer: {
    gap: 12,
  },

  categoryCard: {
    minHeight: 40,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  selectedCategoryCard: {
    borderColor: Colors.primary,
  },

  categoryIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  categoryContent: {
    flex: 1,
  },

  categoryTitle: {
    color: Colors.white,
    fontSize: 17,
    fontFamily: Fonts.bold,
    marginBottom: 5,
  },

  categoryDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: Fonts.regular,
    lineHeight: 18,
  },

  // MY SUPPORT REQUESTS

  myRequestsWrapper: {
    marginTop: 30,
    borderRadius: 17,
    overflow: "hidden",
  },

  myRequestsCard: {
    minHeight: 112,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 17,
    paddingHorizontal: 15,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
  },

  myRequestsIcon: {
    width: 65,
    height: 65,
    borderRadius: 16,
    backgroundColor: Colors.primaryDark,
    justifyContent: "center",
    alignItems: "center",
  },

  myRequestsContent: {
    flex: 1,
  },

  myRequestsTitle: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.bold,
    marginBottom: 6,
  },

  myRequestsDescription: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: Fonts.regular,
    lineHeight: 18,
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
