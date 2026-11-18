import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { getDeliveryEarnings } from "../../utils/Function";

const COLORS = {
  background: "#050505",
  card: "#191919",
  cardBorder: "#242424",
  red: "#F9080C",
  redDark: "#B80000",
  white: "#FFFFFF",
  gray: "#B8B8B8",
  gold: "#F5B51B",
};

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

export default function EarningsScreen() {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadEarnings = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      const response = await getDeliveryEarnings();

      console.log("Earnings Response:", response);

      if (response?.status === true) {
        setEarnings(response.data);
      } else {
        Alert.alert("Error", response?.message || "Failed to load earnings");
      }
    } catch (error) {
      console.log("Earnings Error:", error);
      Alert.alert("Error", "Something went wrong while loading earnings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadEarnings();
  }, [loadEarnings]);

  const onRefresh = () => {
    setRefreshing(true);
    loadEarnings(true);
  };

  const today = earnings?.today;
  const thisWeek = earnings?.this_week;

  const stats = [
    {
      title: "Orders",
      value: loading ? "..." : String(today?.orders ?? 0),
      icon: "gift-outline",
      color: COLORS.gold,
    },
    {
      title: "Incentives",
      // API doesn't return incentives yet, so this shows ₹0 until it does
      value: loading ? "..." : formatCurrency(today?.incentives),
      icon: "trophy",
      color: COLORS.gold,
    },
    {
      title: "Total",
      value: loading ? "..." : formatCurrency(today?.earnings),
      icon: "wallet-outline",
      color: COLORS.white,
    },
  ];

  const handleWithdraw = () => {
    Alert.alert(
      "Withdraw Earnings",
      "Withdrawal functionality will be connected to the backend.",
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.red}
            colors={[COLORS.red]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>My Earnings</Text>

          <View style={styles.headerRight} />
        </View>

        {/* Today's Earnings */}
        <View style={styles.todayCard}>
          <Text style={styles.todayLabel}>Today's Earnings</Text>

          <Text style={styles.todayAmount}>
            {loading ? "..." : formatCurrency(today?.earnings)}
          </Text>
        </View>

        {/* Earnings Statistics */}
        <View style={styles.statsContainer}>
          {stats.map((item, index) => (
            <View key={index} style={styles.statCard}>
              <Ionicons name={item.icon} size={23} color={item.color} />

              <Text style={styles.statTitle}>{item.title}</Text>

              <Text style={styles.statValue}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Withdraw Button */}
        <TouchableOpacity
          style={styles.withdrawButton}
          activeOpacity={0.8}
          onPress={handleWithdraw}
        >
          <Text style={styles.withdrawText}>Withdraw Earnings</Text>
        </TouchableOpacity>

        {/* Weekly Earnings */}
        <TouchableOpacity
          style={styles.weekCard}
          activeOpacity={0.8}
          onPress={() => router.push("/EarningHistoryScreen")}
        >
          <View>
            <Text style={styles.weekLabel}>This Week</Text>

            <Text style={styles.weekAmount}>
              {loading ? "..." : formatCurrency(thisWeek?.earnings)}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 15,
    paddingTop: Platform.OS === "android" ? 12 : 5,
    paddingBottom: 25,
  },

  // Header
  header: {
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 34,
  },

  backButton: {
    width: 30,
    height: 38,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: "700",
  },

  headerRight: {
    width: 30,
  },

  // Today's Earnings
  todayCard: {
    height: 100,
    backgroundColor: COLORS.redDark,
    borderRadius: 13,
    paddingHorizontal: 15,
    justifyContent: "center",
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#E51A1A",
  },

  todayLabel: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 5,
  },

  todayAmount: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: "800",
  },

  // Statistics
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 30,
  },

  statCard: {
    flex: 1,
    height: 100,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },

  statTitle: {
    color: COLORS.gray,
    fontSize: 17,
    fontWeight: "600",
    marginTop: 5,
    marginBottom: 4,
  },

  statValue: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },

  // Withdraw Button
  withdrawButton: {
    height: 48,
    backgroundColor: COLORS.red,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    elevation: 4,
  },

  withdrawText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "700",
  },

  // Weekly Earnings
  weekCard: {
    minHeight: 85,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  weekLabel: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: "600",
    marginBottom: 5,
  },

  weekAmount: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: "800",
  },
});
