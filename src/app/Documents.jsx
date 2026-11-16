import { useState } from "react";

import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";

// Sample document data.
// Replace sample verification statuses with backend data in production.

const INITIAL_DOCUMENTS = [
  {
    id: "1",
    title: "Identity Proof (Aadhaar)",
    description: "Aadhaar Card (Front & Back)",
    icon: "person-outline",
    iconColor: "#F10D16",
    background: "#650B12",
    status: "Verified",
    fileName: "aadhaar_card.pdf",
  },
  {
    id: "2",
    title: "Address Proof",
    description: "Aadhaar / Voter ID / Driving Licence",
    icon: "id-card-outline",
    iconColor: "#FFC107",
    background: "#715600",
    status: "Verified",
    fileName: "address_proof.pdf",
  },
  {
    id: "3",
    title: "Driving Licence",
    description: "Valid Driving Licence",
    icon: "car-sport-outline",
    iconColor: "#03A9F4",
    background: "#064B70",
    status: "Verified",
    fileName: "driving_licence.pdf",
  },
  {
    id: "4",
    title: "Vehicle RC",
    description: "Registration Certificate (RC)",
    icon: "bicycle-outline",
    iconColor: "#D946EF",
    background: "#581078",
    status: "Verified",
    fileName: "vehicle_rc.pdf",
  },
  {
    id: "5",
    title: "Vehicle Insurance",
    description: "Valid Vehicle Insurance",
    icon: "shield-checkmark-outline",
    iconColor: "#00BCD4",
    background: "#075B65",
    status: "Verified",
    fileName: "vehicle_insurance.pdf",
  },
  {
    id: "6",
    title: "Selfie / Live Photo",
    description: "Your clear photo for verification",
    icon: "person-circle-outline",
    iconColor: "#F06292",
    background: "#791638",
    status: "Pending",
    fileName: null,
    isSelfie: true,
  },
];

