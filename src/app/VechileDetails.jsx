import { useState } from "react";

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
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import BASE_URL from "../constants/AppUrls";
import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";
import { updateVehicleDetails } from "../utils/Function";

const TOKEN_KEY = "bakasuran_token";

const initialDetails = {
  vehicleType: "",
  vehicleNumber: "",
  vehicleModel: "",
  drivingLicenseNumber: "",
};

// =====================================================
// REUSABLE DETAIL CARD - OUTSIDE SCREEN
// This prevents input focus loss while typing.
// =====================================================

const DetailCard = ({
  icon,
  label,
  field,
  value,
  placeholder,
  autoCapitalize = "none",
  isEditing,
  isSaving,
  updateField,
}) => (
  <View style={styles.detailCard}>
    <View style={styles.detailIcon}>
      <Ionicons name={icon} size={24} color={Colors.white} />
    </View>

    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>

      {isEditing ? (
        <TextInput
          style={styles.detailInput}
          value={value}
          onChangeText={(text) => updateField(field, text)}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          editable={!isSaving}
          underlineColorAndroid="transparent"
        />
      ) : (
        <Text style={styles.detailValue}>{value || "Not added"}</Text>
      )}
    </View>
  </View>
);

// =====================================================
// SECTION HEADER
// =====================================================

const SectionHeader = ({ icon, title }) => (
  <LinearGradient colors={["#260606", "#100303"]} style={styles.sectionHeader}>
    <Ionicons name={icon} size={24} color={Colors.primary} />
    <Text style={styles.sectionTitle}>{title}</Text>
  </LinearGradient>
);

// =====================================================
// DOCUMENT CARD
// =====================================================

const DocumentCard = ({ icon, title, image, onPick, onUpload, uploading }) => (
  <View style={styles.documentCard}>
    <View style={styles.documentTop}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={24} color={Colors.white} />
      </View>

      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{title}</Text>

        <Text style={styles.detailValue}>
          {image ? "Image selected" : "Document not selected"}
        </Text>
      </View>

      <Ionicons
        name={image ? "checkmark-circle" : "alert-circle-outline"}
        size={22}
        color={image ? "#36C275" : Colors.primary}
      />
    </View>

    {image ? (
      <Image source={{ uri: image }} style={styles.documentPreview} />
    ) : null}

    <TouchableOpacity
      style={styles.documentButton}
      onPress={onPick}
      disabled={uploading}
    >
      <Ionicons name="image-outline" size={19} color={Colors.white} />
      <Text style={styles.documentButtonText}>
        {image ? "Change Image" : "Choose Image"}
      </Text>
    </TouchableOpacity>

    {image ? (
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={onUpload}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <>
            <Ionicons
              name="cloud-upload-outline"
              size={20}
              color={Colors.white}
            />
            <Text style={styles.documentButtonText}>Upload Document</Text>
          </>
        )}
      </TouchableOpacity>
    ) : null}
  </View>
);

// =====================================================
// MAIN SCREEN
// =====================================================

