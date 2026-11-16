import {
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const RED = "#F10D16";
const BLACK = "#050505";

export default function ProfileScreen() {
  const router = useRouter();

  const profileOptions = [
    {
      title: "Personal Details",
      icon: "person-outline",
      route: "/profile/personal-details",
    },
    {
      title: "Vehicle Details",
      icon: "motorbike",
      type: "material",
      route: "/profile/vehicle-details",
    },
    {
      title: "Bank Details",
      icon: "card-outline",
      route: "/profile/bank-details",
    },
    {
      title: "Documents",
      icon: "document-text-outline",
      route: "/profile/documents",
    },
  ];

  const handleNavigation = (route) => {
    router.push(route);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={BLACK} />

      <LinearGradient
        colors={["#120303", "#050505", "#080808"]}
        style={styles.background}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER */}

          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>My Profile</Text>

            <View style={styles.headerSpace} />
          </View>

          {/* PROFILE INFORMATION */}

          <View style={styles.profileContainer}>
            <Image
              source={require("../../../assets/images/Profile.png")}
              style={styles.profileImage}
              resizeMode="cover"
            />

            <Text style={styles.name}>Raju Kumar</Text>

            <Text style={styles.role}>Delivery Partner</Text>

            {/* VERIFIED BADGE */}

            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={19} color="#FFFFFF" />

              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>

          {/* PROFILE MENU */}

          <View style={styles.menuContainer}>
            {profileOptions.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.75}
                style={styles.menuCard}
                onPress={() => handleNavigation(item.route)}
              >
                <View style={styles.iconContainer}>
                  {item.type === "material" ? (
                    <MaterialCommunityIcons
                      name={item.icon}
                      size={29}
                      color="#FFFFFF"
                    />
                  ) : (
                    <Ionicons name={item.icon} size={29} color="#FFFFFF" />
                  )}
                </View>

                <Text style={styles.menuTitle}>{item.title}</Text>

                <Ionicons name="chevron-forward" size={25} color="#FFFFFF" />
              </TouchableOpacity>
            ))}
          </View>

          {/* FOOTER */}

          <View style={styles.footer}>
            <Text style={styles.footerText}>BAKASURAN DELIVERY PARTNER</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BLACK,
  },

  background: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  // HEADER

  header: {
    height: 55,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 5,
  },

  backButton: {
    width: 40,
    alignItems: "flex-start",
  },

  headerTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
  },

  headerSpace: {
    width: 40,
  },

  // PROFILE

  profileContainer: {
    alignItems: "center",
    marginTop: 30,
  },

  profileImage: {
    width: 125,
    height: 125,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },

  name: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
    marginTop: 18,
  },

  role: {
    color: "#BBBBBB",
    fontSize: 16,
    marginTop: 5,
  },

  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00B72D",
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 30,
    marginTop: 18,
    gap: 7,
  },

  verifiedText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  // MENU

  menuContainer: {
    marginTop: 35,
    gap: 15,
  },

  menuCard: {
    height: 78,
    borderWidth: 1,
    borderColor: "#777777",
    backgroundColor: "#111111",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
  },

  iconContainer: {
    width: 48,
    alignItems: "flex-start",
  },

  menuTitle: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 10,
  },

  // FOOTER

  footer: {
    alignItems: "center",
    marginTop: 55,
  },

  footerText: {
    color: "#555555",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
});
