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
import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";

export default function PersonalDetailsScreen() {
  const router = useRouter();

  const [name, setName] = useState("Raju Kumar");
  const [mobile] = useState("9876543210");
  const [email, setEmail] = useState("raju@gmail.com");
  const [dob, setDob] = useState("15 Aug 1998");
  const [address, setAddress] = useState(
    "Madhapur, Hyderabad, Telangana - 500081",
  );

  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    if (!name.trim() || !email.trim() || !address.trim()) {
      Alert.alert("Required", "Please fill all required fields.");
      return;
    }

    Alert.alert("Success", "Personal details updated successfully!", [
      {
        text: "OK",
        onPress: () => setIsEditing(false),
      },
    ]);
  };

  const DetailCard = ({
    icon,
    label,
    value,
    onChangeText,
    multiline = false,
    keyboardType = "default",
    editable = true,
  }) => {
    return (
      <View style={styles.detailCard}>
        <View style={styles.detailIcon}>
          <Ionicons name={icon} size={27} color={Colors.white} />
        </View>

        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>{label}</Text>

          {isEditing && editable ? (
            <TextInput
              style={[styles.detailInput, multiline && styles.multilineInput]}
              value={value}
              onChangeText={onChangeText}
              multiline={multiline}
              keyboardType={keyboardType}
              placeholder={`Enter ${label}`}
              placeholderTextColor={Colors.placeholder}
            />
          ) : (
            <Text style={styles.detailValue}>{value}</Text>
          )}
        </View>
      </View>
    );
  };

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
              >
                <Ionicons name="chevron-back" size={28} color={Colors.white} />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>Personal Details</Text>

              <TouchableOpacity
                onPress={() => setIsEditing(!isEditing)}
                style={styles.editIconButton}
              >
                <Ionicons
                  name={isEditing ? "close" : "create-outline"}
                  size={27}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* PROFILE SECTION */}

            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                <Image
                  source={require("../../assets/images/Profile.png")}
                  style={styles.profileImage}
                  resizeMode="cover"
                />

                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={() =>
                    Alert.alert(
                      "Profile Photo",
                      "Photo selection will be added later.",
                    )
                  }
                >
                  <Ionicons name="camera" size={21} color={Colors.white} />
                </TouchableOpacity>
              </View>

              <Text style={styles.profileName}>{name}</Text>

              <Text style={styles.profileRole}>Delivery Partner</Text>

              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={21} color={Colors.white} />

                <Text style={styles.verifiedText}>Verified Partner</Text>
              </View>
            </View>

            {/* SECTION TITLE */}

            <LinearGradient
              colors={["#260606", "#100303"]}
              style={styles.sectionHeader}
            >
              <Ionicons
                name="person-outline"
                size={27}
                color={Colors.primary}
              />

              <Text style={styles.sectionTitle}>Personal Information</Text>
            </LinearGradient>

            {/* PERSONAL DETAILS */}

            <View style={styles.detailsContainer}>
              <DetailCard
                icon="person-outline"
                label="Full Name"
                value={name}
                onChangeText={setName}
              />

              <DetailCard
                icon="call-outline"
                label="Mobile Number"
                value={`+91 ${mobile}`}
                editable={false}
              />

              <DetailCard
                icon="mail-outline"
                label="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />

              <DetailCard
                icon="calendar-outline"
                label="Date of Birth"
                value={dob}
                onChangeText={setDob}
              />

              <DetailCard
                icon="location-outline"
                label="Address"
                value={address}
                onChangeText={setAddress}
                multiline
              />
            </View>

            {/* EDIT / SAVE BUTTON */}

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.buttonWrapper}
              onPress={isEditing ? handleSave : () => setIsEditing(true)}
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
                  size={25}
                  color={Colors.white}
                />

                <Text style={styles.saveButtonText}>
                  {isEditing ? "Save Changes" : "Edit Details"}
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
    paddingBottom: 30,
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
    fontSize: 19,
    fontFamily: Fonts.extraBold,
  },

  editIconButton: {
    width: 40,
    alignItems: "flex-end",
  },

  // PROFILE

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

  // SECTION

  sectionHeader: {
    height: 65,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 17,
    gap: 14,
    marginHorizontal: -20,
    marginBottom: 14,
  },

  sectionTitle: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: Fonts.bold,
  },

  // DETAIL CARDS

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

  multilineInput: {
    minHeight: 55,
    textAlignVertical: "top",
  },

  // BUTTON

  buttonWrapper: {
    marginTop: 30,
    borderRadius: 15,
    overflow: "hidden",
  },

  saveButton: {
    height: 65,
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
