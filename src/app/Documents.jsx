import { useState } from "react";

import {
  ActivityIndicator,
  Alert,
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

import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";
import { postMethod } from "../utils/APIServices";

// =====================================================
// API CONFIG
// =====================================================

const UPLOAD_ENDPOINT = "api/delivery/documents/upload";

const IMAGE_FIELDS = [
  {
    key: "aadhar_front_image",
    title: "Aadhaar Front Image",
    description: "Select the front side of your Aadhaar card",
    icon: "card-outline",
  },
  {
    key: "aadhar_back_image",
    title: "Aadhaar Back Image",
    description: "Select the back side of your Aadhaar card",
    icon: "card-outline",
  },
  {
    key: "pan_image",
    title: "PAN Card Image",
    description: "Select a clear image of your PAN card",
    icon: "id-card-outline",
  },
];

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

// =====================================================
// DOCUMENT SCREEN
// =====================================================

export default function DocumentsScreen() {
  const router = useRouter();

  const [aadharNumber, setAadharNumber] = useState("");
  const [panNumber, setPanNumber] = useState("");

  const [files, setFiles] = useState({
    aadhar_front_image: null,
    aadhar_back_image: null,
    pan_image: null,
  });

  const [uploadingField, setUploadingField] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedCount = Object.values(files).filter(Boolean).length;
  const totalCount = IMAGE_FIELDS.length;
  const progress = Math.round((selectedCount / totalCount) * 100);

  // =====================================================
  // SELECT IMAGE - WEB / ANDROID / IOS
  // =====================================================

  const selectImage = async (fieldKey) => {
    try {
      setUploadingField(fieldKey);

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow gallery access to select your document.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.8,
        exif: false,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];

      if (!asset?.uri) {
        throw new Error("Selected image is not available.");
      }

      let imageFile;

      // ---------------- WEB ----------------

      if (Platform.OS === "web") {
        const imageResponse = await fetch(asset.uri);

        if (!imageResponse.ok) {
          throw new Error("Unable to read the selected image.");
        }

        const imageBlob = await imageResponse.blob();

        let mimeType = (imageBlob.type || asset.mimeType || "").toLowerCase();

        if (mimeType === "image/jpg") {
          mimeType = "image/jpeg";
        }

        const extension = ALLOWED_TYPES[mimeType];

        if (!extension) {
          throw new Error("Please select a JPG, JPEG, PNG, or WEBP image.");
        }

        if (typeof File === "undefined") {
          throw new Error("Browser File upload is not supported.");
        }

        imageFile = new File(
          [imageBlob],
          `document_${Date.now()}.${extension}`,
          { type: mimeType },
        );
      } else {
        // ---------------- ANDROID / IOS ----------------

        let mimeType = (asset.mimeType || "image/jpeg").toLowerCase();

        if (mimeType === "image/jpg") {
          mimeType = "image/jpeg";
        }

        const extension = ALLOWED_TYPES[mimeType];

        if (!extension) {
          throw new Error("Please select a JPG, JPEG, PNG, or WEBP image.");
        }

        imageFile = {
          uri: asset.uri,
          name: asset.fileName || `document_${Date.now()}.${extension}`,
          type: mimeType,
        };
      }

      setFiles((previous) => ({
        ...previous,
        [fieldKey]: imageFile,
      }));

      console.log("SELECTED IMAGE:", fieldKey, {
        name: imageFile.name,
        type: imageFile.type,
        platform: Platform.OS,
      });
    } catch (error) {
      console.log("IMAGE PICKER ERROR:", error?.message);

      Alert.alert(
        "Image Selection Error",
        error?.message || "Unable to select image.",
      );
    } finally {
      setUploadingField(null);
    }
  };

  // =====================================================
  // REMOVE IMAGE
  // =====================================================

  const removeImage = (fieldKey) => {
    setFiles((previous) => ({
      ...previous,
      [fieldKey]: null,
    }));
  };

  // =====================================================
  // VALIDATE FORM
  // =====================================================

  const validateForm = () => {
    const cleanAadhar = String(aadharNumber || "").replace(/\D/g, "");
    const cleanPan = String(panNumber || "")
      .trim()
      .toUpperCase();

    if (!/^\d{12}$/.test(cleanAadhar)) {
      Alert.alert("Invalid Aadhaar", "Enter a valid 12-digit Aadhaar number.");
      return false;
    }

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(cleanPan)) {
      Alert.alert("Invalid PAN", "Enter a valid 10-character PAN number.");
      return false;
    }

    if (!files.aadhar_front_image) {
      Alert.alert("Missing Image", "Select Aadhaar front image.");
      return false;
    }

    if (!files.aadhar_back_image) {
      Alert.alert("Missing Image", "Select Aadhaar back image.");
      return false;
    }

    if (!files.pan_image) {
      Alert.alert("Missing Image", "Select PAN card image.");
      return false;
    }

    console.log("VALIDATION SUCCESS");

    return true;
  };

  // =====================================================
  // APPEND IMAGE TO FORM DATA
  // =====================================================

  const appendImage = (formData, fieldKey) => {
    const file = files[fieldKey];

    if (!file) {
      throw new Error(`${fieldKey} is missing.`);
    }

    if (Platform.OS === "web") {
      if (typeof File === "undefined" || !(file instanceof File)) {
        throw new Error(
          `${fieldKey} is not a valid browser File. Please select it again.`,
        );
      }

      // Web: append actual browser File.
      formData.append(fieldKey, file, file.name);
    } else {
      // Android / iOS: append native file object.
      if (!file.uri) {
        throw new Error(`${fieldKey} image URI is missing.`);
      }

      formData.append(fieldKey, {
        uri: file.uri,
        name: file.name,
        type: file.type,
      });
    }

    console.log("IMAGE APPENDED:", fieldKey, file.name);
  };

  // =====================================================
  // SUBMIT DOCUMENTS API
  // =====================================================

  const handleSubmit = async () => {
    console.log("========== DOCUMENT UPLOAD START ==========");

    if (submitting) {
      console.log("UPLOAD ALREADY IN PROGRESS");
      return;
    }

    if (!validateForm()) {
      console.log("VALIDATION FAILED - API NOT CALLED");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      // Text fields
      formData.append("aadhar_number", String(aadharNumber).replace(/\D/g, ""));

      formData.append("pan_number", String(panNumber).trim().toUpperCase());

      // Image fields
      IMAGE_FIELDS.forEach((field) => {
        appendImage(formData, field.key);
      });

      console.log("========== FORM DATA READY ==========");
      console.log("TEXT FIELDS: ADDED");
      console.log("IMAGE FIELDS: ADDED");
      console.log("API URL:", UPLOAD_ENDPOINT);
      console.log("CALLING POST METHOD...");

      const response = await postMethod(UPLOAD_ENDPOINT, formData);

      console.log("========== API RESPONSE ==========");
      console.log(JSON.stringify(response, null, 2));

      const isSuccess =
        response?.status === true ||
        response?.status === 1 ||
        response?.status === "1";

      if (isSuccess) {
        Alert.alert(
          "Success",
          response?.message || "Documents uploaded successfully.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ],
        );
      } else {
        const validationErrors = response?.errors;

        const errorMessage = validationErrors
          ? Object.entries(validationErrors)
              .map(([key, messages]) => {
                return `${key}: ${
                  Array.isArray(messages) ? messages.join(", ") : messages
                }`;
              })
              .join("\n")
          : response?.message || "The server did not accept the documents.";

        Alert.alert("Upload Failed", errorMessage);
      }
    } catch (error) {
      console.log("========== DOCUMENT UPLOAD ERROR ==========");
      console.log("MESSAGE:", error?.message);

      Alert.alert(
        "Upload Error",
        error?.message || "Unable to upload documents.",
      );
    } finally {
      setSubmitting(false);
      console.log("========== DOCUMENT UPLOAD END ==========");
    }
  };

  // =====================================================
  // IMAGE CARD
  // =====================================================

  const renderImageCard = (field) => {
    const file = files[field.key];
    const isSelecting = uploadingField === field.key;

    return (
      <View key={field.key} style={styles.documentCard}>
        <View style={styles.documentCardHeader}>
          <View style={styles.documentIcon}>
            <Ionicons name={field.icon} size={25} color={Colors.primary} />
          </View>

          <View style={styles.documentInfo}>
            <Text style={styles.documentTitle}>{field.title}</Text>

            <Text style={styles.documentDescription}>{field.description}</Text>
          </View>
        </View>

        {file ? (
          <View style={styles.selectedFileBox}>
            <View style={styles.selectedFileInfo}>
              <Ionicons name="image-outline" size={21} color={Colors.success} />

              <Text style={styles.fileName} numberOfLines={1}>
                {file.name}
              </Text>
            </View>

            <View style={styles.fileActions}>
              <TouchableOpacity
                onPress={() => selectImage(field.key)}
                disabled={submitting}
                style={styles.changeButton}
              >
                <Text style={styles.changeButtonText}>Change</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => removeImage(field.key)}
                disabled={submitting}
                style={styles.removeButton}
              >
                <Ionicons name="trash-outline" size={19} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => selectImage(field.key)}
            disabled={isSelecting || submitting}
            activeOpacity={0.8}
          >
            {isSelecting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <>
                <Ionicons
                  name="cloud-upload-outline"
                  size={20}
                  color={Colors.white}
                />

                <Text style={styles.uploadButtonText}>Choose Image</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

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
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* HEADER */}

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={28} color={Colors.white} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>My Documents</Text>

            <View style={styles.headerRight} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}
          >
            {/* HERO */}

            <View style={styles.heroSection}>
              <View style={styles.heroIcon}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={55}
                  color={Colors.white}
                />
              </View>

              <Text style={styles.heroTitle}>Upload Your Documents</Text>

              <Text style={styles.heroDescription}>
                Add your Aadhaar and PAN details with clear document images for
                verification.
              </Text>
            </View>

            {/* PROGRESS */}

            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>
                  Document Upload Progress
                </Text>

                <Text style={styles.progressCount}>
                  {selectedCount}/{totalCount}
                </Text>
              </View>

              <View style={styles.progressTrack}>
                <View
                  style={[styles.progressFill, { width: `${progress}%` }]}
                />
              </View>

              <Text style={styles.progressPercentage}>
                {progress}% completed
              </Text>
            </View>

            {/* AADHAAR DETAILS */}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Aadhaar Details</Text>

              <Text style={styles.inputLabel}>Aadhaar Number</Text>

              <TextInput
                style={styles.input}
                placeholder="Enter 12-digit Aadhaar number"
                placeholderTextColor={Colors.textMuted}
                value={aadharNumber}
                onChangeText={(value) =>
                  setAadharNumber(value.replace(/\D/g, "").slice(0, 12))
                }
                keyboardType="number-pad"
                maxLength={12}
              />

              <Text style={styles.inputHint}>
                {aadharNumber.length}/12 digits
              </Text>
            </View>

            {/* AADHAAR IMAGES */}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Aadhaar Images</Text>

              {renderImageCard(IMAGE_FIELDS[0])}
              {renderImageCard(IMAGE_FIELDS[1])}
            </View>

            {/* PAN DETAILS */}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PAN Details</Text>

              <Text style={styles.inputLabel}>PAN Number</Text>

              <TextInput
                style={styles.input}
                placeholder="Example: ABCDE1234F"
                placeholderTextColor={Colors.textMuted}
                value={panNumber}
                onChangeText={(value) =>
                  setPanNumber(
                    value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "")
                      .slice(0, 10),
                  )
                }
                autoCapitalize="characters"
                maxLength={10}
              />

              {renderImageCard(IMAGE_FIELDS[2])}
            </View>

            {/* INFORMATION */}

            <View style={styles.importantCard}>
              <View style={styles.importantHeader}>
                <Ionicons
                  name="information-circle-outline"
                  size={25}
                  color={Colors.primary}
                />

                <Text style={styles.importantTitle}>Important Information</Text>
              </View>

              <Text style={styles.importantText}>
                • Upload clear and readable images.
              </Text>

              <Text style={styles.importantText}>
                • Accepted formats: JPG, JPEG, PNG and WEBP.
              </Text>

              <Text style={styles.importantText}>
                • Make sure your document details are correct.
              </Text>
            </View>

            {/* SUBMIT BUTTON */}

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Ionicons
                    name="cloud-upload-outline"
                    size={21}
                    color={Colors.white}
                  />

                  <Text style={styles.submitButtonText}>Submit Documents</Text>
                </>
              )}
            </TouchableOpacity>

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

  container: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },

  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
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

  headerRight: {
    width: 40,
  },

  heroSection: {
    alignItems: "center",
    paddingVertical: 22,
  },

  heroIcon: {
    width: 105,
    height: 105,
    borderRadius: 55,
    backgroundColor: "#650B12",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  heroTitle: {
    color: Colors.white,
    fontSize: 22,
    fontFamily: Fonts.extraBold,
    textAlign: "center",
  },

  heroDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: Fonts.regular,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 8,
  },

  progressCard: {
    backgroundColor: "#190909",
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 17,
    padding: 16,
    marginBottom: 22,
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  progressTitle: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: Fonts.bold,
  },

  progressCount: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: Fonts.bold,
  },

  progressTrack: {
    height: 10,
    backgroundColor: "#454545",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 10,
  },

  progressPercentage: {
    color: Colors.textSecondary,
    fontSize: 17,
    fontFamily: Fonts.medium,
    marginTop: 8,
    textAlign: "right",
  },

  section: {
    marginBottom: 22,
  },

  sectionTitle: {
    color: Colors.white,
    fontSize: 24,
    fontFamily: Fonts.regular,
    marginBottom: 14,
  },

  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontFamily: Fonts.regular,
    marginBottom: 8,
  },

  input: {
    height: 52,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    color: Colors.white,
    fontSize: 17,
    fontFamily: Fonts.regular,
  },

  inputHint: {
    color: Colors.textMuted,
    fontSize: 13,
    fontFamily: Fonts.regular,
    textAlign: "right",
    marginTop: 5,
  },

  documentCard: {
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 15,
    padding: 14,
    marginBottom: 12,
  },

  documentCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },

  documentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#650B12",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  documentInfo: {
    flex: 1,
  },

  documentTitle: {
    color: Colors.white,
    fontSize: 19,
    fontFamily: Fonts.bold,
  },

  documentDescription: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: Fonts.regular,
    marginTop: 4,
  },

  uploadButton: {
    minHeight: 43,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  uploadButtonText: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: Fonts.bold,
  },

  selectedFileBox: {
    backgroundColor: "#102B1B",
    borderRadius: 10,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  selectedFileInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  fileName: {
    flex: 1,
    color: Colors.white,
    fontSize: 11,
    fontFamily: Fonts.medium,
  },

  fileActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  changeButton: {
    padding: 5,
  },

  changeButtonText: {
    color: Colors.white,
    fontSize: 11,
    fontFamily: Fonts.bold,
  },

  removeButton: {
    padding: 5,
  },

  importantCard: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 15,
    backgroundColor: "#190909",
    padding: 15,
    marginBottom: 22,
  },

  importantHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 12,
  },

  importantTitle: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: Fonts.bold,
  },

  importantText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontFamily: Fonts.regular,
    lineHeight: 22,
  },

  submitButton: {
    height: 54,
    backgroundColor: Colors.primary,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },

  disabledButton: {
    opacity: 0.6,
  },

  submitButtonText: {
    color: Colors.white,
    fontSize: 19,
    fontFamily: Fonts.regular,
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
