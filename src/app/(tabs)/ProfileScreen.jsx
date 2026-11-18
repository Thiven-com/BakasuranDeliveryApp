import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { deliveryLogout, removeToken } from "../../utils/Function";

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
  const [loggingOut, setLoggingOut] = useState(false);

  const menuItems = [
    {
      id: "1",
      title: "Personal Details",
      icon: "person-outline",
      route: "/PersonalDetails",
    },
    {
      id: "2",
      title: "Vehicle Details",
      icon: "bicycle-outline",
      route: "/VechileDetails",
    },
    {
      id: "3",
      title: "Bank Details",
      icon: "card-outline",
      route: "/BankDetails",
    },
    {
      id: "4",
      title: "Documents",
      icon: "document-text-outline",
      route: "/Documents",
    },
  ];

  const handleMenuPress = (item) => {
    // Update these paths to match your actual route files.
    router.push(item.route);
  };

  // Does the actual logout. Always clears the token and navigates,
  // even if the API call fails or hangs.
  const performLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);

    try {
      // Don't let a slow or failed API call block logout (5s max)
      await Promise.race([
        deliveryLogout(),
        new Promise((resolve) => setTimeout(resolve, 5000)),
      ]);
    } catch (error) {
      console.log("deliveryLogout failed:", error);
    }

    try {
      await removeToken();
      console.log("Token removed");
    } catch (error) {
      console.log("removeToken failed:", error);
    }

    setLoggingOut(false);
    router.replace("/LogInScreen");
  };

  const handleLogout = () => {
    // Alert.alert with buttons does nothing on Expo web,
    // so use window.confirm there.
    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to log out?")) {
        performLogout();
      }
      return;
    }

    Alert.alert("Log Out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: performLogout,
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={23} color={COLORS.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Profile</Text>

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
        <Text style={styles.profileName}>Raju Kumar</Text>

        {/* Role */}
        <Text style={styles.profileRole}>Delivery Partner</Text>

        {/* Verified Badge */}
        <View style={styles.verifiedBadge}>
          <Ionicons name="checkmark-circle" size={12} color={COLORS.white} />

          <Text style={styles.verifiedText}>Verified</Text>
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
              <Ionicons name={item.icon} size={19} color={COLORS.white} />

              <Text style={styles.menuTitle}>{item.title}</Text>
            </View>

            <Ionicons name="chevron-forward" size={23} color={COLORS.white} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        activeOpacity={0.75}
        onPress={handleLogout}
        disabled={loggingOut}
      >
        {loggingOut ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <>
            <Ionicons name="log-out-outline" size={20} color={COLORS.white} />
            <Text style={styles.logoutText}>Log Out</Text>
          </>
        )}
      </TouchableOpacity>
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

  logoutButton: {
    height: 52,
    marginTop: 18,
    marginHorizontal: 14,
    borderRadius: 14,
    backgroundColor: COLORS.red,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  logoutText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },
});
