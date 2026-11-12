
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const COLORS = {
  background: "#050505",
  white: "#FFFFFF",
  gray: "#C5C5C5",
  red: "#F9080C",
  green: "#16C943",
  bag: "#F5A623",
  bagDark: "#D88713",
};

export default function ConfirmPickupScreen() {
  const handleConfirmPickup = () => {
    Alert.alert(
      "Confirm Pickup",
      "Pickup verification API is not connected yet."
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
      />

      

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={COLORS.white}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Confirm Pickup
        </Text>

        <View style={styles.headerRight} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>

        {/* Delivery Bag Illustration */}
        <View style={styles.illustrationContainer}>

          {/* Bag Handle */}
          <View style={styles.bagHandle} />

          {/* Bag Body */}
          <View style={styles.bagBody}>
            <View style={styles.bagTopFold} />

            {/* Brand Logo */}
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🍛</Text>
              <Text style={styles.logoText}>
                BAKASURAN
              </Text>
            </View>
          </View>

          {/* Green Verification Badge */}
          <View style={styles.successBadge}>
            <Ionicons
              name="checkmark"
              size={36}
              color={COLORS.white}
            />
          </View>
        </View>

        {/* Heading */}
        <Text style={styles.title}>
          Verify Order Pickup
        </Text>

        {/* Description */}
        <Text style={styles.description}>
          Confirm that you have picked up the{"\n"}
          order from the restaurant.
        </Text>
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          activeOpacity={0.85}
         onPress={() => router.push("/DeliverOrderScreen")}
        >
          <Text style={styles.confirmButtonText}>
            Confirm Pickup
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  
  // Header
  header: {
    height: 75,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },

  backButton: {
    width: 32,
    height: 38,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "700",
  },

  headerRight: {
    width: 32,
  },

  // Main Content
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingBottom: 45,
  },

  // Bag Illustration
  illustrationContainer: {
    width: 170,
    height: 155,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  bagHandle: {
    position: "absolute",
    top: 13,
    width: 57,
    height: 29,
    borderWidth: 5,
    borderColor: COLORS.bagDark,
    borderBottomWidth: 0,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

  bagBody: {
    position: "absolute",
    top: 31,
    width: 93,
    height: 105,
    backgroundColor: COLORS.bag,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    transform: [{ skewX: "-5deg" }],
    borderBottomWidth: 3,
    borderBottomColor: COLORS.bagDark,
  },

  bagTopFold: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 11,
    backgroundColor: "#D98A19",
    borderBottomWidth: 1,
    borderBottomColor: "#B97814",
  },

  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 9,
    transform: [{ skewX: "5deg" }],
  },

  logoEmoji: {
    fontSize: 37,
    marginBottom: -3,
  },

  logoText: {
    color: COLORS.white,
    fontSize: 12
    ,
    fontWeight: "900",
    backgroundColor: "#8B1717",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
    textShadowColor: "#000000",
    textShadowRadius: 2,
  },

  // Success Badge
  successBadge: {
    position: "absolute",
    right: 18,
    bottom: 20,
    width: 47,
    height: 47,
    borderRadius: 25,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: COLORS.green,
    shadowOpacity: 0.35,
    shadowRadius: 7,
    borderWidth: 2,
    borderColor: "#0B8F2A",
  },

  // Text
  title: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 1,
    marginBottom: 8,
  },

  description: {
    color: COLORS.gray,
    fontSize: 15,
    lineHeight: 17,
    textAlign: "center",
    fontWeight: "400",
  },

  // Bottom Button
  bottomContainer: {
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: Platform.OS === "web" ? 220 : 18,
    backgroundColor: COLORS.background,
  },

  confirmButton: {
    width: "100%",
    height: 43,
    backgroundColor: COLORS.red,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },

  confirmButtonText: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: "700",
  },
});
