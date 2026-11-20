import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";

const COLORS = {
  background: Colors.background,
  red: Colors.primary,
  green: Colors.success,
  white: Colors.white,
  gray: Colors.textSecondary,
  card: Colors.card,
};

export default function DeliverySuccessScreen() {
  const params = useLocalSearchParams();

  const orderId = params.orderId || "#BSK100234";
  const amount = params.amount || "320";

  const handleViewEarnings = () => {
    router.push("/(tabs)/EarningsScreen");
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Back Button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Main Success Content */}
      <View style={styles.content}>
        {/* Green Success Icon */}
        <View style={styles.successCircle}>
          <Ionicons
            name="checkmark"
            size={43}
            color={COLORS.white}
            strokeWidth={3}
          />
        </View>

        {/* Success Heading */}
        <Text style={styles.successTitle}>
          Order Delivered{"\n"}Successfully!
        </Text>

        {/* Order ID */}
        <View style={styles.orderIdContainer}>
          <Text style={styles.orderIdText}>{orderId}</Text>
        </View>

        {/* Earned Amount */}
        {/*<Text style={styles.earnedAmount}>
          ₹{amount} Earned
        </Text>*/}
      </View>

      {/* View Earnings Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.viewEarningsButton}
          activeOpacity={0.85}
          onPress={handleViewEarnings}
        >
          <Text style={styles.buttonText}>View Earnings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    height: 70,
    paddingHorizontal: 12,
    justifyContent: "center",
  },

  backButton: {
    width: 42,
    height: 48,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  // Main Content
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 35,
  },

  // Success Circle
  successCircle: {
    width: 85,
    height: 85,
    borderRadius: 35,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
    elevation: 7,
    shadowColor: COLORS.green,
    shadowOpacity: 0.3,
    shadowRadius: 9,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  // Success Heading
  successTitle: {
    color: COLORS.white,
    fontSize: 26,
    lineHeight: 29,
    fontFamily: Fonts.extraBold,
    textAlign: "center",
    marginBottom: 17,
  },

  // Order ID
  orderIdContainer: {
    width: 180,
    height: 70,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 11,
  },

  orderIdText: {
    color: COLORS.white,
    fontSize: 22,
    fontFamily: Fonts.semiBold,
  },

  // Earnings
  earnedAmount: {
    color: COLORS.white,
    fontSize: 20,
    fontFamily: Fonts.extraBold,
    marginTop: 1,
  },

  // Bottom Button
  bottomContainer: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: Platform.OS === "web" ? 220 : 18,
  },

  viewEarningsButton: {
    width: "100%",
    height: 43,
    backgroundColor: COLORS.red,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 19,
    fontFamily: Fonts.bold,
  },
});
