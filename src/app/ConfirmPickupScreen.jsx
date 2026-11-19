import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { pickupOrder } from "../utils/Function";

const COLORS = {
  background: "#0A0A0A",
  card: "#161616",
  border: "#292929",
  red: "#F9080C",
  white: "#FFFFFF",
  gray: "#999999",
  green: "#20D34A",
};

export default function PickupScreen() {
  const { orderId: rawOrderId } = useLocalSearchParams();

  const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerifyPickup = async () => {
    if (!orderId) {
      Alert.alert("Error", "Order ID is missing.");
      return;
    }

    if (otp.trim().length !== 4) {
      Alert.alert("Invalid OTP", "Please enter the 4-digit pickup OTP.");
      return;
    }

    try {
      setLoading(true);

      const response = await pickupOrder(orderId, otp.trim());

      console.log("Pickup API Response:", response);

      if (response?.status === true) {
        router.replace({
          pathname: "/OrderMapScreen",
          params: {
            orderId: String(orderId),
            stage: "delivery",
          },
        });
      } else {
        Alert.alert(
          "Pickup Failed",
          response?.message || "Invalid pickup OTP.",
        );
      }
    } catch (error) {
      console.log("Pickup Error:", error);
      Alert.alert("Error", "Unable to verify pickup OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Pickup Order</Text>

        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* ICON */}
        <View style={styles.iconContainer}>
          <Ionicons name="bag-check" size={45} color={COLORS.green} />
        </View>

        <Text style={styles.title}>Reached Restaurant?</Text>

        <Text style={styles.description}>
          Collect the order from the restaurant and ask the restaurant staff for
          the pickup OTP.
        </Text>

        {/* ORDER DETAILS */}
        <View style={styles.orderCard}>
          <Text style={styles.label}>ORDER ID</Text>

          <Text style={styles.orderNumber}>#{orderId || "--"}</Text>

          <View style={styles.divider} />

          <View style={styles.statusRow}>
            <Ionicons name="checkmark-circle" size={19} color={COLORS.green} />

            <Text style={styles.statusText}>Ready for pickup verification</Text>
          </View>
        </View>

        {/* OTP INPUT */}
        <Text style={styles.inputLabel}>Enter Pickup OTP</Text>

        <TextInput
          style={styles.otpInput}
          placeholder="Enter 4-digit OTP"
          placeholderTextColor={COLORS.gray}
          keyboardType="number-pad"
          maxLength={4}
          value={otp}
          onChangeText={(value) => setOtp(value.replace(/\D/g, ""))}
        />

        <Text style={styles.helperText}>
          Enter the OTP provided by the restaurant.
        </Text>

        {/* VERIFY BUTTON */}
        <TouchableOpacity
          style={[styles.verifyButton, loading && { opacity: 0.6 }]}
          onPress={handleVerifyPickup}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons
                name="checkmark-circle"
                size={21}
                color={COLORS.white}
              />

              <Text style={styles.verifyButtonText}>
                Verify & Confirm Pickup
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.note}>
          Pickup will be confirmed only after successful OTP verification from
          the server.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    height: 62,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "700",
  },

  content: {
    flex: 1,
    padding: 22,
    justifyContent: "center",
  },

  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "rgba(32,211,74,0.12)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 22,
  },

  title: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },

  description: {
    color: COLORS.gray,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 28,
  },

  orderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 25,
  },

  label: {
    color: COLORS.gray,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },

  orderNumber: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: "700",
    marginTop: 5,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 15,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  statusText: {
    color: COLORS.green,
    fontSize: 13,
    fontWeight: "600",
  },

  inputLabel: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },

  otpInput: {
    height: 58,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 8,
  },

  helperText: {
    color: COLORS.gray,
    fontSize: 12,
    marginTop: 9,
  },

  verifyButton: {
    height: 54,
    backgroundColor: COLORS.red,
    borderRadius: 13,
    marginTop: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  verifyButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },

  note: {
    color: COLORS.gray,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 19,
    marginTop: 18,
  },
});
