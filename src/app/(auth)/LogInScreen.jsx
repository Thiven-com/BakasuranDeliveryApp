
import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";
import { deliveryLogin } from "../../utils/Function";

const RED = Colors.primary;
const DARK = Colors.background;
const WHITE = Colors.white;

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const bannerHeight = Math.min(width * 0.99, 410);

  // MOBILE NUMBER VALIDATION
  const handleMobileChange = (value) => {
    const cleaned = value.replace(/[^0-9]/g, "").slice(0, 10);
    setMobileNumber(cleaned);
  };

  // SEND OTP API
  const handleSendOTP = async () => {
    if (mobileNumber.length !== 10) {
      Alert.alert(
        "Invalid Mobile Number",
        "Please enter a valid 10-digit mobile number."
      );
      return;
    }

    if (loading) return;

    try {
      setLoading(true);

      console.log("LOGIN API START:", mobileNumber);

      const data = await deliveryLogin(mobileNumber);

      console.log("LOGIN API RESPONSE:", data);

      if (
        !data ||
        data.success === 0 ||
        data.success === false
      ) {
        throw new Error(
          data?.message || "Unable to send OTP. Please try again."
        );
      }

      Alert.alert(
        "Success",
        data.message || "OTP sent successfully."
      );

      router.push({
        pathname: "/OTPScreen",
        params: {
          mobile: mobileNumber,
        },
      });

    } catch (error) {
      console.log("LOGIN API ERROR:", error);

      Alert.alert(
        "Login Failed",
        error.message || "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={DARK}
      />

      <LinearGradient
        colors={["#100000", "#050505", "#080000"]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={
            Platform.OS === "ios" ? "padding" : undefined
          }
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >

            {/* PROMOTIONAL BANNER */}

            <ImageBackground
              source={require(
                "../../../assets/images/bakasuran-login-banner.png"
              )}
              style={[
                styles.banner,
                { height: bannerHeight },
              ]}
              resizeMode="cover"
            >
              {/* ACTUAL BAKASURAN LOGO */}

              <Image
                source={require(
                  "../../../assets/images/logo.png"
                )}
                style={styles.logo}
                resizeMode="contain"
              />
            </ImageBackground>

            {/* LOGIN CARD */}

            <View style={styles.loginCard}>

              {/* USER ICON */}

              <View style={styles.userIconContainer}>
                <LinearGradient
                  colors={["#FF3434", "#D90000"]}
                  style={styles.userIcon}
                >
                  <Ionicons
                    name="person"
                    size={34}
                    color={WHITE}
                  />
                </LinearGradient>
              </View>

              {/* HEADING */}

              <Text style={styles.heading}>
                Login
              </Text>

              <Text style={styles.description}>
                Enter your mobile number
              </Text>

              <Text style={styles.description}>
                to get started
              </Text>

              {/* MOBILE INPUT */}

              <View style={styles.inputContainer}>
                <View style={styles.phoneInput}>

                  {/*<Ionicons
                    name="call"
                    size={27}
                    color={WHITE}
                  />*/}

                  <Text style={styles.countryCode}>
                    +91
                  </Text>

                  <View style={styles.verticalLine} />

                  <TextInput
                    style={styles.mobileInput}
                    placeholder="Enter mobile number"
                    placeholderTextColor="#858585"
                    keyboardType="number-pad"
                    maxLength={10}
                    value={mobileNumber}
                    onChangeText={handleMobileChange}
                    selectionColor={RED}
                    editable={!loading}
                  />

                  {mobileNumber.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setMobileNumber("")}
                      disabled={loading}
                    >
                      <Ionicons
                        name="close-circle"
                        size={21}
                        color="#888888"
                      />
                    </TouchableOpacity>
                  )}

                </View>

                {/*<Text style={styles.inputHint}>
                  {mobileNumber.length}/10 digits
                </Text>*/}
              </View>

              {/* SEND OTP BUTTON */}

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSendOTP}
                disabled={loading}
                style={[
                  styles.buttonWrapper,
                  loading && { opacity: 0.7 },
                ]}
              >
                <LinearGradient
                  colors={["#FF2929", "#F00000", "#C90000"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.sendButton}
                >
                  {loading ? (
                    <ActivityIndicator
                      color={WHITE}
                      size="small"
                    />
                  ) : (
                    <>
                      <Text style={styles.buttonText}>
                        Send OTP
                      </Text>

                      <Ionicons
                        name="arrow-forward"
                        size={29}
                        color={WHITE}
                      />
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

            </View>

            {/* BOTTOM BENEFITS */}

            <View style={styles.benefitsContainer}>

              <View style={styles.benefitItem}>
                <Ionicons
                  name="bicycle-outline"
                  size={30}
                  color={RED}
                />
                <Text style={styles.benefitText}>
                  Fast{"\n"}Deliveries
                </Text>
              </View>

              <View style={styles.benefitDivider} />

              <View style={styles.benefitItem}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={30}
                  color={RED}
                />
                <Text style={styles.benefitText}>
                  Safe &{"\n"}Secure
                </Text>
              </View>

              <View style={styles.benefitDivider} />

              <View style={styles.benefitItem}>
                <Ionicons
                  name="people-outline"
                  size={30}
                  color={RED}
                />
                <Text style={styles.benefitText}>
                  Grow{"\n"}Together
                </Text>
              </View>

            </View>

            {/* BOTTOM SPACE */}

            <View style={{ height: 20 }} />

          </ScrollView>
        </KeyboardAvoidingView>
        
      </LinearGradient>
      
    </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({

  // MAIN SCREEN

  safeArea: {
    flex: 1,
    backgroundColor: DARK,
  },

  gradient: {
    flex: 1,
  },

  keyboard: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 15,
  },

  // PROMOTIONAL BANNER

  banner: {
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    overflow: "hidden",
  },

  logo: {
    width: 145,
    height: 145,
    marginTop: 8,
    marginLeft: 18,
  },

  // LOGIN CARD

  loginCard: {
    width: "90%",
    alignSelf: "center",
    backgroundColor: "#090909",
    borderWidth: 1.5,
    borderColor: "#8F1010",
    borderRadius: 40,
    paddingHorizontal: 24,
    paddingTop: 35,
    paddingBottom: 10,
    marginTop: -5,

    shadowColor: RED,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.22,
    shadowRadius: 15,
    elevation: 12,
  },

  userIconContainer: {
    position: "absolute",
    top: -34,
    alignSelf: "center",
  },

  userIcon: {
    width: 60,
    height: 60,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FF5555",
    elevation: 10,
  },

  // HEADING

  heading: {
    color: WHITE,
    fontFamily: Fonts.regular,
    fontSize: 39,
    textAlign: "center",
    marginBottom: 15,
  },

  description: {
    color: "#BBBBBB",
    fontFamily: Fonts.medium,
    fontSize: 18,
    lineHeight: 20,
    textAlign: "center",
  },

  // PHONE INPUT

  inputContainer: {
    width: "100%",
    marginTop: 23,
  },

  phoneInput: {
    width: "100%",
    height: 50,
    borderWidth: 1.5,
    borderColor: RED,
    borderRadius: 23,
    backgroundColor: "#141010",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  countryCode: {
    color: WHITE,
    fontFamily: Fonts.bold,
    fontSize: 20,
    marginLeft: 5,
  },

  verticalLine: {
    width: 1,
    height: 35,
    backgroundColor: "#666666",
    marginHorizontal: 7,
  },

  mobileInput: {
    flex: 1,
    height: "100%",
    color: WHITE,
    fontFamily: Fonts.regular,
    fontSize: 19,
    paddingHorizontal: 0,
  },

  inputHint: {
    color: "#777777",
    fontFamily: Fonts.regular,
    fontSize: 18,
    textAlign: "right",
    marginTop: 7,
    marginRight: 5,
  },

  // SEND OTP BUTTON

  buttonWrapper: {
    width: "100%",
    marginTop: 30,
    borderRadius: 35,
    overflow: "hidden",

    shadowColor: RED,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 9,
  },

  sendButton: {
    height: 60,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 17,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: "#FF5252",
  },

  buttonText: {
    color: WHITE,
    fontFamily: Fonts.regular,
    fontSize: 26,
  },

  // BOTTOM BENEFITS

  benefitsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "90%",
    alignSelf: "center",
    marginTop: 35,
    paddingVertical: 15,
  },

  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  benefitText: {
    color: "#BBBBBB",
    fontFamily: Fonts.medium,
    fontSize: 13,
    lineHeight: 19,
  },

  benefitDivider: {
    width: 1,
    height: 42,
    backgroundColor: "#555555",
  },

});
