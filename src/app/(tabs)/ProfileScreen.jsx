
import axios from "axios";
import { useCallback, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";

import BASE_URL from "../../constants/AppUrls";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";
import { getDeliveryProfile } from "../../utils/Function";

// =====================================================
// CONSTANTS
// =====================================================

const LOGOUT_ENDPOINT = "api/delivery/logout";
const TOKEN_KEY = "bakasuran_token";

const DEFAULT_IMAGE = require("../../../assets/images/Friendly Bakasuran Delivery Partner.png");

// =====================================================
// HELPERS
// =====================================================

const getProfileData = (response) => {
  return (
    response?.data?.data ??
    response?.data ??
    response?.profile ??
    response ??
    {}
  );
};

const isApiSuccessful = (response) => {
  if (!response || typeof response !== "object") {
    return false;
  }

  if (
    response.status === false ||
    response.success === false ||
    response.status === 0 ||
    response.success === 0 ||
    response.status === "0" ||
    response.success === "0"
  ) {
    return false;
  }

  return (
    response.status === true ||
    response.status === 1 ||
    response.status === "1" ||
    response.success === true ||
    response.success === 1 ||
    response.success === "1"
  );
};

// =====================================================
// PROFILE SCREEN
// =====================================================

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const logoutLock = useRef(false);

  // =====================================================
  // GET PROFILE API
  // =====================================================

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      console.log("========== PROFILE FETCH START ==========");

      const response = await getDeliveryProfile();

      console.log(
        "PROFILE RESPONSE:",
        JSON.stringify(response, null, 2)
      );

      if (
        response?.success === 0 ||
        response?.success === false ||
        response?.status === false
      ) {
        throw new Error(
          response?.message || "Unable to load profile."
        );
      }

      const profileData = getProfileData(response);

      if (
        !profileData ||
        typeof profileData !== "object" ||
        Array.isArray(profileData)
      ) {
        throw new Error("Invalid profile response.");
      }

      setProfile(profileData);

      console.log("PROFILE LOADED SUCCESSFULLY");
    } catch (err) {
      console.log("PROFILE ERROR:", err);

      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
      console.log("========== PROFILE FETCH END ==========");
    }
  }, []);

  // =====================================================
  // REFRESH ON SCREEN FOCUS
  // =====================================================

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  // =====================================================
  // LOGOUT API
  // =====================================================

  const performLogout = async () => {
    if (logoutLock.current) {
      console.log("LOGOUT ALREADY IN PROGRESS");
      return;
    }

    logoutLock.current = true;
    setLoggingOut(true);

    try {
      console.log("========== LOGOUT START ==========");

      const token = await AsyncStorage.getItem(TOKEN_KEY);

      if (!token) {
        throw new Error("Authentication token not found.");
      }

      const baseUrl = String(BASE_URL || "").replace(/\/+$/, "");
      const logoutUrl = `${baseUrl}/${LOGOUT_ENDPOINT}`;

      console.log("LOGOUT URL:", logoutUrl);
      console.log("SENDING LOGOUT REQUEST...");

      const response = await axios({
        method: "POST",
        url: logoutUrl,
        data: {},
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.trim()}`,
        },
        timeout: 20000,
      });

      console.log("LOGOUT HTTP STATUS:", response.status);
      console.log(
        "LOGOUT RESPONSE:",
        JSON.stringify(response.data, null, 2)
      );

      if (!isApiSuccessful(response.data)) {
        throw new Error(
          response.data?.message || "Logout was unsuccessful."
        );
      }

      // Clear authentication data
      await AsyncStorage.multiRemove([
        "bakasuran_token",
        "token",
        "access_token",
        "accessToken",
        "authToken",
        "user",
        "userData",
      ]);

      setProfile(null);

      console.log("AUTH STORAGE CLEARED");

      // Navigate to login screen
      router.replace("/LogInScreen");

      console.log("LOGOUT SUCCESSFUL");
    } catch (err) {
      console.log("========== LOGOUT ERROR ==========");
      console.log("ERROR:", err.message);
      console.log("ERROR CODE:", err.code);
      console.log("HTTP STATUS:", err.response?.status);
      console.log("SERVER RESPONSE:", err.response?.data);
      console.log("REQUEST URL:", err.config?.url);

      Alert.alert(
        "Logout Error",
        err.response?.data?.message ||
          err.message ||
          "Unable to contact logout API."
      );
    } finally {
      logoutLock.current = false;
      setLoggingOut(false);

      console.log("========== LOGOUT END ==========");
    }
  };

  const handleLogout = () => {
    console.log("LOGOUT BUTTON PRESSED");
    performLogout();
  };

  // =====================================================
  // PROFILE MENU
  // =====================================================

  const menuItems = [
    {
      id: "1",
      title: "Personal Details",
      icon: "person-outline",
      route: "/PersonalDetails",
    },
    {
      id: "2",
      title: "Vehicle Details",
      icon: "bicycle-outline",
      route: "/VechileDetails",
    },
    {
      id: "3",
      title: "Bank Details",
      icon: "card-outline",
      route: "/BankDetails",
    },
    {
      id: "4",
      title: "Documents",
      icon: "document-text-outline",
      route: "/Documents",
    },
    {
      id: "5",
      title: "Privacy & Policy",
      icon: "shield-checkmark-outline",
      route: "/Privacy&Policy",
    },
    {
      id: "6",
      title: "Terms & Conditions",
      icon: "document-outline",
      route: "/Terms&Conditions",
    },
    {
      id: "7",
      title: "Notifications",
      icon: "notifications-outline",
      route: "/Notifications",
    },
    {
      id: "8",
      title: "Help & Support",
      icon: "help-circle-outline",
      route: "/Help&Support",
    },
  ];

  // =====================================================
  // NAVIGATION
  // =====================================================

  const handleMenuPress = (item) => {
    if (logoutLock.current) return;

    router.push(item.route);
  };

  // =====================================================
  // PROFILE VALUES
  // =====================================================

  const firstName = profile?.first_name || "";
  const lastName = profile?.last_name || "";

  const profileName =
    profile?.name ||
    profile?.full_name ||
    `${firstName} ${lastName}`.trim() ||
    "Delivery Partner";

  const profileRole =
    profile?.role ||
    profile?.user_type ||
    "Delivery Partner";

  const profileImage =
    profile?.profile_image ||
    profile?.profile_picture ||
    profile?.image ||
    profile?.avatar;

  const isVerified =
    profile?.is_verified === true ||
    profile?.is_verified === 1 ||
    profile?.verified === true ||
    profile?.verified === 1 ||
    profile?.verification_status === "verified";

  const imageUrl =
    typeof profileImage === "string" &&
    profileImage.trim().length > 0
      ? profileImage
      : null;

  const imageSource = imageUrl
    ? { uri: imageUrl }
    : DEFAULT_IMAGE;

  // =====================================================
  // UI
  // =====================================================

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.background}
      />

      {/* HEADER */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
          disabled={loggingOut}
        >
          <Ionicons
            name="chevron-back"
            size={23}
            color={Colors.white}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Profile</Text>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={fetchProfile}
          disabled={loading || loggingOut}
        >
          <Ionicons
            name="refresh-outline"
            size={21}
            color={Colors.white}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={Colors.primary}
            />

            <Text style={styles.loadingText}>
              Loading profile...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons
              name="alert-circle-outline"
              size={42}
              color={Colors.primary}
            />

            <Text style={styles.errorText}>{error}</Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={fetchProfile}
              disabled={loggingOut}
            >
              <Text style={styles.retryText}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* PROFILE INFORMATION */}

            <View style={styles.profileSection}>
              <View style={styles.profileImageWrapper}>
                <Image
                  source={imageSource}
                  style={styles.profileImage}
                  resizeMode="cover"
                />
              </View>

              <Text style={styles.profileName}>
                {profileName}
              </Text>

              <Text style={styles.profileRole}>
                {profileRole}
              </Text>

              <View
                style={[
                  styles.verifiedBadge,
                  !isVerified && styles.unverifiedBadge,
                ]}
              >
                <Ionicons
                  name={
                    isVerified
                      ? "checkmark-circle"
                      : "time-outline"
                  }
                  size={15}
                  color={Colors.white}
                />

                <Text style={styles.verifiedText}>
                  {isVerified ? "Verified" : "Not Verified"}
                </Text>
              </View>
            </View>

            {/* PROFILE MENU */}

            <View style={styles.menuContainer}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    index === menuItems.length - 1 &&
                      styles.lastMenuItem,
                  ]}
                  activeOpacity={0.75}
                  onPress={() => handleMenuPress(item)}
                  disabled={loggingOut}
                >
                  <View style={styles.menuLeft}>
                    <View style={styles.menuIcon}>
                      <Ionicons
                        name={item.icon}
                        size={20}
                        color={Colors.primary}
                      />
                    </View>

                    <Text style={styles.menuTitle}>
                      {item.title}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={21}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* LOGOUT BUTTON */}

            <TouchableOpacity
              style={[
                styles.logoutButton,
                loggingOut && styles.disabledButton,
              ]}
              activeOpacity={0.8}
              onPress={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <ActivityIndicator
                  size="small"
                  color={Colors.white}
                />
              ) : (
                <Ionicons
                  name="log-out-outline"
                  size={23}
                  color={Colors.white}
                />
              )}

              <Text style={styles.logoutText}>
                {loggingOut
                  ? "Logging out..."
                  : "Logout"}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.footerText}>
          BAKASURAN DELIVERY PARTNER
        </Text>
      </ScrollView>
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    height: 73,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  backButton: {
    width: 35,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  headerTitle: {
    color: Colors.white,
    fontSize: 24,
    fontFamily: Fonts.bold,
  },

  refreshButton: {
    width: 35,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },

  loadingContainer: {
    flex: 1,
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: Fonts.medium,
    marginTop: 12,
  },

  errorContainer: {
    flex: 1,
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  errorText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: Fonts.regular,
    textAlign: "center",
    marginTop: 12,
  },

  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 18,
  },

  retryText: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: Fonts.bold,
  },

  profileSection: {
    alignItems: "center",
    marginTop: 75,
    marginBottom: 40,
  },

  profileImageWrapper: {
    width: 95,
    height: 95,
    borderRadius: 48,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.white,
    marginBottom: 10,
  },

  profileImage: {
    width: "100%",
    height: "100%",
  },

  profileName: {
    color: Colors.white,
    fontSize: 24,
    fontFamily: Fonts.extraBold,
    marginTop: 3,
  },

  profileRole: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: Fonts.medium,
    marginTop: 5,
  },

  verifiedBadge: {
    height: 28,
    paddingHorizontal: 14,
    backgroundColor: Colors.success,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    marginTop: 12,
  },

  unverifiedBadge: {
    backgroundColor: Colors.textMuted,
  },

  verifiedText: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: Fonts.semiBold,
  },

  menuContainer: {
    marginHorizontal: 14,
    backgroundColor: Colors.card,
    borderRadius: 18,
    paddingHorizontal: 13,
    overflow: "hidden",
  },

  menuItem: {
    minHeight: 65,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },

  lastMenuItem: {
    borderBottomWidth: 0,
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  menuIcon: {
    width: 37,
    height: 37,
    borderRadius: 11,
    backgroundColor: Colors.redOverlay,
    alignItems: "center",
    justifyContent: "center",
  },

  menuTitle: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.medium,
  },

  logoutButton: {
    height: 58,
    marginHorizontal: 14,
    marginTop: 25,
    marginBottom: 15,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  logoutText: {
    color: Colors.white,
    fontSize: 17,
    fontFamily: Fonts.bold,
  },

  disabledButton: {
    opacity: 0.7,
  },

  footerText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: Fonts.bold,
    letterSpacing: 1.5,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
  },
});
