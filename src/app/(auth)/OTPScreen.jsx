import { useEffect, useRef, useState } from "react";

import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// COMMON STYLES
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";
import { saveToken, verifyDeliveryOtp } from "../../utils/Function";
export default function OtpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const mobile = params.mobile || "9876543210";

  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(45);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);

  // OTP COUNTDOWN
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // OTP INPUT
  const handleOtpChange = (value) => {
    const cleaned = value.replace(/[^0-9]/g, "").slice(0, 4);
    setOtp(cleaned);
  };

  // RESEND OTP
  const handleResendOtp = () => {
    if (timer > 0) return;

    setOtp("");
    setTimer(45);

    Alert.alert("OTP Sent", "A new OTP has been sent to your mobile number.");

    inputRef.current?.focus();
  };

  // VERIFY OTP
  // VERIFY OTP API
  const handleVerify = async () => {
    if (otp.length !== 4) {
      Alert.alert("Invalid OTP", "Please enter your 4-digit OTP.");
      return;
    }

    try {
      Keyboard.dismiss();
      setLoading(true);

      const response = await verifyDeliveryOtp(mobile, otp);

      console.log("OTP VERIFICATION RESPONSE:", response);

      if (response?.success === 0 || response?.success === false) {
        Alert.alert("Verification Failed", response?.message || "Invalid OTP.");
        return;
      }

      // Extract token (adjust after confirming API response)
      const token = response?.data?.token || response?.token;

      if (!token) {
        Alert.alert(
          "Error",
          "OTP verified, but authentication token was not received.",
        );
        return;
      }

      // SAVE TOKEN
      const saved = await saveToken(token);

      if (!saved) {
        Alert.alert("Error", "Unable to save login session.");
        return;
      }

      Alert.alert("Success", response?.message || "OTP verified successfully.");

      // Navigate to home screen
      router.replace("/HomeScreen");
    } catch (error) {
      console.log("OTP Verification Error:", error);

      Alert.alert("Error", "Unable to verify OTP.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* BACK BUTTON */}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={26} color={Colors.white} />
        </TouchableOpacity>

        {/* LOGO SECTION */}

        <View style={styles.logoContainer}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.partnerText}>Delivery Partner</Text>
        </View>

        {/* TITLE */}

        <View style={styles.headingContainer}>
          <Text style={styles.heading}>Verify OTP</Text>

          <Text style={styles.description}>Enter the 4-digit OTP sent to</Text>

          <Text style={styles.mobileNumber}>+91 {mobile}</Text>
        </View>

        {/* OTP INPUT */}

        <View style={styles.otpContainer}>
          <View style={styles.otpBoxes}>
            {[0, 1, 2, 3].map((index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={1}
                onPress={() => inputRef.current?.focus()}
                style={[
                  styles.otpBox,
                  otp.length === index && styles.activeOtpBox,
                ]}
              >
                <Text style={styles.otpText}>{otp[index] || ""}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            ref={inputRef}
            value={otp}
            onChangeText={handleOtpChange}
            keyboardType="number-pad"
            maxLength={4}
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            caretHidden
            style={styles.hiddenInput}
          />
        </View>

        {/* RESEND OTP */}

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Resend OTP in </Text>

          {timer > 0 ? (
            <Text style={styles.timerText}>
              00:{String(timer).padStart(2, "0")}
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResendOtp}>
              <Text style={styles.resendButton}>Resend OTP</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* VERIFY BUTTON */}

        <TouchableOpacity
          style={[
            styles.verifyButton,
            (otp.length !== 4 || loading) && styles.disabledButton,
          ]}
          onPress={handleVerify}
          disabled={otp.length !== 4 || loading}
          activeOpacity={0.85}
        >
          <Text style={styles.verifyButtonText}>
            {loading ? "Verifying..." : "Verify & Continue"}
          </Text>

          {!loading && (
            <Ionicons name="arrow-forward" size={25} color={Colors.white} />
          )}
        </TouchableOpacity>

        {/* FOOTER */}

        <View style={styles.footer}>
          <Text style={styles.footerText}>BAKASURAN DELIVERY PARTNER</Text>

          <Text style={styles.footerSubText}>
            Delivering happiness to your doorstep
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // MAIN CONTAINER

  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  container: {
    flex: 1,
    paddingHorizontal: 25,
    alignItems: "center",
  },

  // BACK BUTTON

  backButton: {
    position: "absolute",
    top: 5,
    left: 20,
    zIndex: 10,
    padding: 5,
  },

  // LOGO

  logoContainer: {
    alignItems: "center",
    marginTop: 75,
  },

  logo: {
    width: 210,
    height: 145,
  },

  partnerText: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontFamily: Fonts.extraBold,
    fontStyle: "italic",
    marginTop: 0,
  },

  // HEADING

  headingContainer: {
    alignItems: "center",
    marginTop: 55,
  },

  heading: {
    fontSize: 34,
    fontFamily: Fonts.extraBold,
    color: Colors.textPrimary,
    marginBottom: 18,
  },

  description: {
    fontSize: 17,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    textAlign: "center",
  },

  mobileNumber: {
    color: Colors.textPrimary,
    fontSize: 19,
    fontFamily: Fonts.semiBold,
    marginTop: 7,
  },

  // OTP INPUT

  otpContainer: {
    width: "100%",
    marginTop: 65,
    alignItems: "center",
  },

  otpBoxes: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  otpBox: {
    flex: 1,
    height: 75,
    backgroundColor: Colors.card,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  activeOtpBox: {
    borderColor: Colors.primary,
  },

  otpText: {
    color: Colors.textPrimary,
    fontSize: 35,
    fontFamily: Fonts.bold,
  },

  hiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },

  // RESEND OTP

  resendContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 40,
  },

  resendText: {
    color: Colors.textSecondary,
    fontSize: 17,
    fontFamily: Fonts.regular,
  },

  timerText: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontFamily: Fonts.extraBold,
  },

  resendButton: {
    color: Colors.primary,
    fontSize: 17,
    fontFamily: Fonts.bold,
  },

  // VERIFY BUTTON

  verifyButton: {
    width: "100%",
    height: 70,
    backgroundColor: Colors.primary,
    borderRadius: 18,
    marginTop: 75,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  disabledButton: {
    opacity: 0.55,
  },

  verifyButtonText: {
    color: Colors.white,
    fontSize: 20,
    fontFamily: Fonts.extraBold,
  },

  // FOOTER

  footer: {
    position: "absolute",
    bottom: 20,
    alignItems: "center",
  },

  footerText: {
    color: Colors.textMuted,
    fontSize: 11,
    fontFamily: Fonts.extraBold,
    letterSpacing: 2,
  },

  footerSubText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: Fonts.regular,
    marginTop: 6,
  },
});
