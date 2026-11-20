
import axios from "axios";
import { useCallback, useRef, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  RefreshControl,
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
import { SafeAreaView } from "react-native-safe-area-context";

import BASE_URL from "../../constants/AppUrls";
import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";
import { getDeliveryProfile } from "../../utils/Function";

// =====================================================
// CONSTANTS
// =====================================================

const COLORS = {
  background: Colors.background,
  card: Colors.card,
  border: Colors.border,
  red: Colors.primary,
  green: Colors.success,
  white: Colors.white,
  gray: Colors.textSecondary,
};

const LOGOUT_ENDPOINT = "api/delivery/logout";
const TOKEN_KEY = "bakasuran_token";

const STORAGE_KEYS_TO_CLEAR = [
  TOKEN_KEY,
  "token",
  "access_token",
  "accessToken",
  "authToken",
  "user",
  "userData",
];

const DEFAULT_IMAGE = require("../../../assets/images/Friendly Bakasuran Delivery Partner.png");

const MENU_ITEMS = [
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
// HELPERS
// =====================================================

const getProfileData = (response) =>
  response?.data?.data ?? response?.data ?? response?.profile ?? response ?? {};

// Turns relative image paths from the API into full URLs.
const getImageUrl = (image) => {
  if (typeof image !== "string") return null;

  const value = image.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;

  const baseUrl = String(BASE_URL || "").replace(/\/+$/, "");
  return `${baseUrl}/${value.replace(/^\/+/, "")}`;
};

const getIsVerified = (data) => {
  const raw =
    data?.is_verified ??
    data?.verified ??
    data?.verification_status ??
    data?.kyc_status;

  if (raw === undefined || raw === null) return false;
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "number") return raw === 1;

  return ["1", "true", "verified", "approved"].includes(
    String(raw).trim().toLowerCase(),
  );
};

// =====================================================
// MENU ROW
// =====================================================

function MenuRow({ item, isLast, disabled, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, isLast && styles.lastMenuItem]}
      activeOpacity={0.75}
      onPress={() => onPress(item)}
      disabled={disabled}
    >
      <View style={styles.menuLeft}>
        <View style={styles.menuIcon}>
          <Ionicons name={item.icon} size={20} color={COLORS.red} />
        </View>

        <Text style={styles.menuTitle} numberOfLines={1}>
          {item.title}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={21} color={COLORS.gray} />
    </TouchableOpacity>
  );
}

