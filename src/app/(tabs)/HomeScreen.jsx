
import {
  useState
} from "react";

import {
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";



const COLORS = {
  background: "#050505",
  card: "#1C1C1C",
  cardLight: "#242424",
  primary: "#F9080C",
  redDark: "#B80000",
  white: "#FFFFFF",
  gray: "#A0A0A0",
  green: "#00D639",
  gold: "#F5B51B",
};

export default function HomeScreen() {
  const [isOnline, setIsOnline] = useState(true);
  const [homeData, setHomeData] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // Format earnings
  const formatMoney = (value) => {
    if (value === undefined || value === null || value === "") {
      return "₹0";
    }

    if (typeof value === "string" && value.includes("₹")) {
      return value;
    }

    const amount = Number(value);

    if (Number.isNaN(amount)) {
      return String(value);
    }

    return `₹${amount.toLocaleString("en-IN")}`;
  };

  

  // Dashboard values
  const todayOrders =
    homeData?.today_orders ??
    homeData?.orders_today ??
    homeData?.todayOrders ??
    0;

  const todayEarnings =
    homeData?.today_earnings ??
    homeData?.earnings_today ??
    homeData?.todayEarnings ??
    0;

  const newOrdersValue =
    homeData?.new_orders_count ??
    homeData?.new_orders ??
    0;

  const newOrdersCount = Array.isArray(newOrdersValue)
    ? newOrdersValue.length
    : Number(newOrdersValue) || 0;

  // Dashboard Actions
  const dashboardItems = [
    {
      title: "New Orders",
      icon: "cube",
      color: COLORS.gold,
      badge: String(newOrdersCount),
      route: "/(tabs)/OrdersScreen",
    },
    {
      title: "My Orders",
      icon: "receipt-outline",
      color: COLORS.white,
      route: "/(tabs)/OrdersScreen",
    },
    {
      title: "Earnings",
      icon: "bar-chart",
      color: COLORS.gold,
      route: "/(tabs)/EarningsScreen",
    },
    {
      title: "Profile",
      icon: "person-outline",
      color: COLORS.white,
      route: "/(tabs)/ProfileScreen",
    },
  ];

  const openScreen = (path) => {
    router.push(path);
  };


  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadHomeData(true)}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {homeData?.name || homeData?.partner_name || "Raju"}{" "}
              <Text style={styles.wave}>👋</Text>
            </Text>

            <Text style={styles.subGreeting}>
              Delivery Partner
            </Text>
          </View>

          <TouchableOpacity
            style={styles.avatar}
            activeOpacity={0.8}
            onPress={() =>
              openScreen("/(tabs)/ProfileScreen")
            }
          >
            <Ionicons
              name="person"
              size={25}
              color={COLORS.white}
            />
          </TouchableOpacity>
        </View>

        {/* API Error */}
        {!!error && (
          <View style={styles.errorCard}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={COLORS.white}
            />

            <Text style={styles.errorText}>
              {error}
            </Text>

            <TouchableOpacity
              onPress={() => loadHomeData()}
            >
              <Text style={styles.retryText}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Online / Offline */}
        <View
          style={[
            styles.onlineCard,
            !isOnline && styles.offlineCard,
          ]}
        >
          <View style={styles.onlineTextContainer}>
            <View
              style={[
                styles.statusDot,
                !isOnline && styles.offlineDot,
              ]}
            />

            <Text style={styles.onlineText}>
              {isOnline
                ? "You are Online"
                : "You are Offline"}
            </Text>
          </View>

          <Switch
            value={isOnline}
            onValueChange={setIsOnline}
            trackColor={{
              false: "#555555",
              true: "#078C24",
            }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#555555"
          />
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {todayOrders}
            </Text>

            <Text style={styles.statLabel}>
              Today Orders
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {formatMoney(todayEarnings)}
            </Text>

            <Text style={styles.statLabel}>
              Today Earnings
            </Text>
          </View>
        </View>

        {/* Dashboard Actions */}
        <View style={styles.dashboardGrid}>
          {dashboardItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dashboardCard}
              activeOpacity={0.75}
              onPress={() => openScreen(item.route)}
            >
              <View style={styles.iconWrapper}>
                <Ionicons
                  name={item.icon}
                  size={27}
                  color={item.color}
                />

                {item.badge !== undefined &&
                  Number(item.badge) > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {item.badge}
                      </Text>
                    </View>
                  )}
              </View>

              <Text style={styles.dashboardTitle}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    color: COLORS.white,
    fontSize: 14,
    marginTop: 12,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 18 : 12,
    paddingBottom: 20,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  greeting: {
    color: COLORS.white,
    fontSize: 26,
    fontWeight: "800",
    marginTop: 30,
  },

  wave: {
    fontSize: 22,
  },

  subGreeting: {
    color: "#BDBDBD",
    fontSize: 19,
    marginTop: 10,
    fontWeight: "500",
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 24,
    backgroundColor: "#393939",
    borderWidth: 2,
    borderColor: "#777777",
    justifyContent: "center",
    alignItems: "center",
  },

  // API Error
  errorCard: {
    backgroundColor: "#4A1111",
    borderWidth: 1,
    borderColor: COLORS.red,
    borderRadius: 10,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 15,
  },

  errorText: {
    flex: 1,
    color: COLORS.white,
    fontSize: 12,
  },

  retryText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "800",
  },

  // Online Card
  onlineCard: {
    height: 58,
    backgroundColor: "#075B1D",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#00B52D",
    paddingHorizontal: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 17,
    elevation: 5,
    shadowColor: "#00E63A",
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },

  offlineCard: {
    backgroundColor: "#292929",
    borderColor: "#555555",
  },

  onlineTextContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: COLORS.green,
    marginRight: 8,
  },

  offlineDot: {
    backgroundColor: "#999999",
  },

  onlineText: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: "700",
  },

  // Statistics
  statsContainer: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 30,
  },

  statCard: {
    flex: 1,
    height: 100,
    backgroundColor: COLORS.card,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#292929",
  },

  statNumber: {
    color: COLORS.white,
    fontSize: 23,
    fontWeight: "800",
  },

  statLabel: {
    color: "#D0D0D0",
    fontSize: 18,
    marginTop: 10,
    fontWeight: "500",
  },

  // Dashboard
  dashboardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 25,
  },

  dashboardCard: {
    width: "46.5%",
    height: 100,
    backgroundColor: COLORS.card,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#292929",
  },

  iconWrapper: {
    position: "relative",
    marginBottom: 8,
  },

  dashboardTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
  },

  badge: {
    position: "absolute",
    top: -8,
    right: -12,
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.background,
  },

  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "800",
  },

  bottomSpace: {
    height: 12,
  },
});
