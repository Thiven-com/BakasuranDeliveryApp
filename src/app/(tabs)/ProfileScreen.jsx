
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Image,
  Alert,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const COLORS = {
  background: "#050505",
  card: "#191919",
  border: "#292929",
  red: "#F9080C",
  green: "#20C957",
  white: "#FFFFFF",
  gray: "#BDBDBD",
};

export default function ProfileScreen() {

  const menuItems = [
    {
      id: "1",
      title: "Personal Details",
      icon: "person-outline",
      route: "/profile/PersonalDetailsScreen",
    },
    {
      id: "2",
      title: "Vehicle Details",
      icon: "bicycle-outline",
      route: "/profile/VehicleDetailsScreen",
    },
    {
      id: "3",
      title: "Bank Details",
      icon: "card-outline",
      route: "/profile/BankDetailsScreen",
    },
    {
      id: "4",
      title: "Documents",
      icon: "document-text-outline",
      route: "/profile/DocumentsScreen",
    },
  ];

  const handleMenuPress = (item) => {
    // Update these paths to match your actual route files.
    router.push(item.route);
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
            size={23}
            color={COLORS.white}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          My Profile
        </Text>

        <View style={styles.headerRight} />
      </View>

      {/* Profile Information */}
      <View style={styles.profileSection}>

        {/* Profile Image */}
        <View style={styles.profileImageWrapper}>
          <Image
            source={require("../../../assets/images/Friendly Bakasuran Delivery Partner.png")}
            style={styles.profileImage}
            resizeMode="cover"
          />
        </View>

        {/* Name */}
        <Text style={styles.profileName}>
          Raju Kumar
        </Text>

        {/* Role */}
        <Text style={styles.profileRole}>
          Delivery Partner
        </Text>

        {/* Verified Badge */}
        <View style={styles.verifiedBadge}>
          <Ionicons
            name="checkmark-circle"
            size={12}
            color={COLORS.white}
          />

          <Text style={styles.verifiedText}>
            Verified
          </Text>
        </View>

      </View>

      {/* Profile Menu */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            activeOpacity={0.75}
            onPress={() => handleMenuPress(item)}
          >
            <View style={styles.menuLeft}>
              <Ionicons
                name={item.icon}
                size={19}
                color={COLORS.white}
              />

              <Text style={styles.menuTitle}>
                {item.title}
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={23}
              color={COLORS.white}
            />
          </TouchableOpacity>
        ))}
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
    height: 73,
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

  // Profile Section
  profileSection: {
    alignItems: "center",
    marginTop: 90,
    marginBottom: 40,
  },

  profileImageWrapper: {
    width: 87,
    height: 87,
    borderRadius: 44,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#E5E5E5",
    marginBottom: 6,
  },

  profileImage: {
    width: "100%",
    height: "100%",
  },

  profileName: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 1,
  },

  profileRole: {
    color: COLORS.gray,
    fontSize: 17,
    marginTop: 5,
  },

  // Verified Badge
  verifiedBadge: {
    height: 25,
    paddingHorizontal: 15,
    backgroundColor: COLORS.green,
    borderRadius: 19,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    marginTop: 10,
  },

  verifiedText: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: "700",
  },

  // Menu Container
  menuContainer: {
    marginHorizontal: 14,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    paddingHorizontal: 11,
    overflow: "hidden",
  },

  menuItem: {
    height: 59,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  menuTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "500",
  },
});
