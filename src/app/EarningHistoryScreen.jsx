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
  getDeliveryEarnings,
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

const getEarningAmount = (item) => {
  const amount = [
    item?.amount,
    item?.earning,
    item?.earnings,
    item?.earning_amount,
    item?.delivery_earning,
    item?.delivery_partner_earning,
    item?.delivery_partner_amount,
    item?.delivery_fee,
    item?.commission,
  ].find((value) => value !== null && value !== undefined && value !== "");

  return amount !== undefined && Number.isFinite(Number(amount))
    ? Number(amount)
    : null;
};

export default function EarningHistoryScreen() {
  const [selectedFilter, setSelectedFilter] = useState("Today");
  const [earnings, setEarnings] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState(null);
  const [loading, setLoading] = useState(false);

  const filters = ["Today", "Week", "Month"];

  // Fetch earning history based on selected filter
  const loadEarnings = async (filter) => {
    try {
      setLoading(true);
      setEarnings([]);
      setWeeklySummary(null);

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
        const data = response.data;
        const earningList = [
          data,
          data?.data,
          data?.history,
          data?.items,
          data?.earnings,
          data?.transactions,
        ].find(Array.isArray) || [];
        setEarnings(earningList);

        if (filter === "Week") {
          const summary =
            data?.this_week ??
            (data?.total_earnings != null
              ? {
                  start_date: data.start_date,
                  end_date: data.end_date,
                  earnings: data.total_earnings,
                  orders: data.total_orders,
                }
              : data?.earnings != null &&
                  Number.isFinite(Number(data.earnings))
                ? data
                : null);

          if (summary) {
            setWeeklySummary(summary);
          } else {
            const earningsResponse = await getDeliveryEarnings();
            setWeeklySummary(earningsResponse?.data?.this_week ?? null);
          }
        }
      } else {
        setEarnings([]);
        setWeeklySummary(null);

        Alert.alert(
          "Error",
          response?.message || "Failed to load earning history",
        );
      }
    } catch (error) {
      console.log("Earning History Error:", error);
      setEarnings([]);
      setWeeklySummary(null);
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
        ) : (
          <>
            {selectedFilter === "Week" && weeklySummary && (
              <View style={styles.weeklySummaryCard}>
                <Text style={styles.weeklySummaryTitle}>
                  This Week's Earnings
                </Text>
                <Text style={styles.weeklySummaryDates}>
                  {weeklySummary.start_date || "--"} -{" "}
                  {weeklySummary.end_date || "--"}
                </Text>
                <Text style={styles.weeklySummaryAmount}>
                  ₹
                  {Number(weeklySummary.earnings || 0).toLocaleString("en-IN")}
                </Text>
                {weeklySummary.orders != null && (
                  <Text style={styles.weeklySummaryNote}>
                    {weeklySummary.orders} orders
                  </Text>
                )}
              </View>
            )}

            {earnings.length > 0 ? (
              earnings.map((item, index) => {
                const earningAmount = getEarningAmount(item);
                const subtotal =
                  item.subtotal != null && Number.isFinite(Number(item.subtotal))
                    ? Number(item.subtotal)
                    : null;

                return (
                  <View key={item.id ?? index} style={styles.earningCard}>
                    <View style={styles.completedIcon}>
                      <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                    </View>

                    <View style={styles.orderDetails}>
                      <Text style={styles.orderId}>
                        {item.invoice_id
                          ? `#${item.invoice_id}`
                          : item.booking_number
                            ? `#${item.booking_number}`
                            : item.order_number
                              ? `#${item.order_number}`
                              : item.order_id
                                ? `#${item.order_id}`
                                : item.booking_id
                                  ? `#${item.booking_id}`
                                  : "Delivery"}
                      </Text>

                      <Text style={styles.deliveryTime}>
                        Delivered •{" "}
                        {item.time ||
                          item.delivered_at ||
                          item.completed_at ||
                          item.delivery_date ||
                          item.created_at ||
                          item.date ||
                          "--"}
                      </Text>
                    </View>

                    {(earningAmount !== null || subtotal !== null) && (
                      <View style={styles.amountDetails}>
                        <Text style={styles.amountLabel}>
                          {earningAmount !== null ? "Earning" : "Subtotal"}
                        </Text>
                        <Text style={styles.amount}>
                          ₹
                          {(earningAmount ?? subtotal).toLocaleString("en-IN")}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })
            ) : !(selectedFilter === "Week" && weeklySummary) ? (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="receipt-outline"
                  size={35}
                  color={COLORS.gray}
                />
                <Text style={styles.emptyText}>No earnings found</Text>
              </View>
            ) : null}
          </>
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

  weeklySummaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#242424",
    padding: 16,
    alignItems: "center",
    marginBottom: 18,
  },

  weeklySummaryTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },

  weeklySummaryDates: {
    color: COLORS.gray,
    fontSize: 14,
    marginTop: 8,
  },

  weeklySummaryAmount: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 12,
  },

  weeklySummaryNote: {
    color: COLORS.gray,
    fontSize: 13,
    marginTop: 8,
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
    fontSize: 16,
    fontWeight: "700",
  },

  amountDetails: {
    alignItems: "flex-end",
    marginLeft: 8,
  },

  amountLabel: {
    color: COLORS.gray,
    fontSize: 11,
    marginBottom: 3,
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
