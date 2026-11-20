import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import BASE_URL from "../constants/AppUrls";
import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";

import { postMethod } from "../utils/APIServices";
import { getDeliveryProfile } from "../utils/Function";

const API_ENDPOINT = "api/delivery/profile/update";

const DEFAULT_IMAGE = require("../../assets/images/Profile.png");

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const INITIAL_PROFILE = {
  name: "",
  mobile: "",
  email: "",
  dob: "",
  addressLine1: "",
  area: "",
  city: "",
  state: "",
  pincode: "",
  latitude: "",
  longitude: "",
};

// =====================================================
// HELPERS
// =====================================================

const getProfileData = (response) =>
  response?.data?.data || response?.data || response?.profile || response || {};

const formatDate = (value) => {
  if (!value) return "";
  const date = String(value);
  // API may return an ISO date-time.
  return date.includes("T") ? date.split("T")[0] : date;
};

const getImageUrl = (image) => {
  if (!image) return null;

  const value = String(image).trim();
  if (!value) return null;

  if (/^https?:\/\//i.test(value)) return value;

  const baseUrl = String(BASE_URL || "").replace(/\/+$/, "");
  const imagePath = value.replace(/^\/+/, "");

  return `${baseUrl}/${imagePath}`;
};

// Returns "" for null/undefined, otherwise a string (keeps 0 values).
const toText = (...values) => {
  for (const value of values) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      return String(value);
    }
  }
  return "";
};

// Handles the different shapes a "verified" flag can come in.
const getIsVerified = (data) => {
  const raw =
    data?.is_verified ??
    data?.verified ??
    data?.verification_status ??
    data?.kyc_status ??
    data?.status;

  if (raw === undefined || raw === null) return false;
  if (typeof raw === "boolean") return raw;
  if (typeof raw === "number") return raw === 1;

  return ["1", "true", "verified", "approved", "active"].includes(
    String(raw).trim().toLowerCase(),
  );
};

const mapProfile = (data, fallback = INITIAL_PROFILE) => {
  const address = data?.address || {};

  return {
    name: toText(data?.name, fallback.name),
    mobile: toText(data?.mobile, fallback.mobile),
    email: toText(data?.email, fallback.email),
    dob: formatDate(toText(data?.date_of_birth, data?.dob, fallback.dob)),
    addressLine1: toText(
      data?.address_line_1,
      address?.address_line_1,
      fallback.addressLine1,
    ),
    area: toText(data?.area, address?.area, fallback.area),
    city: toText(data?.city, address?.city, fallback.city),
    state: toText(data?.state, address?.state, fallback.state),
    pincode: toText(data?.pincode, address?.pincode, fallback.pincode),
    latitude: toText(data?.latitude, address?.latitude, fallback.latitude),
    longitude: toText(data?.longitude, address?.longitude, fallback.longitude),
  };
};

// =====================================================
// REUSABLE INPUT COMPONENT
// =====================================================

function DetailCard({
  icon,
  label,
  field,
  profile,
  updateField,
  isEditing,
  saving,
  keyboardType = "default",
  editable = true,
  placeholder,
  autoCapitalize = "sentences",
  maxLength,
}) {
  const showInput = isEditing && editable;

  return (
    <View style={styles.detailCard}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={25} color={Colors.white} />
      </View>

      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>
          {label}
          {isEditing && !editable ? "  (read only)" : ""}
        </Text>

        {showInput ? (
          <TextInput
            style={styles.detailInput}
            value={String(profile[field] ?? "")}
            onChangeText={(value) => updateField(field, value)}
            keyboardType={keyboardType}
            placeholder={placeholder || `Enter ${label}`}
            placeholderTextColor={Colors.placeholder}
            autoCapitalize={autoCapitalize}
            editable={!saving}
            selectionColor={Colors.primary}
            autoCorrect={false}
            maxLength={maxLength}
          />
        ) : (
          <Text style={styles.detailValue}>
            {field === "mobile"
              ? profile.mobile
                ? `+91 ${profile.mobile}`
                : "Not provided"
              : profile[field] || "Not provided"}
          </Text>
        )}
      </View>
    </View>
  );
}

