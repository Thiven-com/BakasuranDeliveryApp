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

export default function VehicleDetailsScreen() {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);

  // Vehicle information
  const [vehicleType, setVehicleType] = useState("Bike");
  const [vehicleModel, setVehicleModel] = useState("Honda Shine 125");
  const [registrationNumber, setRegistrationNumber] = useState("TS 09 AB 4321");
  const [registrationValid, setRegistrationValid] = useState("15 Aug 2028");

  // Driving licence information
  const [licenceNumber, setLicenceNumber] = useState("DL1420220012345");
  const [licenceValid, setLicenceValid] = useState("10 Dec 2032");

  // RC information
  const [rcNumber, setRcNumber] = useState("RC1420220098765");
  const [rcValid, setRcValid] = useState("15 Aug 2028");

  const handleSave = () => {
    if (
      !vehicleType.trim() ||
      !vehicleModel.trim() ||
      !registrationNumber.trim() ||
      !licenceNumber.trim() ||
      !rcNumber.trim()
    ) {
      Alert.alert("Required", "Please fill all required fields.");
      return;
    }

    Alert.alert("Success", "Vehicle details updated successfully!", [
      {
        text: "OK",
        onPress: () => setIsEditing(false),
      },
    ]);
  };

  const handleViewDocument = (documentName) => {
    Alert.alert(documentName, "Document preview will be available soon.");
  };

  // Reusable detail card
  const DetailCard = ({
    icon,
    label,
    value,
    onChangeText,
    editable = true,
    action,
  }) => {
    return (
      <View style={styles.detailCard}>
        <View style={styles.detailIcon}>
          <Ionicons name={icon} size={28} color={Colors.white} />
        </View>

        <View style={styles.detailContent}>
          <Text style={styles.detailLabel}>{label}</Text>

          {isEditing && editable ? (
            <TextInput
              style={styles.detailInput}
              value={value}
              onChangeText={onChangeText}
              placeholder={`Enter ${label}`}
              placeholderTextColor={Colors.placeholder}
              autoCapitalize="characters"
            />
          ) : (
            <Text style={styles.detailValue}>{value}</Text>
          )}
        </View>

        {action && (
          <TouchableOpacity style={styles.viewButton} onPress={action}>
            <Ionicons name="eye-outline" size={19} color={Colors.white} />
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Section heading
  const SectionHeader = ({ icon, title }) => {
    return (
      <LinearGradient
        colors={["#260606", "#100303"]}
        style={styles.sectionHeader}
      >
        <Ionicons name={icon} size={27} color={Colors.primary} />

        <Text style={styles.sectionTitle}>{title}</Text>
      </LinearGradient>
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
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={28} color={Colors.white} />
              </TouchableOpacity>

              <Text style={styles.headerTitle}>Vehicle Details</Text>

              <TouchableOpacity
                style={styles.editIconButton}
                onPress={() => setIsEditing(!isEditing)}
              >
                <Ionicons
                  name={isEditing ? "close" : "create-outline"}
                  size={27}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>

            {/* VEHICLE PROFILE */}

            <View style={styles.vehicleProfile}>
              <LinearGradient
                colors={["#202020", "#101010"]}
                style={styles.vehicleImage}
              >
                <Ionicons name="bicycle" size={105} color={Colors.primary} />
                <Text style={styles.vehicleImageText}>YOUR VEHICLE</Text>
              </LinearGradient>

              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName}>{vehicleModel}</Text>

                <View style={styles.registrationBadge}>
                  <Ionicons
                    name="card-outline"
                    size={20}
                    color={Colors.white}
                  />

                  <Text style={styles.registrationText}>
                    {registrationNumber}
                  </Text>
                </View>

                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark" size={19} color={Colors.white} />

                  <Text style={styles.verifiedText}>Verified Vehicle</Text>
                </View>
              </View>
            </View>

            {/* VEHICLE INFORMATION */}

            <SectionHeader icon="bicycle-outline" title="Vehicle Information" />

            <View style={styles.detailsContainer}>
              <DetailCard
                icon="bicycle-outline"
                label="Vehicle Type"
                value={vehicleType}
                onChangeText={setVehicleType}
              />

              <DetailCard
                icon="car-sport-outline"
                label="Vehicle Model"
                value={vehicleModel}
                onChangeText={setVehicleModel}
              />

              <DetailCard
                icon="card-outline"
                label="Registration Number"
                value={registrationNumber}
                onChangeText={setRegistrationNumber}
              />

              <DetailCard
                icon="calendar-outline"
                label="Registration Valid Till"
                value={registrationValid}
                onChangeText={setRegistrationValid}
              />
            </View>

            {/* LICENCE DETAILS */}

            <SectionHeader
              icon="document-text-outline"
              title="Licence Details"
            />

            <View style={styles.detailsContainer}>
              <DetailCard
                icon="id-card-outline"
                label="Driving Licence Number"
                value={licenceNumber}
                onChangeText={setLicenceNumber}
              />

              <DetailCard
                icon="calendar-outline"
                label="Licence Valid Till"
                value={licenceValid}
                onChangeText={setLicenceValid}
                action={() => handleViewDocument("Driving Licence")}
              />
            </View>

            {/* RC DETAILS */}

            <SectionHeader icon="document-text-outline" title="RC Details" />

            <View style={styles.detailsContainer}>
              <DetailCard
                icon="document-outline"
                label="RC Number"
                value={rcNumber}
                onChangeText={setRcNumber}
                action={() => handleViewDocument("RC Document")}
              />

              <DetailCard
                icon="calendar-outline"
                label="RC Valid Till"
                value={rcValid}
                onChangeText={setRcValid}
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
                  {isEditing ? "Save Changes" : "Edit Vehicle Details"}
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
    fontSize: 20,
    fontFamily: Fonts.extraBold,
  },

  editIconButton: {
    width: 40,
    alignItems: "flex-end",
  },

  // VEHICLE PROFILE

  vehicleProfile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    marginTop: 20,
    marginBottom: 30,
  },

  vehicleImage: {
    width: "47%",
    height: 155,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  vehicleImageText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: Fonts.bold,
    letterSpacing: 1,
    marginTop: 5,
  },

  vehicleInfo: {
    flex: 1,
    gap: 12,
  },

  vehicleName: {
    color: Colors.white,
    fontSize: 19,
    fontFamily: Fonts.extraBold,
  },

  registrationBadge: {
    minHeight: 43,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  registrationText: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: Fonts.bold,
    flexShrink: 1,
  },

  verifiedBadge: {
    backgroundColor: Colors.success,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },

  verifiedText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: Fonts.bold,
  },

  // SECTION HEADER

  sectionHeader: {
    height: 62,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 17,
    gap: 14,
    marginHorizontal: -20,
    marginBottom: 14,
    marginTop: 12,
  },

  sectionTitle: {
    color: Colors.white,
    fontSize: 18,
    fontFamily: Fonts.bold,
  },

  // DETAIL CARDS

  detailsContainer: {
    gap: 12,
    marginBottom: 10,
  },

  detailCard: {
    minHeight: 83,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
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
    fontSize: 13,
    fontFamily: Fonts.regular,
    marginBottom: 4,
  },

  detailValue: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: Fonts.bold,
  },

  detailInput: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: Fonts.bold,
    padding: 0,
    minHeight: 28,
  },

  viewButton: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 25,
    paddingHorizontal: 11,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginLeft: 5,
  },

  viewButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontFamily: Fonts.bold,
  },

  // SAVE BUTTON

  buttonWrapper: {
    marginTop: 25,
    borderRadius: 16,
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
