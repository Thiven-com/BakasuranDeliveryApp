
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
  Alert,
  Keyboard,
  Image,
  ScrollView,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";
import {
  sendDeliveryOtpForOrder,
  verifyOrderDeliveryOtp,
} from "../utils/Function";

const COLORS = {
  background: Colors.background,
  red: Colors.primary,
  white: Colors.white,
  gray: Colors.textSecondary,
  card: Colors.cardLight,
};

export default function DeliverOrderScreen() {
  const { orderId: rawOrderId, bookingNumber: rawBookingNumber } =
    useLocalSearchParams();
  const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;
  const bookingNumber = Array.isArray(rawBookingNumber)
    ? rawBookingNumber[0]
    : rawBookingNumber;

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const inputRef = useRef(null);
  const sendAttemptedForOrder = useRef(null);

  const handleOtpChange = (value) => {
    setOtp(value.replace(/[^0-9]/g, "").slice(0, 4));
  };

  const requestDeliveryOtp = useCallback(async () => {
    if (!orderId) {
      setSendError("Order ID is missing.");
      return;
    }

    try {
      setSendLoading(true);
      setSendError("");

      const response = await sendDeliveryOtpForOrder(orderId);
      console.log("Send Delivery OTP API Response:", response);

      if (response?.status === true) {
        setOtpSent(true);
      } else {
        setOtpSent(false);
        setSendError(response?.message || "Unable to send delivery OTP.");
      }
    } catch (error) {
      console.log("Send Delivery OTP Error:", error);
      setOtpSent(false);
      setSendError(error?.message || "Unable to send delivery OTP.");
    } finally {
      setSendLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (sendAttemptedForOrder.current === orderId) return;
    sendAttemptedForOrder.current = orderId;
    requestDeliveryOtp();
  }, [orderId, requestDeliveryOtp]);

  const handleCompleteDelivery = async () => {
    Keyboard.dismiss();

    if (!orderId) {
      Alert.alert("Error", "Order ID is missing.");
      return;
    }

    if (!otpSent) {
      Alert.alert("OTP Not Sent", "Send the delivery OTP before verifying it.");
      return;
    }

    if (otp.length !== 4) {
      Alert.alert("Enter OTP", "Please enter the 4-digit delivery OTP.");
      return;
    }

    try {
      setVerifyLoading(true);
      const response = await verifyOrderDeliveryOtp(orderId, otp);
      console.log("Verify Delivery OTP API Response:", response);

      if (response?.status === true) {
        router.replace({
          pathname: "/DeliverySuccessScreen",
          params: {
            orderId: bookingNumber || String(orderId),
            amount: "320",
          },
        });
      } else {
        Alert.alert(
          "Delivery Failed",
          response?.message || "Invalid delivery OTP.",
        );
      }
    } catch (error) {
      console.log("Verify Delivery OTP Error:", error);
      Alert.alert("Error", error?.message || "Unable to verify delivery OTP.");
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
      />

      

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={COLORS.white}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Deliver Order
        </Text>

        <View style={styles.headerRight} />
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Exact Uploaded Delivery Illustration */}
        <View style={styles.illustrationContainer}>
          <Image
            source={require("../../assets/images/Friendly Food Delivery Handoff.png")}
            style={styles.deliveryImage}
            resizeMode="contain"
            accessibilityLabel="Delivery partner handing a food bag to a customer"
          />
        </View>

        {/* Heading */}
        <Text style={styles.title}>
          Enter Delivery OTP
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          Get OTP from the customer and{"\n"}
          enter below to complete the delivery.
        </Text>

        <View style={styles.otpStatusContainer}>
          {sendLoading ? (
            <ActivityIndicator color={COLORS.red} />
          ) : sendError ? (
            <>
              <Text style={styles.otpError}>{sendError}</Text>
              <TouchableOpacity
                onPress={requestDeliveryOtp}
                disabled={sendLoading}
              >
                <Text style={styles.resendOtpText}>Retry OTP</Text>
              </TouchableOpacity>
            </>
          ) : (
            <Text style={styles.otpSentText}>
              OTP sent to the customer. Ask them to share it with you.
            </Text>
          )}
        </View>

        {/* OTP Input */}
        <TouchableOpacity
          activeOpacity={1}
          style={styles.otpContainer}
          onPress={() => inputRef.current?.focus()}
        >
          {[0, 1, 2, 3].map((index) => (
            <View
              key={index}
              style={[
                styles.otpBox,
                otp.length === index && styles.activeOtpBox,
              ]}
            >
              <Text style={styles.otpText}>
                {otp[index] || ""}
              </Text>
            </View>
          ))}

          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={handleOtpChange}
            keyboardType="number-pad"
            maxLength={4}
            caretHidden
            style={styles.hiddenInput}
            accessibilityLabel="Enter four digit delivery OTP"
          />
        </TouchableOpacity>

      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.completeButton,
            (verifyLoading || sendLoading || !otpSent) && styles.disabledButton,
          ]}
          activeOpacity={0.85}
          onPress={handleCompleteDelivery}
          disabled={verifyLoading || sendLoading || !otpSent}
        >
          {verifyLoading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.completeButtonText}>Complete Delivery</Text>
          )}
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
    height: 75,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },

  backButton: {
    width: 32,
    height: 38,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontFamily: Fonts.bold,
  },

  headerRight: {
    width: 32,
  },

  // Main Content
  scrollView: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 15,
    paddingBottom: 30,
  },

  // Delivery Illustration
  illustrationContainer: {
    width: "100%",
    height: 185,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 70,
    marginBottom: 20,
    overflow: "hidden",
  },

  deliveryImage: {
    width: "100%",
    height: "100%",
  },

  // Heading
  title: {
    color: COLORS.white,
    fontSize: 26,
    fontFamily: Fonts.extraBold,
    textAlign: "center",
    marginTop: 4,
    marginBottom: 7,
  },

  description: {
    color: COLORS.gray,
    fontSize: 17,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 19,
  },

  otpStatusContainer: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  otpSentText: {
    color: COLORS.green,
    fontSize: 13,
    textAlign: "center",
  },

  otpError: {
    color: COLORS.red,
    fontSize: 13,
    textAlign: "center",
    marginBottom: 6,
  },

  resendOtpText: {
    color: COLORS.white,
    fontSize: 13,
    fontFamily: Fonts.bold,
    textDecorationLine: "underline",
  },

  // OTP Input
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
    position: "relative",
  },

  otpBox: {
    width: 52,
    height: 53,
    borderRadius: 8,
    backgroundColor: "#242424",
    borderWidth: 1,
    borderColor: "#343434",
    alignItems: "center",
    justifyContent: "center",
  },

  activeOtpBox: {
    borderColor: COLORS.red,
  },

  otpText: {
    color: COLORS.white,
    fontSize: 19,
    fontFamily: Fonts.extraBold,
  },

  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
    left: 0,
    top: 0,
  },

  // Bottom Button
  bottomContainer: {
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: Platform.OS === "web" ? 150 : 18,
    backgroundColor: COLORS.background,
  },

  completeButton: {
    height: 43,
    width: "100%",
    backgroundColor: COLORS.red,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  disabledButton: {
    opacity: 0.6,
   },

  completeButtonText: {
    color: COLORS.white,
    fontSize: 19,
    fontFamily: Fonts.bold,
  },
});
