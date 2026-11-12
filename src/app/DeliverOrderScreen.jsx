
import React, { useState, useRef } from "react";
import {
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
import { router } from "expo-router";

const COLORS = {
  background: "#050505",
  red: "#F9080C",
  white: "#FFFFFF",
  gray: "#BDBDBD",
  card: "#222222",
};

export default function DeliverOrderScreen() {
  const [otp, setOtp] = useState("");
  const inputRef = useRef(null);

  const handleOtpChange = (value) => {
    setOtp(value.replace(/[^0-9]/g, "").slice(0, 4));
  };

  const handleCompleteDelivery = () => {
  Keyboard.dismiss();

  if (otp.length !== 4) {
    Alert.alert(
      "Enter OTP",
      "Please enter the 4-digit delivery OTP."
    );
    return;
  }

  // Navigate to Delivery Success Screen
  router.replace({
    pathname: "/DeliverySuccessScreen",
    params: {
      orderId: "#BSK100234",
      amount: "320",
    },
  });
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
          style={styles.completeButton}
          activeOpacity={0.85}
          onPress={handleCompleteDelivery}
        >
          <Text style={styles.completeButtonText}>
            Complete Delivery
          </Text>
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
    fontWeight: "700",
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
    fontWeight: "800",
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
    fontWeight: "800",
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

  completeButtonText: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: "700",
  },
});
