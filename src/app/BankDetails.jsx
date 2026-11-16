import { useState } from "react";

import {
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
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";

export default function BankDetailsScreen() {
  const router = useRouter();

  const initialDetails = {
    accountHolder: "Raju Kumar",
    accountNumber: "123456789012",
    ifscCode: "HDFC0001234",
    bankName: "HDFC Bank",
    branch: "Madhapur, Hyderabad",
    upiId: "raju.kumar@hdfcbank",
  };

  const [details, setDetails] = useState(initialDetails);
  const [savedDetails, setSavedDetails] = useState(initialDetails);
  const [isEditing, setIsEditing] = useState(false);
  const [isVerified, setIsVerified] = useState(true);

  const updateField = (field, value) => {
    setDetails((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setDetails(savedDetails);
    setIsEditing(false);
  };

  const handleSave = () => {
    const requiredFields = [
      details.accountHolder,
      details.accountNumber,
      details.ifscCode,
      details.bankName,
      details.branch,
    ];

    if (requiredFields.some((value) => !value.trim())) {
      Alert.alert("Required", "Please fill all required bank details.");
      return;
    }

    if (!/^\d{9,18}$/.test(details.accountNumber)) {
      Alert.alert(
        "Invalid Account Number",
        "Enter a valid account number containing 9 to 18 digits.",
      );
      return;
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(details.ifscCode.toUpperCase())) {
      Alert.alert(
        "Invalid IFSC",
        "Please enter a valid 11-character IFSC code.",
      );
      return;
    }

    const updatedDetails = {
      ...details,
      accountHolder: details.accountHolder.trim(),
      accountNumber: details.accountNumber.trim(),
      ifscCode: details.ifscCode.trim().toUpperCase(),
      bankName: details.bankName.trim(),
      branch: details.branch.trim(),
      upiId: details.upiId.trim(),
    };

    const bankInfoChanged =
      updatedDetails.accountHolder !== savedDetails.accountHolder ||
      updatedDetails.accountNumber !== savedDetails.accountNumber ||
      updatedDetails.ifscCode !== savedDetails.ifscCode ||
      updatedDetails.bankName !== savedDetails.bankName ||
      updatedDetails.branch !== savedDetails.branch;

    setDetails(updatedDetails);
    setSavedDetails(updatedDetails);
    setIsEditing(false);

    if (bankInfoChanged) {
      setIsVerified(false);
    }

    Alert.alert(
      "Saved",
      bankInfoChanged
        ? "Bank details saved locally. Bank verification is required."
        : "Bank details saved locally.",
    );
  };

  const DetailCard = ({
    icon,
    label,
    value,
    field,
    keyboardType = "default",
    autoCapitalize = "none",
    secure = false,
  }) => (
    <View style={styles.detailCard}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={27} color={Colors.white} />
      </View>

      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>

        {isEditing ? (
          <TextInput
            style={styles.detailInput}
            value={value}
            onChangeText={(text) => updateField(field, text)}
            placeholder={`Enter ${label}`}
            placeholderTextColor={Colors.placeholder}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            secureTextEntry={secure}
          />
        ) : (
          <Text style={styles.detailValue}>
            {secure ? `•••• •••• ${value.slice(-4)}` : value}
          </Text>
        )}
      </View>
    </View>
  );

  const SectionHeader = ({ icon, title }) => (
    <LinearGradient
      colors={["#260606", "#100303"]}
      style={styles.sectionHeader}
    >
      <Ionicons name={icon} size={27} color={Colors.primary} />

      <Text style={styles.sectionTitle}>{title}</Text>
    </LinearGradient>
  );

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
              >
                <Ionicons name="chevron-back" size={28} color={Colors.white} />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>Bank Details</Text>

              <TouchableOpacity
                style={styles.editIconButton}
                onPress={isEditing ? handleCancel : handleEdit}
              >
                <Ionicons
                  name={isEditing ? "close" : "create-outline"}
                  size={27}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* BANK PROFILE */}

            <View style={styles.bankProfileSection}>
              <LinearGradient
                colors={["#330707", "#140303", "#050505"]}
                style={styles.bankIllustration}
              >
                <View style={styles.bankIconContainer}>
                  <Ionicons name="business" size={105} color={Colors.white} />
                </View>

                <View style={styles.bankCheckIcon}>
                  <Ionicons name="checkmark" size={30} color={Colors.white} />
                </View>
              </LinearGradient>

              <View
                style={[
                  styles.verifiedBadge,
                  !isVerified && styles.pendingBadge,
                ]}
              >
                <Ionicons
                  name={isVerified ? "checkmark" : "time-outline"}
                  size={23}
                  color={Colors.white}
                />

                <Text style={styles.verifiedText}>
                  {isVerified
                    ? "Bank Account Verified"
                    : "Verification Required"}
                </Text>
              </View>
            </View>

            {/* ACCOUNT INFORMATION */}

            <SectionHeader
              icon="business-outline"
              title="Account Information"
            />

            <View style={styles.detailsContainer}>
              <DetailCard
                icon="person-outline"
                label="Account Holder Name"
                field="accountHolder"
                value={details.accountHolder}
                autoCapitalize="words"
              />

              <DetailCard
                icon="card-outline"
                label="Account Number"
                field="accountNumber"
                value={details.accountNumber}
                keyboardType="number-pad"
                secure={!isEditing}
              />

              <DetailCard
                icon="keypad-outline"
                label="IFSC Code"
                field="ifscCode"
                value={details.ifscCode}
                autoCapitalize="characters"
              />

              <DetailCard
                icon="business-outline"
                label="Bank Name"
                field="bankName"
                value={details.bankName}
                autoCapitalize="words"
              />

              <DetailCard
                icon="location-outline"
                label="Branch"
                field="branch"
                value={details.branch}
                autoCapitalize="words"
              />
            </View>

            {/* UPI INFORMATION */}

            <SectionHeader icon="paper-plane-outline" title="UPI Information" />

            <View style={styles.upiCard}>
              <View style={styles.upiContent}>
                <Text style={styles.upiLabel}>UPI ID</Text>

                {isEditing ? (
                  <TextInput
                    style={styles.upiInput}
                    value={details.upiId}
                    onChangeText={(text) => updateField("upiId", text)}
                    placeholder="Enter UPI ID"
                    placeholderTextColor={Colors.placeholder}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                ) : (
                  <Text style={styles.upiValue}>
                    {details.upiId || "Not added"}
                  </Text>
                )}
              </View>
            </View>

            {/* EDIT / SAVE BUTTON */}

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.buttonWrapper}
              onPress={isEditing ? handleSave : handleEdit}
            >
              <LinearGradient
                colors={Colors.gradients.primary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButton}
              >
                <Ionicons
                  name={
                    isEditing ? "checkmark-circle-outline" : "create-outline"
                  }
                  size={26}
                  color={Colors.white}
                />

                <Text style={styles.saveButtonText}>
                  {isEditing ? "Save Bank Details" : "Edit Bank Details"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* FOOTER */}

            <Text style={styles.footerText}>BAKASURAN DELIVERY PARTNER</Text>
          </ScrollView>
        </KeyboardAvoidingView>
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

  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 35,
  },

  // HEADER

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
    fontSize: 20,
    fontFamily: Fonts.extraBold,
  },

  editIconButton: {
    width: 40,
    alignItems: "flex-end",
  },

  // BANK PROFILE

  bankProfileSection: {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 35,
  },

  bankIllustration: {
    width: 220,
    height: 200,
    borderRadius: 110,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  bankIconContainer: {
    justifyContent: "center",
    alignItems: "center",
  },

  bankCheckIcon: {
    position: "absolute",
    bottom: 15,
    right: 25,
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.background,
  },

  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: Colors.success,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 30,
    marginTop: 12,
  },

  pendingBadge: {
    backgroundColor: Colors.warning,
  },

  verifiedText: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: Fonts.bold,
  },

  // SECTION HEADER

  sectionHeader: {
    height: 65,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 17,
    gap: 14,
    marginHorizontal: -20,
    marginBottom: 14,
    marginTop: 10,
  },

  sectionTitle: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: Fonts.bold,
  },

  // DETAIL CARDS

  detailsContainer: {
    gap: 13,
    marginBottom: 20,
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
    justifyContent: "center",
    alignItems: "flex-start",
  },

  detailContent: {
    flex: 1,
    justifyContent: "center",
  },

  detailLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: Fonts.regular,
    marginBottom: 4,
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
  },

  // UPI CARD

  upiCard: {
    minHeight: 90,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 15,
  },

  upiContent: {
    flex: 1,
  },

  upiLabel: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: Fonts.regular,
    marginBottom: 5,
  },

  upiValue: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.bold,
  },

  upiInput: {
    color: Colors.white,
    fontSize: 16,
    fontFamily: Fonts.bold,
    padding: 0,
    minHeight: 28,
  },

  // SAVE BUTTON

  buttonWrapper: {
    marginTop: 45,
    borderRadius: 16,
    overflow: "hidden",
  },

  saveButton: {
    height: 65,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  saveButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: Fonts.extraBold,
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