// =====================================================
// SECTION HEADER
// =====================================================

function SectionHeader({ icon, title }) {
  return (
    <LinearGradient
      colors={["#260606", "#100303"]}
      style={styles.sectionHeader}
    >
      <Ionicons name={icon} size={25} color={Colors.primary} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </LinearGradient>
  );
}

// =====================================================
// MAIN SCREEN
// =====================================================

export default function PersonalDetailsScreen() {
  const router = useRouter();

  const [profile, setProfile] = useState({ ...INITIAL_PROFILE });
  const [savedProfile, setSavedProfile] = useState({ ...INITIAL_PROFILE });

  const [profileImage, setProfileImage] = useState(null);
  const [serverProfileImage, setServerProfileImage] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pickingImage, setPickingImage] = useState(false);

  // =====================================================
  // FETCH DELIVERY PROFILE
  // =====================================================

  const fetchProfile = useCallback(async ({ silent = false } = {}) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);

      const response = await getDeliveryProfile();

      if (
        response?.status === false ||
        response?.status === 0 ||
        response?.success === 0
      ) {
        throw new Error(response?.message || "Unable to fetch profile.");
      }

      const data = getProfileData(response);
      const fetchedProfile = mapProfile(data);

      setProfile(fetchedProfile);
      setSavedProfile(fetchedProfile);
      setServerProfileImage(getImageUrl(data?.profile_image));
      setIsVerified(getIsVerified(data));
    } catch (error) {
      if (__DEV__) console.log("PROFILE FETCH ERROR:", error?.message || error);

      Alert.alert(
        "Profile Error",
        error?.message || "Unable to load your profile.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // =====================================================
  // UPDATE INPUT
  // =====================================================

  const updateField = useCallback((field, value) => {
    setProfile((previous) => ({ ...previous, [field]: value }));
  }, []);

  // =====================================================
  // IMAGE PICKER
  // =====================================================

  const handlePickImage = async () => {
    try {
      setPickingImage(true);

      if (Platform.OS !== "web") {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Permission Required",
            "Please allow gallery access to select your profile image.",
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];

      if (!asset.uri) {
        throw new Error("Selected image is not available.");
      }

      let mimeType = (asset.mimeType || "image/jpeg").toLowerCase();

      if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
        throw new Error("Please select a JPG, PNG, or WEBP image.");
      }

      const getExtension = (type) =>
        type === "image/png" ? "png" : type === "image/webp" ? "webp" : "jpg";

      let selectedFile;

      if (Platform.OS === "web") {
        const imageResponse = await fetch(asset.uri);

        if (!imageResponse.ok) {
          throw new Error("Unable to read the selected image.");
        }

        const blob = await imageResponse.blob();
        mimeType = (blob.type || mimeType).toLowerCase();

        if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
          throw new Error("Please select a JPG, PNG, or WEBP image.");
        }

        selectedFile = new File(
          [blob],
          `profile_${Date.now()}.${getExtension(mimeType)}`,
          { type: mimeType },
        );
      } else {
        selectedFile = {
          uri: asset.uri,
          name:
            asset.fileName || `profile_${Date.now()}.${getExtension(mimeType)}`,
          type: mimeType,
        };
      }

      setProfileImage({ uri: asset.uri, file: selectedFile });
    } catch (error) {
      if (__DEV__) console.log("IMAGE PICKER ERROR:", error);

      Alert.alert(
        "Image Error",
        error?.message || "Unable to select profile image.",
      );
    } finally {
      setPickingImage(false);
    }
  };

  // =====================================================
  // FORM VALIDATION
  // =====================================================

  const validateForm = () => {
    if (!profile.name.trim()) {
      Alert.alert("Required", "Please enter your name.");
      return false;
    }

    // Email is nullable on the backend.
    if (profile.email.trim() && !/^\S+@\S+\.\S+$/.test(profile.email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return false;
    }

    const dob = profile.dob.trim();
    if (dob) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
        Alert.alert(
          "Invalid Date",
          "Enter date of birth in YYYY-MM-DD format.",
        );
        return false;
      }

      const parsed = new Date(`${dob}T00:00:00`);
      const isRealDate =
        !Number.isNaN(parsed.getTime()) &&
        parsed.toISOString().slice(0, 10) === dob;

      if (!isRealDate || parsed > new Date()) {
        Alert.alert("Invalid Date", "Please enter a valid date of birth.");
        return false;
      }
    }

    if (profile.pincode.trim() && !/^\d{6}$/.test(profile.pincode.trim())) {
      Alert.alert("Invalid Pincode", "Enter a valid 6-digit pincode.");
      return false;
    }

    const latitude = profile.latitude.trim();
    if (latitude) {
      const value = Number(latitude);
      if (Number.isNaN(value) || value < -90 || value > 90) {
        Alert.alert("Invalid Latitude", "Latitude must be between -90 and 90.");
        return false;
      }
    }

    const longitude = profile.longitude.trim();
    if (longitude) {
      const value = Number(longitude);
      if (Number.isNaN(value) || value < -180 || value > 180) {
        Alert.alert(
          "Invalid Longitude",
          "Longitude must be between -180 and 180.",
        );
        return false;
      }
    }

    return true;
  };

  // =====================================================
  // APPEND IMAGE TO FORMDATA
  // =====================================================

  const appendProfileImage = (formData) => {
    if (!profileImage?.file) return;

    if (Platform.OS === "web") {
      if (typeof File === "undefined" || !(profileImage.file instanceof File)) {
        throw new Error("Selected image is not a valid browser file.");
      }

      formData.append(
        "profile_image",
        profileImage.file,
        profileImage.file.name,
      );
    } else {
      formData.append("profile_image", {
        uri: profileImage.file.uri,
        name: profileImage.file.name,
        type: profileImage.file.type,
      });
    }
  };

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSave = async () => {
    if (saving) return;
    if (!validateForm()) return;

    try {
      setSaving(true);

      const formData = new FormData();

      // Personal information.
      formData.append("name", profile.name.trim());

      // IMPORTANT: mobile is read-only, so it is NOT sent.
      formData.append("email", profile.email.trim());
      formData.append("date_of_birth", profile.dob.trim());

      // Address information.
      formData.append("address_line_1", profile.addressLine1.trim());
      formData.append("area", profile.area.trim());
      formData.append("city", profile.city.trim());
      formData.append("state", profile.state.trim());
      formData.append("pincode", profile.pincode.trim());

      // Coordinates: only send when filled, so we never overwrite with "".
      if (profile.latitude.trim()) {
        formData.append("latitude", profile.latitude.trim());
      }
      if (profile.longitude.trim()) {
        formData.append("longitude", profile.longitude.trim());
      }

      // Upload image only when a new one is selected.
      appendProfileImage(formData);

      const response = await postMethod(API_ENDPOINT, formData);

      const isSuccess =
        response?.status === true ||
        response?.status === 1 ||
        response?.status === "1" ||
        response?.success === true;

      if (isSuccess) {
        const updatedData = getProfileData(response);
        const updatedProfile = mapProfile(updatedData, profile);

        setProfile(updatedProfile);
        setSavedProfile(updatedProfile);

        if (updatedData?.profile_image) {
          setServerProfileImage(getImageUrl(updatedData.profile_image));
        }

        setProfileImage(null);
        setIsEditing(false);

        Alert.alert(
          "Success",
          response?.message || "Profile updated successfully.",
        );
      } else if (response?.errors) {
        const errorMessages = Object.entries(response.errors)
          .map(([field, messages]) => {
            const message = Array.isArray(messages)
              ? messages.join(", ")
              : String(messages);
            return `${field}: ${message}`;
          })
          .join("\n");

        Alert.alert("Validation Error", errorMessages);
      } else {
        Alert.alert(
          "Update Failed",
          response?.message || "Unable to update profile.",
        );
      }
    } catch (error) {
      if (__DEV__) {
        console.log(
          "PROFILE UPDATE ERROR:",
          error?.response?.data || error?.message || error,
        );
      }

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // CANCEL EDITING
  // =====================================================

  const handleCancel = () => {
    if (saving) return;

    setProfile({ ...savedProfile });
    setProfileImage(null);
    setIsEditing(false);
  };

  // =====================================================
  // PROFILE IMAGE SOURCE
  // =====================================================

  const currentProfileImage = profileImage?.uri
    ? { uri: profileImage.uri }
    : serverProfileImage
      ? { uri: serverProfileImage }
      : DEFAULT_IMAGE;

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.background}
        />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Shared props for every DetailCard.
  const common = { profile, updateField, isEditing, saving };

  // =====================================================
  // UI
  // =====================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <LinearGradient
        colors={Colors.gradients.background}
        style={styles.background}
      >
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchProfile({ silent: true })}
                tintColor={Colors.primary}
                colors={[Colors.primary]}
                enabled={!isEditing}
              />
            }
          >
            {/* HEADER */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
                disabled={saving}
              >
                <Ionicons name="chevron-back" size={28} color={Colors.white} />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>Personal Details</Text>

              <TouchableOpacity
                onPress={() =>
                  isEditing ? handleCancel() : setIsEditing(true)
                }
                style={styles.editIconButton}
                disabled={saving}
              >
                <Ionicons
                  name={isEditing ? "close" : "create-outline"}
                  size={27}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* PROFILE IMAGE */}
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={currentProfileImage}
                  style={styles.profileImage}
                  resizeMode="cover"
                />

                {isEditing && (
                  <TouchableOpacity
                    style={styles.cameraButton}
                    onPress={handlePickImage}
                    disabled={pickingImage || saving}
                  >
                    {pickingImage ? (
                      <ActivityIndicator color={Colors.white} />
                    ) : (
                      <Ionicons name="camera" size={21} color={Colors.white} />
                    )}
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.profileName}>
                {profile.name || "Delivery Partner"}
              </Text>

              <Text style={styles.profileRole}>Delivery Partner</Text>

              {/* Reflects the real status, same as the My Profile screen */}
              <View
                style={[
                  styles.verifiedBadge,
                  !isVerified && styles.unverifiedBadge,
                ]}
              >
                <Ionicons
                  name={isVerified ? "checkmark" : "time-outline"}
                  size={isVerified ? 21 : 18}
                  color={Colors.white}
                />
                <Text style={styles.verifiedText}>
                  {isVerified ? "Verified Partner" : "Not Verified"}
                </Text>
              </View>
            </View>

            {/* PERSONAL INFORMATION */}
            <SectionHeader icon="person-outline" title="Personal Information" />

            <View style={styles.detailsContainer}>
              <DetailCard
                {...common}
                icon="person-outline"
                label="Full Name"
                field="name"
              />

              <DetailCard
                {...common}
                icon="call-outline"
                label="Mobile"
                field="mobile"
                editable={false}
              />

              <DetailCard
                {...common}
                icon="mail-outline"
                label="Email Address"
                field="email"
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <DetailCard
                {...common}
                icon="calendar-outline"
                label="Date of Birth (YYYY-MM-DD)"
                field="dob"
                placeholder="YYYY-MM-DD"
                keyboardType="numbers-and-punctuation"
                maxLength={10}
              />
            </View>

            {/* ADDRESS INFORMATION */}
            <SectionHeader
              icon="location-outline"
              title="Address Information"
            />

            <View style={styles.detailsContainer}>
              <DetailCard
                {...common}
                icon="home-outline"
                label="Address Line 1"
                field="addressLine1"
              />

              <DetailCard
                {...common}
                icon="navigate-outline"
                label="Area"
                field="area"
              />

              <DetailCard
                {...common}
                icon="business-outline"
                label="City"
                field="city"
              />

              <DetailCard
                {...common}
                icon="map-outline"
                label="State"
                field="state"
              />

              <DetailCard
                {...common}
                icon="location-outline"
                label="Pincode"
                field="pincode"
                keyboardType="number-pad"
                maxLength={6}
              />

              <DetailCard
                {...common}
                icon="compass-outline"
                label="Latitude"
                field="latitude"
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
              />

              <DetailCard
                {...common}
                icon="compass-outline"
                label="Longitude"
                field="longitude"
                keyboardType="numbers-and-punctuation"
                autoCapitalize="none"
              />
            </View>

            {/* INFORMATION CARD */}
            <View style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons
                  name="information-circle-outline"
                  size={24}
                  color={Colors.primary}
                />
                <Text style={styles.infoTitle}>Important Information</Text>
              </View>

              <Text style={styles.infoText}>
                • Enter your correct personal information.
              </Text>
              <Text style={styles.infoText}>
                • Make sure your email address is valid.
              </Text>
              <Text style={styles.infoText}>
                • Upload a clear profile image.
              </Text>
              <Text style={styles.infoText}>
                • Enter your correct 6-digit pincode.
              </Text>
            </View>

            {/* SAVE / EDIT BUTTON */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.buttonWrapper, saving && styles.disabledButton]}
              onPress={isEditing ? handleSave : () => setIsEditing(true)}
              disabled={saving || pickingImage}
            >
              <LinearGradient
                colors={Colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButton}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Ionicons
                    name={
                      isEditing ? "checkmark-circle-outline" : "create-outline"
                    }
                    size={25}
                    color={Colors.white}
                  />
                )}

                <Text style={styles.saveButtonText}>
                  {saving
                    ? "Updating..."
                    : isEditing
                      ? "Save Changes"
                      : "Edit Details"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* CANCEL BUTTON */}
            {isEditing && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={saving}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.footerText}>BAKASURAN DELIVERY PARTNER</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  background: {
    flex: 1,
  },

  keyboardContainer: {
    flex: 1,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    gap: 15,
  },

  loadingText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: Fonts.medium,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  header: {
    height: 55,
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
    fontSize: 19,
    fontFamily: Fonts.extraBold,
  },

  editIconButton: {
    width: 40,
    alignItems: "flex-end",
  },

  profileSection: {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 30,
  },

  profileImageContainer: {
    position: "relative",
  },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: Colors.white,
  },

  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: -5,
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  profileName: {
    color: Colors.white,
    fontSize: 25,
    fontFamily: Fonts.extraBold,
    marginTop: 14,
    textAlign: "center",
  },

  profileRole: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: Fonts.regular,
    marginTop: 5,
  },

  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.success,
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 30,
    marginTop: 17,
  },

  unverifiedBadge: {
    backgroundColor: "#4B4B4B",
  },

  verifiedText: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: Fonts.bold,
  },

  sectionHeader: {
    minHeight: 65,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 17,
    gap: 14,
    marginHorizontal: -20,
    marginTop: 20,
    marginBottom: 14,
  },

  sectionTitle: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: Fonts.bold,
  },

  detailsContainer: {
    gap: 13,
  },

  detailCard: {
    minHeight: 83,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
  },

  detailIcon: {
    width: 48,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  detailContent: {
    flex: 1,
    justifyContent: "center",
  },

  detailLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: Fonts.regular,
    marginBottom: 5,
  },

  detailValue: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.bold,
    lineHeight: 24,
  },

  detailInput: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.bold,
    padding: 0,
    minHeight: 28,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
  },

  infoCard: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 16,
    marginTop: 25,
  },

  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },

  infoTitle: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: Fonts.bold,
  },

  infoText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: Fonts.regular,
    lineHeight: 23,
  },

  buttonWrapper: {
    marginTop: 30,
    borderRadius: 15,
    overflow: "hidden",
  },

  disabledButton: {
    opacity: 0.7,
  },

  saveButton: {
    minHeight: 65,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 13,
  },

  saveButtonText: {
    color: Colors.white,
    fontSize: 19,
    fontFamily: Fonts.extraBold,
  },

  cancelButton: {
    alignItems: "center",
    paddingVertical: 15,
    marginTop: 8,
  },

  cancelText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },

  footerText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: Fonts.bold,
    letterSpacing: 1.5,
    textAlign: "center",
    marginTop: 25,
  },
});