// =====================================================
// PROFILE SCREEN
// =====================================================

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const logoutLock = useRef(false);
  const hasLoadedOnce = useRef(false);

  // =====================================================
  // GET PROFILE
  // =====================================================

  const fetchProfile = useCallback(async (silent = false) => {
    try {
      // Full-screen loader only on the very first load,
      // so coming back to this screen doesn't flash a spinner.
      if (silent) setRefreshing(true);
      else if (!hasLoadedOnce.current) setLoading(true);

      setError("");

      const response = await getDeliveryProfile();

      if (
        response?.success === 0 ||
        response?.success === false ||
        response?.status === false ||
        response?.status === 0
      ) {
        throw new Error(response?.message || "Unable to load profile.");
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
      hasLoadedOnce.current = true;
    } catch (err) {
      if (__DEV__) console.log("PROFILE ERROR:", err?.message || err);

      // Keep showing old data if a background refresh fails.
      if (!hasLoadedOnce.current) {
        setError(err?.message || "Something went wrong. Please try again.");
      } else {
        Alert.alert("Refresh Failed", err?.message || "Please try again.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchProfile(hasLoadedOnce.current);
    }, [fetchProfile]),
  );

  // =====================================================
  // LOGOUT
  // =====================================================

  const finishLogout = async () => {
    try {
      await AsyncStorage.multiRemove(STORAGE_KEYS_TO_CLEAR);
    } catch (storageError) {
      if (__DEV__) console.log("STORAGE CLEAR ERROR:", storageError);
    }

    setProfile(null);
    router.replace("/LogInScreen");
  };

  const performLogout = async () => {
    if (logoutLock.current) return;

    logoutLock.current = true;
    setLoggingOut(true);

    try {
      const token = await AsyncStorage.getItem(TOKEN_KEY);

      // No token means we are already logged out locally.
      if (token) {
        const baseUrl = String(BASE_URL || "").replace(/\/+$/, "");

        try {
          await axios({
            method: "POST",
            url: `${baseUrl}/${LOGOUT_ENDPOINT}`,
            data: {},
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${token.trim()}`,
            },
            timeout: 20000,
          });
        } catch (apiError) {
          const status = apiError?.response?.status;

          // 401 = token already expired/invalid, so logging out locally is correct.
          // Any other failure (network/server): tell the user and stay logged in.
          if (status !== 401) {
            throw apiError;
          }
        }
      }

      await finishLogout();
    } catch (err) {
      if (__DEV__) {
        console.log("LOGOUT ERROR:", err?.response?.data || err?.message);
      }

      Alert.alert(
        "Logout Error",
        err?.response?.data?.message ||
          err?.message ||
          "Unable to log out. Please check your connection.",
      );
    } finally {
      logoutLock.current = false;
      setLoggingOut(false);
    }
  };

  const handleLogout = () => {
    if (loggingOut) return;

    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: performLogout },
    ]);
  };

  // =====================================================
  // MENU NAVIGATION
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

  const imageUrl = getImageUrl(
    profile?.profile_image ||
      profile?.profile_picture ||
      profile?.image ||
      profile?.avatar,
  );

  const imageSource = imageUrl ? { uri: imageUrl } : DEFAULT_IMAGE;
  const isVerified = getIsVerified(profile);

  // =====================================================
  // UI
  // =====================================================

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
          disabled={loggingOut}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Profile</Text>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => fetchProfile(true)}
          disabled={loading || refreshing || loggingOut}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {refreshing ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Ionicons name="refresh-outline" size={22} color={COLORS.white} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchProfile(true)}
            tintColor={COLORS.red}
            colors={[COLORS.red]}
            progressBackgroundColor={COLORS.card}
          />
        }
      >
        {loading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={COLORS.red} />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerBox}>
            <Ionicons
              name="alert-circle-outline"
              size={42}
              color={Colors.primary}
            />

            <Text style={styles.errorText}>{error}</Text>

            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => fetchProfile()}
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

              <Text style={styles.profileName} numberOfLines={2}>
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
              {MENU_ITEMS.map((item, index) => (
                <MenuRow
                  key={item.id}
                  item={item}
                  isLast={index === MENU_ITEMS.length - 1}
                  disabled={loggingOut}
                  onPress={handleMenuPress}
                />
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
    </SafeAreaView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: COLORS.background,
  },

  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontFamily: Fonts.bold,
  },

  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-end",
  },

  scroll: {
    flex: 1,
    width: "100%",
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },

  centerBox: {
    flex: 1,
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  loadingText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: Fonts.medium,
    marginTop: 12,
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

  // The old marginTop: 75 caused the large empty gap at the top.
  profileSection: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },

  profileImageWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: COLORS.white,
    backgroundColor: COLORS.card,
  },

  profileImage: {
    width: "100%",
    height: "100%",
  },

  profileName: {
    color: Colors.white,
    fontSize: 24,
    fontFamily: Fonts.extraBold,
    marginTop: 14,
    textAlign: "center",
  },

  profileRole: {
    color: Colors.textSecondary,
    fontSize: 16,
    marginTop: 4,
  },

  verifiedBadge: {
    height: 30,
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
    fontFamily: Fonts.bold,
  },

  menuContainer: {
    marginHorizontal: 16,
    backgroundColor: COLORS.card,
    borderRadius: 18,
    paddingHorizontal: 14,
    overflow: "hidden",
  },

  menuItem: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: COLORS.border,
  },

  lastMenuItem: {
    borderBottomWidth: 0,
  },

  menuLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingRight: 8,
  },

  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: Colors.redOverlay,
    alignItems: "center",
    justifyContent: "center",
  },

  menuTitle: {
    flex: 1,
    color: COLORS.white,
    fontSize: 16,
    fontFamily: Fonts.medium,
  },

  logoutButton: {
    height: 56,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    backgroundColor: COLORS.red,
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
    marginBottom: Platform.OS === "ios" ? 10 : 20,
  },
});