export default function DocumentsScreen() {
  const router = useRouter();

  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [uploadingId, setUploadingId] = useState(null);

  // Verification progress

  const verifiedCount = documents.filter(
    (item) => item.status === "Verified",
  ).length;

  const totalDocuments = documents.length;

  const progress = totalDocuments ? verifiedCount / totalDocuments : 0;

  const progressPercentage = Math.round(progress * 100);

  // Update document after successful selection

  const updateDocument = (id, file) => {
    setDocuments((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              fileName: file.name,
              fileUri: file.uri,
              status: "Under Review",
            }
          : item,
      ),
    );

    Alert.alert(
      "Document Uploaded",
      "Your document has been selected successfully and is awaiting verification.",
    );
  };

  // Pick document from device

  const handleDocumentUpload = async (document) => {
    try {
      setUploadingId(document.id);

      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      const selectedFile = result.assets?.[0];

      if (!selectedFile) {
        Alert.alert("Error", "Unable to select the document.");
        return;
      }

      updateDocument(document.id, selectedFile);
    } catch (error) {
      Alert.alert(
        "Upload Error",
        "Unable to select your document. Please try again.",
      );
    } finally {
      setUploadingId(null);
    }
  };

  // Pick selfie from gallery

  const handleSelfieUpload = async (document) => {
    try {
      setUploadingId(document.id);

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow photo library access to select your selfie.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        return;
      }

      const selectedImage = result.assets?.[0];

      if (!selectedImage) {
        Alert.alert("Error", "Unable to select your photo.");
        return;
      }

      updateDocument(document.id, {
        name: selectedImage.fileName || "selfie.jpg",
        uri: selectedImage.uri,
      });
    } catch (error) {
      Alert.alert(
        "Upload Error",
        "Unable to select your photo. Please try again.",
      );
    } finally {
      setUploadingId(null);
    }
  };

  // Upload action

  const handleUpload = (document) => {
    if (document.isSelfie) {
      handleSelfieUpload(document);
    } else {
      handleDocumentUpload(document);
    }
  };

  // View selected document

  const handleViewDocument = (document) => {
    if (!document.fileUri) {
      Alert.alert("Document", "No document has been selected yet.");
      return;
    }

    Alert.alert(
      document.title,
      `Selected file: ${document.fileName}\n\nA document preview can be added here.`,
    );
  };

  // Document status badge

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      Verified: {
        background: Colors.success,
        icon: "checkmark-circle",
      },
      Pending: {
        background: Colors.primary,
        icon: "cloud-upload-outline",
      },
      "Under Review": {
        background: Colors.warning,
        icon: "time-outline",
      },
      Rejected: {
        background: Colors.error,
        icon: "close-circle-outline",
      },
    };

    const config = statusConfig[status] || statusConfig.Pending;

    return (
      <View
        style={[styles.statusBadge, { backgroundColor: config.background }]}
      >
        <Ionicons name={config.icon} size={16} color={Colors.white} />

        <Text style={styles.statusText}>{status}</Text>
      </View>
    );
  };

  // Individual document card

  const DocumentCard = ({ item }) => {
    const isUploading = uploadingId === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.documentCard}
        onPress={() =>
          item.fileUri ? handleViewDocument(item) : handleUpload(item)
        }
      >
        {/* DOCUMENT ICON */}

        <View
          style={[styles.documentIcon, { backgroundColor: item.background }]}
        >
          <Ionicons name={item.icon} size={31} color={item.iconColor} />
        </View>

        {/* DOCUMENT INFORMATION */}

        <View style={styles.documentContent}>
          <Text style={styles.documentTitle}>{item.title}</Text>

          <Text style={styles.documentDescription}>
            {item.fileName || item.description}
          </Text>
        </View>

        {/* STATUS / UPLOAD */}

        <View style={styles.documentAction}>
          {isUploading ? (
            <View style={styles.uploadBadge}>
              <Text style={styles.uploadText}>Please wait</Text>
            </View>
          ) : item.status === "Verified" ? (
            <StatusBadge status="Verified" />
          ) : item.status === "Under Review" ? (
            <StatusBadge status="Under Review" />
          ) : item.status === "Rejected" ? (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => handleUpload(item)}
            >
              <Ionicons name="refresh-outline" size={17} color={Colors.white} />
              <Text style={styles.uploadText}>Retry</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => handleUpload(item)}
            >
              <Ionicons
                name="cloud-upload-outline"
                size={18}
                color={Colors.white}
              />
              <Text style={styles.uploadText}>Upload</Text>
            </TouchableOpacity>
          )}
        </View>

        <Ionicons name="chevron-forward" size={23} color={Colors.white} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <LinearGradient
        colors={Colors.gradients.background}
        style={styles.background}
      >
        <View style={styles.container}>
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
            contentContainerStyle={styles.scrollContent}
          >
            {/* HERO SECTION */}

            <View style={styles.heroSection}>
              <LinearGradient
                colors={["#450909", "#180303", "#050505"]}
                style={styles.heroCircle}
              >
                <Ionicons name="clipboard" size={105} color={Colors.white} />

                <View style={styles.heroCheck}>
                  <Ionicons
                    name="shield-checkmark"
                    size={34}
                    color={Colors.white}
                  />
                </View>
              </LinearGradient>

              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>
                  Upload & Manage Your Documents
                </Text>

                <Text style={styles.heroDescription}>
                  Keep your documents updated and verified to continue
                  delivering.
                </Text>
              </View>
            </View>

            {/* VERIFICATION PROGRESS */}

            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Document Verification</Text>

                <Text style={styles.progressCount}>
                  {verifiedCount} of {totalDocuments} Verified
                </Text>
              </View>

              <View style={styles.progressRow}>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progressPercentage}%` },
                    ]}
                  />
                </View>

                <Text style={styles.progressPercentage}>
                  {progressPercentage}%
                </Text>
              </View>
            </View>

            {/* DOCUMENT LIST */}

            <View style={styles.documentContainer}>
              {documents.map((item) => (
                <DocumentCard key={item.id} item={item} />
              ))}
            </View>

            {/* IMPORTANT INFORMATION */}

            <View style={styles.importantCard}>
              <View style={styles.importantHeader}>
                <View style={styles.importantIcon}>
                  <Ionicons
                    name="information-circle-outline"
                    size={32}
                    color={Colors.white}
                  />
                </View>

                <Text style={styles.importantTitle}>Important</Text>
              </View>

              <View style={styles.importantList}>
                <View style={styles.importantRow}>
                  <View style={styles.redDot} />

                  <Text style={styles.importantText}>
                    Upload clear, original and valid documents.
                  </Text>
                </View>

                <View style={styles.importantRow}>
                  <View style={styles.redDot} />

                  <Text style={styles.importantText}>
                    Ensure the details match your registered information.
                  </Text>
                </View>

                <View style={styles.importantRow}>
                  <View style={styles.redDot} />

                  <Text style={styles.importantText}>
                    Keep your documents updated at all times.
                  </Text>
                </View>
              </View>
            </View>

            {/* FOOTER */}

            <Text style={styles.footerText}>BAKASURAN DELIVERY PARTNER</Text>
          </ScrollView>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

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

  // HEADER

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
    fontSize: 21,
    fontFamily: Fonts.extraBold,
  },

  headerRight: {
    width: 40,
  },

  // HERO

  heroSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 15,
    marginBottom: 20,
  },

  heroCircle: {
    width: "43%",
    height: 180,
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  heroCheck: {
    position: "absolute",
    bottom: 12,
    right: 8,
    width: 53,
    height: 53,
    borderRadius: 27,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.background,
  },

  heroContent: {
    flex: 1,
  },

  heroTitle: {
    color: Colors.white,
    fontSize: 21,
    fontFamily: Fonts.extraBold,
    lineHeight: 28,
  },

  heroDescription: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: Fonts.regular,
    lineHeight: 21,
    marginTop: 9,
  },

  // PROGRESS CARD

  progressCard: {
    backgroundColor: "#190909",
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 17,
    padding: 16,
    marginBottom: 23,
  },

  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8,
  },

  progressTitle: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.bold,
  },

  progressCount: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: Fonts.medium,
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  progressTrack: {
    flex: 1,
    height: 12,
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
    color: Colors.white,
    fontSize: 15,
    fontFamily: Fonts.bold,
  },

  // DOCUMENT CARDS

  documentContainer: {
    gap: 12,
  },

  documentCard: {
    minHeight: 98,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  documentIcon: {
    width: 60,
    height: 60,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },

  documentContent: {
    flex: 1,
    justifyContent: "center",
  },

  documentTitle: {
    color: Colors.white,
    fontSize: 14,
    fontFamily: Fonts.bold,
    marginBottom: 5,
  },

  documentDescription: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontFamily: Fonts.regular,
    lineHeight: 17,
  },

  documentAction: {
    alignItems: "center",
    justifyContent: "center",
  },

  // STATUS BADGE

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 25,
  },

  statusText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: Fonts.bold,
  },

  // UPLOAD BUTTON

  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 25,
  },

  uploadText: {
    color: Colors.white,
    fontSize: 10,
    fontFamily: Fonts.bold,
  },

  uploadBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 20,
  },

  // IMPORTANT CARD

  importantCard: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 17,
    backgroundColor: "#190909",
    padding: 16,
    marginTop: 28,
  },

  importantHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    marginBottom: 13,
  },

  importantIcon: {
    width: 55,
    height: 55,
    borderRadius: 13,
    backgroundColor: Colors.primaryDark,
    justifyContent: "center",
    alignItems: "center",
  },

  importantTitle: {
    color: Colors.white,
    fontSize: 20,
    fontFamily: Fonts.bold,
  },

  importantList: {
    gap: 10,
  },

  importantRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  redDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginTop: 7,
  },

  importantText: {
    flex: 1,
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: Fonts.regular,
    lineHeight: 21,
  },

  // FOOTER

  footerText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: Fonts.bold,
    letterSpacing: 1.5,
    textAlign: "center",
    marginTop: 25,
  },
});
