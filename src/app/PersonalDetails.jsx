import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
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
};

// =====================================================
// HELPERS
// =====================================================

const getProfileData = (response) => {
  return (
    response?.data?.data ||
    response?.data ||
    response?.profile ||
    response ||
    {}
  );
};

const formatDate = (value) => {
  if (!value) return "";

  const date = String(value);

  // API may return ISO date-time.
  return date.includes("T") ? date.split("T")[0] : date;
};

const getImageUrl = (image) => {
  if (!image) return null;

  const value = String(image).trim();

  if (!value) return null;

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const baseUrl = String(BASE_URL || "").replace(/\/+$/, "");
  const imagePath = value.replace(/^\/+/, "");

  return `${baseUrl}/${imagePath}`;
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
}) {
  return (
    <View style={styles.detailCard}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={25} color={Colors.white} />
      </View>

      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>

        {isEditing && editable ? (
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
            blurOnSubmit={false}
            autoCorrect={false}
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

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pickingImage, setPickingImage] = useState(false);

  // =====================================================
  // FETCH DELIVERY PROFILE
  // =====================================================

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);

      console.log("========== PERSONAL PROFILE FETCH START ==========");

      const response = await getDeliveryProfile();

      console.log(
        "PERSONAL PROFILE RESPONSE:",
        JSON.stringify(response, null, 2),
      );

      if (
        response?.status === false ||
        response?.status === 0 ||
        response?.success === 0
      ) {
        throw new Error(response?.message || "Unable to fetch profile.");
      }

      const data = getProfileData(response);
      const address = data?.address || {};

      const fetchedProfile = {
        name: String(data?.name || ""),
        mobile: String(data?.mobile || ""),
        email: String(data?.email || ""),
        dob: formatDate(data?.date_of_birth || data?.dob),
        addressLine1: String(
          data?.address_line_1 || address?.address_line_1 || "",
        ),
        area: String(data?.area || address?.area || ""),
        city: String(data?.city || address?.city || ""),
        state: String(data?.state || address?.state || ""),
        pincode: String(data?.pincode || address?.pincode || ""),
      };

      setProfile(fetchedProfile);
      setSavedProfile(fetchedProfile);

      const imageUrl = getImageUrl(data?.profile_image);

      setServerProfileImage(imageUrl);

      console.log("PROFILE DATA LOADED:", fetchedProfile);
      console.log("PROFILE IMAGE:", imageUrl);
      console.log("========== PERSONAL PROFILE FETCH END ==========");
    } catch (error) {
      console.log("PROFILE FETCH ERROR:", error?.message || error);

      Alert.alert(
        "Profile Error",
        error?.message || "Unable to load your profile.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // =====================================================
  // UPDATE INPUT
  // =====================================================

  const updateField = (field, value) => {
    setProfile((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

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

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const asset = result.assets[0];

      if (!asset.uri) {
        throw new Error("Selected image is not available.");
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

      let mimeType = asset.mimeType || "image/jpeg";

      if (!allowedTypes.includes(mimeType)) {
        throw new Error("Please select JPG, PNG, or WEBP image.");
      }

      const extension =
        mimeType === "image/png"
          ? "png"
          : mimeType === "image/webp"
            ? "webp"
            : "jpg";

      let selectedFile;

      if (Platform.OS === "web") {
        const imageResponse = await fetch(asset.uri);

        if (!imageResponse.ok) {
          throw new Error("Unable to read the selected image.");
        }

        const blob = await imageResponse.blob();

        mimeType = blob.type || mimeType;

        if (!allowedTypes.includes(mimeType)) {
          throw new Error("Please select JPG, PNG, or WEBP image.");
        }

        selectedFile = new File([blob], `profile_${Date.now()}.${extension}`, {
          type: mimeType,
        });
      } else {
        selectedFile = {
          uri: asset.uri,
          name: asset.fileName || `profile_${Date.now()}.${extension}`,
          type: mimeType,
        };
      }

      setProfileImage({
        uri: asset.uri,
        file: selectedFile,
      });

      console.log("PROFILE IMAGE SELECTED:", {
        name: selectedFile.name,
        type: selectedFile.type,
        platform: Platform.OS,
      });
    } catch (error) {
      console.log("IMAGE PICKER ERROR:", error);

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

    // Email is nullable in your Laravel validation.
    if (profile.email.trim() && !/^\S+@\S+\.\S+$/.test(profile.email.trim())) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return false;
    }

    if (profile.dob.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(profile.dob.trim())) {
      Alert.alert("Invalid Date", "Enter date of birth in YYYY-MM-DD format.");
      return false;
    }

    if (profile.pincode.trim() && !/^\d{6}$/.test(profile.pincode.trim())) {
      Alert.alert("Invalid Pincode", "Enter a valid 6-digit pincode.");
      return false;
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

      console.log("========== PROFILE UPDATE START ==========");

      // Personal information.
      formData.append("name", profile.name.trim());

      // IMPORTANT:
      // Do NOT send mobile here.
      // Mobile is read-only and already belongs to the logged-in partner.

      formData.append("email", profile.email.trim());
      formData.append("date_of_birth", profile.dob.trim());

      // Address information.
      formData.append("address_line_1", profile.addressLine1.trim());
      formData.append("area", profile.area.trim());
      formData.append("city", profile.city.trim());
      formData.append("state", profile.state.trim());
      formData.append("pincode", profile.pincode.trim());

      // Upload image only when a new image is selected.
      appendProfileImage(formData);

      console.log("API ENDPOINT:", API_ENDPOINT);
      console.log("REQUEST METHOD: POST");
      console.log("REQUEST TYPE: MULTIPART");
      console.log("REQUEST FIELDS:");

      for (const [key, value] of formData.entries()) {
        console.log(
          key,
          typeof value === "object"
            ? {
                name: value.name,
                type: value.type,
              }
            : value,
        );
      }

      const response = await postMethod(API_ENDPOINT, formData);

      console.log("========== PROFILE UPDATE RESPONSE ==========");
      console.log(JSON.stringify(response, null, 2));

      const isSuccess =
        response?.status === true ||
        response?.status === 1 ||
        response?.status === "1" ||
        response?.success === true;

      if (isSuccess) {
        const updatedData = getProfileData(response);
        const updatedAddress = updatedData?.address || {};

        const updatedProfile = {
          ...profile,
          name: updatedData?.name ?? profile.name,
          mobile: updatedData?.mobile ?? profile.mobile,
          email: updatedData?.email ?? profile.email,
          dob: formatDate(
            updatedData?.date_of_birth ?? updatedData?.dob ?? profile.dob,
          ),
          addressLine1:
            updatedData?.address_line_1 ??
            updatedAddress?.address_line_1 ??
            profile.addressLine1,
          area: updatedData?.area ?? updatedAddress?.area ?? profile.area,
          city: updatedData?.city ?? updatedAddress?.city ?? profile.city,
          state: updatedData?.state ?? updatedAddress?.state ?? profile.state,
          pincode:
            updatedData?.pincode ?? updatedAddress?.pincode ?? profile.pincode,
        };

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

        console.log("PROFILE UPDATE SUCCESS");
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

        console.log("PROFILE UPDATE FAILED:", response);
      }
    } catch (error) {
      console.log(
        "PROFILE UPDATE ERROR:",
        error?.response?.data || error?.message || error,
      );

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setSaving(false);
      console.log("========== PROFILE UPDATE END ==========");
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
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
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

              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={21} color={Colors.white} />
                <Text style={styles.verifiedText}>Verified Partner</Text>
              </View>
            </View>

            {/* PERSONAL INFORMATION */}
            <SectionHeader icon="person-outline" title="Personal Information" />

            <View style={styles.detailsContainer}>
              <DetailCard
                icon="person-outline"
                label="Full Name"
                field="name"
                profile={profile}
                updateField={updateField}
                isEditing={isEditing}
                saving={saving}
              />

              <DetailCard
                icon="call-outline"
                label="Mobile"
                field="mobile"
                profile={profile}
                updateField={updateField}
                isEditing={isEditing}
                saving={saving}
                editable={false}
              />

              <DetailCard
                icon="mail-outline"
                label="Email Address"
                field="email"
                profile={profile}
                updateField={updateField}
                isEditing={isEditing}
                saving={saving}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <DetailCard
                icon="calendar-outline"
                label="Date of Birth (YYYY-MM-DD)"
                field="dob"
                profile={profile}
                updateField={updateField}
                isEditing={isEditing}
                saving={saving}
                placeholder="YYYY-MM-DD"
              />
            </View>

            {/* ADDRESS INFORMATION */}
            <SectionHeader
              icon="location-outline"
              title="Address Information"
            />

            <View style={styles.detailsContainer}>
              <DetailCard
                icon="home-outline"
                label="Address Line 1"
                field="addressLine1"
                profile={profile}
                updateField={updateField}
                isEditing={isEditing}
                saving={saving}
              />

              <DetailCard
                icon="navigate-outline"
                label="Area"
                field="area"
                profile={profile}
                updateField={updateField}
                isEditing={isEditing}
                saving={saving}
              />

              <DetailCard
                icon="business-outline"
                label="City"
                field="city"
                profile={profile}
                updateField={updateField}
                isEditing={isEditing}
                saving={saving}
              />

              <DetailCard
                icon="map-outline"
                label="State"
                field="state"
                profile={profile}
                updateField={updateField}
                isEditing={isEditing}
                saving={saving}
              />

              <DetailCard
                icon="location-outline"
                label="Pincode"
                field="pincode"
                profile={profile}
                updateField={updateField}
                isEditing={isEditing}
                saving={saving}
                keyboardType="numeric"
              />

              <DetailCard
                icon="location-outline"
                label="Latitude"
                field="latitude"
                profile={profile}
                updateField={updateField}
                isEditing={isEditing}
                saving={saving}
                keyboardType="numeric"
              />

              <DetailCard
                icon="location-outline"
                label="Longitude"
                field="longitude"
                profile={profile}
                updateField={updateField}
                isEditing={isEditing}
                saving={saving}
                keyboardType="numeric"
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

            {/* SAVE BUTTON */}
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
    backgroundColor: "#201010",
    borderWidth: 1,
    borderColor: "#4A1717",
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