export default function VehicleDetailsScreen() {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [details, setDetails] = useState(initialDetails);
  const [savedDetails, setSavedDetails] = useState(initialDetails);

  const [drivingLicenseImage, setDrivingLicenseImage] = useState(null);
  const [vehicleRcImage, setVehicleRcImage] = useState(null);

  // =====================================================
  // UPDATE INPUT FIELDS
  // =====================================================

  const updateField = (field, value) => {
    setDetails((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // =====================================================
  // EDIT DETAILS
  // =====================================================

  const handleEdit = () => {
    setIsEditing(true);
  };

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  const handleCancel = () => {
    setDetails(savedDetails);
    setIsEditing(false);
  };

  // =====================================================
  // VEHICLE DETAILS UPDATE API
  // POST api/delivery/vehicle-details/update
  // =====================================================

  const handleSave = async () => {
    if (isSaving) return;

    const payload = {
      vehicle_type: String(details.vehicleType || "").trim(),
      vehicle_number: String(details.vehicleNumber || "")
        .trim()
        .toUpperCase(),
      vehicle_model: String(details.vehicleModel || "").trim(),
      driving_license_number: String(details.drivingLicenseNumber || "")
        .trim()
        .toUpperCase(),
    };

    if (
      !payload.vehicle_type ||
      !payload.vehicle_number ||
      !payload.vehicle_model ||
      !payload.driving_license_number
    ) {
      Alert.alert(
        "Required Fields",
        "Please fill in all vehicle and driving licence details.",
      );
      return;
    }

    try {
      setIsSaving(true);

      console.log("========== VEHICLE UPDATE START ==========");
      console.log("PAYLOAD:", payload);

      const response = await updateVehicleDetails(payload);

      console.log("VEHICLE UPDATE RESPONSE:", response);

      const success =
        response?.status === true ||
        response?.status === 1 ||
        response?.status === "1" ||
        response?.status === "true" ||
        response?.success === true ||
        response?.success === 1 ||
        response?.success === "1";

      if (!success) {
        Alert.alert(
          "Update Failed",
          response?.message || "Unable to update vehicle details.",
        );
        return;
      }

      const responseData = response?.data || {};

      const updatedDetails = {
        vehicleType: responseData.vehicle_type ?? payload.vehicle_type,

        vehicleNumber: responseData.vehicle_number ?? payload.vehicle_number,

        vehicleModel: responseData.vehicle_model ?? payload.vehicle_model,

        drivingLicenseNumber:
          responseData.driving_license_number ?? payload.driving_license_number,
      };

      setDetails(updatedDetails);
      setSavedDetails(updatedDetails);
      setIsEditing(false);

      if (responseData.driving_license_image) {
        setDrivingLicenseImage(responseData.driving_license_image);
      }

      if (responseData.vehicle_rc_image) {
        setVehicleRcImage(responseData.vehicle_rc_image);
      }

      Alert.alert(
        "Success",
        response?.message || "Vehicle details updated successfully.",
      );
    } catch (error) {
      console.log("VEHICLE UPDATE ERROR:", error?.response?.data || error);

      Alert.alert(
        "Error",
        error?.response?.data?.message ||
          error?.message ||
          "Unable to update vehicle details.",
      );
    } finally {
      setIsSaving(false);
      console.log("========== VEHICLE UPDATE END ==========");
    }
  };

  // =====================================================
  // PICK DOCUMENT IMAGE
  // =====================================================

  const pickDocument = async (documentType) => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow photo library access to select your document.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      const selectedImage = result.assets[0];

      if (documentType === "driving") {
        setDrivingLicenseImage(selectedImage.uri);
      } else {
        setVehicleRcImage(selectedImage.uri);
      }
    } catch (error) {
      console.log("IMAGE PICKER ERROR:", error);

      Alert.alert("Error", "Unable to select image.");
    }
  };

  // =====================================================
  // BUILD IMAGE FILE FOR UPLOAD
  // Supports Android, iOS and Expo Web.
  // =====================================================

  const createUploadFile = async (uri, fieldName) => {
    const extension =
      uri.split("?")[0].split(".").pop()?.toLowerCase() || "jpg";

    const mimeType =
      extension === "png"
        ? "image/png"
        : extension === "webp"
          ? "image/webp"
          : "image/jpeg";

    const fileName = `${fieldName}.${extension}`;

    if (Platform.OS === "web") {
      const blob = await fetch(uri).then((res) => res.blob());

      return new File([blob], fileName, {
        type: blob.type || mimeType,
      });
    }

    return {
      uri,
      name: fileName,
      type: mimeType,
    };
  };

  // =====================================================
  // DOCUMENT UPLOAD API
  // POST api/delivery/documents/upload
  //
  // Backend multipart fields:
  // driving_license_image
  // vehicle_rc_image
  // =====================================================

  const uploadDocuments = async (documentType) => {
    if (isUploading) return;

    const image =
      documentType === "driving" ? drivingLicenseImage : vehicleRcImage;

    if (!image) {
      Alert.alert("Select Image", "Please select a document image first.");
      return;
    }

    try {
      setIsUploading(true);

      const token = await AsyncStorage.getItem(TOKEN_KEY);

      if (!token) {
        Alert.alert(
          "Login Required",
          "Your login session was not found. Please log in again.",
        );
        return;
      }

      const formData = new FormData();

      const fieldName =
        documentType === "driving"
          ? "driving_license_image"
          : "vehicle_rc_image";

      const file = await createUploadFile(image, fieldName);

      formData.append(fieldName, file);

      const baseUrl = String(BASE_URL || "").replace(/\/+$/, "");

      const uploadUrl = `${baseUrl}/api/delivery/documents/upload`;

      console.log("========== DOCUMENT UPLOAD START ==========");
      console.log("UPLOAD URL:", uploadUrl);
      console.log("DOCUMENT FIELD:", fieldName);

      const response = await axios.post(uploadUrl, formData, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.trim()}`,
        },
        timeout: 60000,
      });

      console.log("DOCUMENT UPLOAD RESPONSE:", response.data);

      const result = response.data;

      const success =
        result?.status === true ||
        result?.status === 1 ||
        result?.status === "1" ||
        result?.status === "true" ||
        result?.success === true ||
        result?.success === 1 ||
        result?.success === "1";

      if (!success) {
        throw new Error(result?.message || "Document upload was unsuccessful.");
      }

      Alert.alert(
        "Success",
        result?.message || "Document uploaded successfully.",
      );

      console.log("DOCUMENT UPLOAD SUCCESS");
    } catch (error) {
      console.log("========== DOCUMENT UPLOAD ERROR ==========");
      console.log("ERROR:", error?.message);
      console.log("STATUS:", error?.response?.status);
      console.log("SERVER RESPONSE:", error?.response?.data);

      const validationErrors = error?.response?.data?.errors;

      const validationMessage = validationErrors
        ? Object.values(validationErrors).flat().join("\n")
        : "";

      Alert.alert(
        "Upload Failed",
        validationMessage ||
          error?.response?.data?.message ||
          error?.message ||
          "Unable to upload document.",
      );
    } finally {
      setIsUploading(false);
      console.log("========== DOCUMENT UPLOAD END ==========");
    }
  };

  // =====================================================
  // SCREEN UI
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
                style={styles.backButton}
                onPress={() => router.back()}
                disabled={isSaving || isUploading}
              >
                <Ionicons name="chevron-back" size={28} color={Colors.white} />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>Vehicle Details</Text>

              <TouchableOpacity
                style={styles.editIconButton}
                onPress={isEditing ? handleCancel : handleEdit}
                disabled={isSaving || isUploading}
              >
                <Ionicons
                  name={isEditing ? "close" : "create-outline"}
                  size={27}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* HERO */}

            <View style={styles.heroSection}>
              <LinearGradient
                colors={["#450909", "#180303", "#050505"]}
                style={styles.heroCircle}
              >
                <Ionicons name="bicycle" size={95} color={Colors.white} />

                <View style={styles.heroCheck}>
                  <Ionicons
                    name="shield-checkmark"
                    size={28}
                    color={Colors.white}
                  />
                </View>
              </LinearGradient>

              <Text style={styles.heroTitle}>Your Vehicle Information</Text>

              <Text style={styles.heroDescription}>
                Keep your vehicle and driving licence details updated.
              </Text>
            </View>

            {/* VEHICLE INFORMATION */}

            <SectionHeader icon="bicycle-outline" title="Vehicle Information" />

            <View style={styles.detailsContainer}>
              <DetailCard
                icon="car-outline"
                label="Vehicle Type"
                field="vehicleType"
                value={details.vehicleType}
                placeholder="Bike / Scooter / Car"
                autoCapitalize="words"
                isEditing={isEditing}
                isSaving={isSaving}
                updateField={updateField}
              />

              <DetailCard
                icon="construct-outline"
                label="Vehicle Model"
                field="vehicleModel"
                value={details.vehicleModel}
                placeholder="Enter vehicle model"
                autoCapitalize="words"
                isEditing={isEditing}
                isSaving={isSaving}
                updateField={updateField}
              />

              <DetailCard
                icon="card-outline"
                label="Vehicle Number"
                field="vehicleNumber"
                value={details.vehicleNumber}
                placeholder="Enter vehicle registration number"
                autoCapitalize="characters"
                isEditing={isEditing}
                isSaving={isSaving}
                updateField={updateField}
              />
            </View>

            {/* DRIVING LICENCE */}

            <SectionHeader
              icon="id-card-outline"
              title="Driving Licence Details"
            />

            <View style={styles.detailsContainer}>
              <DetailCard
                icon="card-outline"
                label="Driving Licence Number"
                field="drivingLicenseNumber"
                value={details.drivingLicenseNumber}
                placeholder="Enter driving licence number"
                autoCapitalize="characters"
                isEditing={isEditing}
                isSaving={isSaving}
                updateField={updateField}
              />
            </View>

            {/* DOCUMENT UPLOAD */}

            <SectionHeader
              icon="document-text-outline"
              title="Vehicle Documents"
            />

            <View style={styles.detailsContainer}>
              <DocumentCard
                icon="id-card-outline"
                title="Driving Licence Image"
                image={drivingLicenseImage}
                onPick={() => pickDocument("driving")}
                onUpload={() => uploadDocuments("driving")}
                uploading={isUploading}
              />

              <DocumentCard
                icon="document-outline"
                title="Vehicle RC Image"
                image={vehicleRcImage}
                onPick={() => pickDocument("rc")}
                onUpload={() => uploadDocuments("rc")}
                uploading={isUploading}
              />
            </View>

            {/* INFORMATION */}

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
                • Enter your correct vehicle registration number.
              </Text>

              <Text style={styles.infoText}>
                • Make sure your driving licence number is correct.
              </Text>

              <Text style={styles.infoText}>
                • Upload clear images of your driving licence and RC.
              </Text>
            </View>

            {/* SAVE BUTTON */}

            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.buttonWrapper, isSaving && styles.disabledButton]}
              onPress={isEditing ? handleSave : handleEdit}
              disabled={isSaving || isUploading}
            >
              <LinearGradient
                colors={Colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButton}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Ionicons
                    name={
                      isEditing ? "checkmark-circle-outline" : "create-outline"
                    }
                    size={24}
                    color={Colors.white}
                  />
                )}

                <Text style={styles.saveButtonText}>
                  {isSaving
                    ? "Saving..."
                    : isEditing
                      ? "Save Vehicle Details"
                      : "Edit Vehicle Details"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {isEditing && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
                disabled={isSaving}
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

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 35,
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
    fontSize: 24,
    fontFamily: Fonts.extraBold,
  },

  editIconButton: {
    width: 40,
    alignItems: "flex-end",
  },

  heroSection: {
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
  },

  heroCircle: {
    width: 190,
    height: 170,
    borderRadius: 95,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  heroCheck: {
    position: "absolute",
    bottom: 5,
    right: 15,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.background,
  },

  heroTitle: {
    color: Colors.white,
    fontSize: 19,
    fontFamily: Fonts.bold,
    marginTop: 18,
  },

  heroDescription: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: Fonts.regular,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 21,
  },

  sectionHeader: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 22,
    marginBottom: 12,
    gap: 12,
  },

  sectionTitle: {
    color: Colors.white,
    fontSize: 22,
    fontFamily: Fonts.bold,
  },

  detailsContainer: {
    gap: 12,
  },

  detailCard: {
    minHeight: 85,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 13,
    padding: 14,
    borderWidth: 1,
    borderColor: "#303030",
  },

  detailIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#4A1012",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 13,
  },

  detailContent: {
    flex: 1,
  },

  detailLabel: {
    color: Colors.textSecondary,
    fontSize: 19,
    fontFamily: Fonts.medium,
    marginBottom: 6,
  },

  detailValue: {
    color: Colors.white,
    fontSize: 17,
    fontFamily: Fonts.semiBold,
  },

  detailInput: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: Fonts.medium,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary,
    minHeight: 36,
  },

  documentCard: {
    backgroundColor: Colors.card,
    borderRadius: 13,
    padding: 14,
    borderWidth: 1,
    borderColor: "#303030",
  },

  documentTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  documentPreview: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginTop: 15,
    resizeMode: "contain",
    backgroundColor: "#101010",
  },

  documentButton: {
    backgroundColor: "#4A1012",
    borderRadius: 10,
    minHeight: 46,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
    marginTop: 14,
  },

  uploadButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minHeight: 46,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 9,
    marginTop: 10,
  },

  documentButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: Fonts.semiBold,
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
    fontSize: 13,
    fontFamily: Fonts.regular,
    lineHeight: 23,
  },

  buttonWrapper: {
    marginTop: 28,
    borderRadius: 14,
    overflow: "hidden",
  },

  disabledButton: {
    opacity: 0.65,
  },

  saveButton: {
    minHeight: 58,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  saveButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.regular,
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
    fontSize: 13,
    fontFamily: Fonts.regular,
    textAlign: "center",
    letterSpacing: 2,
    marginTop: 30,
  },
});
