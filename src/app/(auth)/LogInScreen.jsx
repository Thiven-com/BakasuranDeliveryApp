import { useState } from "react";

import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// COMMON STYLES
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";
import { deliveryLogin } from "../../utils/Function";

export default function LoginScreen() {
  const router = useRouter();

  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);

  // HANDLE MOBILE NUMBER
  const handleMobileChange = (value) => {
    const cleaned = value.replace(/[^0-9]/g, "").slice(0, 10);
    setMobileNumber(cleaned);
  };

  // SEND OTP
  const handleSendOTP = async () => {
    if (mobileNumber.length !== 10) {
      Alert.alert(
        "Invalid Mobile Number",
        "Please enter a valid 10-digit mobile number.",
      );
      return;
    }

    try {
      setLoading(true);

      const data = await deliveryLogin(mobileNumber);

      if (!data || data.success === 0 || data.success === false) {
        throw new Error(
          data?.message || "Unable to send OTP. Please try again.",
        );
      }

      console.log("Login API Response:", data);

      Alert.alert("Success", data.message || "OTP sent successfully.");

      // Navigate to OTP screen after successful API response
      router.push({
        pathname: "/OTPScreen",
        params: {
          mobile: mobileNumber,
        },
      });
    } catch (error) {
      console.log("Login API Error:", error);

      Alert.alert("Login Failed", error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <LinearGradient
        colors={["#170303", Colors.background, "#080808", "#100202"]}
        locations={[0, 0.35, 0.75, 1]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* LOGO SECTION */}

            <View style={styles.logoSection}>
              <Image
                source={require("../../../assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />

              <Text style={styles.partnerText}>Delivery Partner</Text>
            </View>

            {/* LOGIN HEADING */}

            <View style={styles.headingSection}>
              <Text style={styles.heading}>Login</Text>

              <Text style={styles.description}>Enter your mobile number</Text>

              <Text style={styles.description}>to get started</Text>
            </View>

            {/* MOBILE INPUT */}

            <View style={styles.inputContainer}>
              <View style={styles.phoneInput}>
                <View style={styles.countrySection}>
                  <Text style={styles.flag}>🇮🇳</Text>

                  <Text style={styles.countryCode}>+91</Text>
                </View>

                <View style={styles.verticalLine} />

                <TextInput
                  style={styles.mobileInput}
                  placeholder="98765 43210"
                  placeholderTextColor={Colors.textMuted}
                  keyboardType="number-pad"
                  maxLength={10}
                  value={mobileNumber}
                  onChangeText={handleMobileChange}
                  selectionColor={Colors.primary}
                />

                {mobileNumber.length > 0 && (
                  <TouchableOpacity onPress={() => setMobileNumber("")}>
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={Colors.textMuted}
                    />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.inputHint}>
                {mobileNumber.length}/10 digits
              </Text>
            </View>

            {/* SEND OTP BUTTON */}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleSendOTP}
              disabled={loading}
              style={styles.buttonWrapper}
            >
              <LinearGradient
                colors={Colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.sendButton}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Please wait..." : "Send OTP"}
                </Text>

                {!loading && (
                  <Ionicons
                    name="arrow-forward"
                    size={20}
                    color={Colors.white}
                  />
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* BOTTOM DECORATION */}

            {/*<View style={styles.bottomDecoration}>
              <Ionicons
                name="pizza-outline"
                size={22}
                color={Colors.redOverlay}
              />

              <Ionicons
                name="fast-food-outline"
                size={22}
                color={Colors.redOverlay}
              />

              <Ionicons
                name="restaurant-outline"
                size={22}
                color={Colors.redOverlay}
              />

              <Ionicons
                name="cafe-outline"
                size={22}
                color={Colors.redOverlay}
              />

              <Ionicons
                name="pizza-outline"
                size={22}
                color={Colors.redOverlay}
              />
            </View>*/}
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // MAIN CONTAINER

  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  gradient: {
    flex: 1,
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 25,
    paddingBottom: 20,
  },

  // LOGO

  logoSection: {
    alignItems: "center",
    marginTop: 12,
  },

  logo: {
    width: 135,
    height: 85,
  },

  partnerText: {
    color: Colors.textPrimary,
    fontFamily: Fonts.bold,
    fontSize: 15,
    fontStyle: "italic",
    marginTop: -2,
  },

  // HEADING

  headingSection: {
    alignItems: "center",
    marginTop: 28,
  },

  heading: {
    fontSize: 22,
    color: Colors.textPrimary,
    fontFamily: Fonts.extraBold,
    marginBottom: 12,
  },

  description: {
    color: Colors.textSecondary,
    fontFamily: Fonts.regular,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
  },

  // MOBILE INPUT

  inputContainer: {
    width: "100%",
    marginTop: 18,
  },

  phoneInput: {
    width: "100%",
    height: 49,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 11,
    backgroundColor: Colors.backgroundLight,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  countrySection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  flag: {
    fontSize: 19,
  },

  countryCode: {
    color: Colors.textPrimary,
    fontFamily: Fonts.semiBold,
    fontSize: 13,
  },

  verticalLine: {
    width: 1,
    height: 25,
    backgroundColor: Colors.border,
    marginHorizontal: 10,
  },

  mobileInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontFamily: Fonts.medium,
    fontSize: 14,
    height: "100%",
    paddingHorizontal: 2,
  },

  inputHint: {
    color: Colors.textMuted,
    fontFamily: Fonts.regular,
    fontSize: 10,
    textAlign: "right",
    marginTop: 5,
  },

  // BUTTON

  buttonWrapper: {
    width: "100%",
    marginTop: 10,
    borderRadius: 11,
    overflow: "hidden",
  },

  sendButton: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  buttonText: {
    color: Colors.white,
    fontFamily: Fonts.extraBold,
    fontSize: 15,
  },

  // BOTTOM DECORATION

  bottomDecoration: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: "auto",
    paddingTop: 35,
    paddingBottom: 10,
    opacity: 0.7,
  },
});
