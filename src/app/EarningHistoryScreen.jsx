import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  getMonthlyEarningHistory,
  getTodayEarningHistory,
  getWeeklyEarningHistory,
} from "../utils/Function";

const COLORS = {
  background: "#050505",
  card: "#171717",
  red: "#F9080C",
  white: "#FFFFFF",
  gray: "#A5A5A5",
  green: "#19D53B",
};

export default function EarningHistoryScreen() {
  const [selectedFilter, setSelectedFilter] = useState("Today");
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(false);

  const filters = ["Today", "Week", "Month"];

  // Fetch earning history based on selected filter
  const loadEarnings = async (filter) => {
    try {
      setLoading(true);
      setEarnings([]);

      let response;

      if (filter === "Today") {
        response = await getTodayEarningHistory();
      } else if (filter === "Week") {
        response = await getWeeklyEarningHistory();
      } else {
        response = await getMonthlyEarningHistory();
      }

      console.log(`${filter} Earnings Response:`, response);

      if (response?.status === true) {
        // Adjust this mapping after checking the actual API response.
        const earningList = Array.isArray(response.data) ? response.data : [];

        setEarnings(earningList);
      } else {
        setEarnings([]);

        Alert.alert(
          "Error",
          response?.message || "Failed to load earning history",
        );
      }
    } catch (error) {
      console.log("Earning History Error:", error);
      setEarnings([]);
      Alert.alert("Error", "Unable to fetch earning history");
    } finally {
      setLoading(false);
    }
  };

  // Load API whenever the selected filter changes
  useEffect(() => {
    loadEarnings(selectedFilter);
  }, [selectedFilter]);

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
          <Ionicons name="chevron-back" size={24} color={COLORS.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Earning History</Text>

        <View style={styles.headerRight} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {filters.map((filter) => {
          const isActive = selectedFilter === filter;

          return (
            <TouchableOpacity
              key={filter}
              style={[styles.filterButton, isActive && styles.activeFilter]}
              onPress={() => setSelectedFilter(filter)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.filterText, isActive && styles.activeFilterText]}
              >
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Earnings List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Loading earnings...</Text>
          </View>
        ) : earnings.length > 0 ? (
          earnings.map((item, index) => (
            <View key={item.id ?? index} style={styles.earningCard}>
              {/* Completed Icon */}
              <View style={styles.completedIcon}>
                <Ionicons name="checkmark" size={13} color="#FFFFFF" />
              </View>

              {/* Order Information */}
              <View style={styles.orderDetails}>
                <Text style={styles.orderId}>
                  {item.booking_number
                    ? `#${item.booking_number}`
                    : item.order_id
                      ? `#${item.order_id}`
                      : `Order #${index + 1}`}
                </Text>

                <Text style={styles.deliveryTime}>
                  Delivered • {item.time || item.created_at || "--"}
                </Text>
              </View>

              {/* Amount */}
              <Text style={styles.amount}>
                {item.amount != null
                  ? `₹${item.amount}`
                  : item.earning != null
                    ? `₹${item.earning}`
                    : "₹--"}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={35} color={COLORS.gray} />

            <Text style={styles.emptyText}>No earnings found</Text>
          </View>
        )}
      </ScrollView>
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

  // Filter Tabs
  filterContainer: {
    height: 44,
    backgroundColor: "#242424",
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 14,
    marginTop: 20,
    marginBottom: 20,
    padding: 7,
  },

  filterButton: {
    flex: 1,
    height: 30,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },

  activeFilter: {
    backgroundColor: COLORS.red,
  },

  filterText: {
    color: "#D0D0D0",
    fontSize: 19,
    fontWeight: "600",
  },

  activeFilterText: {
    color: COLORS.white,
    fontWeight: "800",
  },

  // Earnings List
  scrollView: {
    flex: 1,
  },

  listContent: {
    paddingHorizontal: 13,
    paddingBottom: 20,
  },

  earningCard: {
    minHeight: 63,
    backgroundColor: COLORS.card,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: "#242424",
  },

  // Completed Icon
  completedIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.green,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },

  // Order Details
  orderDetails: {
    flex: 1,
    justifyContent: "center",
  },

  orderId: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 9,
  },

  deliveryTime: {
    color: COLORS.gray,
    fontSize: 17,
    fontWeight: "500",
  },

  // Amount
  amount: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 5,
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },

  emptyText: {
    color: COLORS.gray,
    fontSize: 14,
    marginTop: 10,
  },
});
