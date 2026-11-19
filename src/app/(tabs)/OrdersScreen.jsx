import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { acceptOrder, getNewOrders } from "../../utils/Function";

const COLORS = {
  background: "#0A0A0A",
  card: "#161616",
  cardBorder: "#262626",
  surface: "#1F1F1F",
  red: "#F9080C",
  redSoft: "rgba(249, 8, 12, 0.14)",
  white: "#FFFFFF",
  gray: "#9A9A9A",
  lightGray: "#D0D0D0",
  gold: "#F5B51B",
  goldSoft: "rgba(245, 181, 27, 0.14)",
};

export default function OrdersScreen() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);
  const [error, setError] = useState("");

  const loadNewOrders = useCallback(async (isRefresh = false) => {
    try {
      isRefresh ? setRefreshing(true) : setLoading(true);
      setError("");

      const response = await getNewOrders();

      if (response?.status === true) {
        setOrders(response.data || []);
      } else {
        setError(response?.message || "Failed to load orders");
      }
    } catch (err) {
      console.log("New Orders Error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleAccept = async (orderId) => {
    try {
      setAcceptingId(orderId);
      const response = await acceptOrder(orderId);

      if (response?.status === true) {
        router.push({
          pathname: "/OrderMapScreen",
          params: { orderId: String(orderId) },
        });
      } else {
        Alert.alert("Error", response?.message || "Unable to accept order");
      }
    } catch (err) {
      console.log("Accept Order Error:", err);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setAcceptingId(null);
    }
  };

  useEffect(() => {
    loadNewOrders();
  }, [loadNewOrders]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.white} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>New Orders</Text>
          {!loading && (
            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{orders.length}</Text>
            </View>
          )}
        </View>

        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadNewOrders(true)}
            tintColor={COLORS.red}
            colors={[COLORS.red]}
          />
        }
      >
        {/* Error */}
        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={COLORS.red}
            />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => loadNewOrders()}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Loading */}
        {loading && (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={COLORS.red} />
            <Text style={styles.stateText}>Loading orders...</Text>
          </View>
        )}

        {/* Empty */}
        {!loading && orders.length === 0 && !error && (
          <View style={styles.centerBox}>
            <View style={styles.emptyIcon}>
              <Ionicons name="receipt-outline" size={34} color={COLORS.gray} />
            </View>
            <Text style={styles.emptyTitle}>No new orders</Text>
            <Text style={styles.stateText}>
              Pull down to refresh and check again.
            </Text>
          </View>
        )}

        {/* Orders */}
        {orders.map((order) => {
          const isAccepting = acceptingId === order.id;

          return (
            <View key={order.id} style={styles.orderCard}>
              {/* Top row */}
              <View style={styles.topRow}>
                <View>
                  <Text style={styles.label}>ORDER ID</Text>
                  <Text style={styles.orderId}>#{order.booking_number}</Text>
                </View>

                <View style={styles.newBadge}>
                  <View style={styles.badgeDot} />
                  <Text style={styles.newBadgeText}>
                    {String(order.status || "New").toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Amount */}
              <View style={styles.amountBox}>
                <Text style={styles.amountLabel}>Order Amount</Text>
                <Text style={styles.amount}>₹{order.price}</Text>
              </View>

              <View style={styles.divider} />

              {/* Restaurant */}
              <View style={styles.restaurantRow}>
                <View style={styles.restaurantIcon}>
                  <Ionicons name="restaurant" size={18} color={COLORS.gold} />
                </View>

                <View style={styles.restaurantInfo}>
                  <Text style={styles.restaurantName} numberOfLines={1}>
                    {order.restaurant?.name || "Restaurant"}
                  </Text>
                  <Text style={styles.address} numberOfLines={2}>
                    {order.restaurant?.address || "Address unavailable"}
                  </Text>
                </View>
              </View>

              {/* Distance + time chips */}
              <View style={styles.chipsRow}>
                <View style={styles.chip}>
                  <Ionicons
                    name="navigate-outline"
                    size={15}
                    color={COLORS.lightGray}
                  />
                  <Text style={styles.chipText}>
                    {order.distance_km != null
                      ? `${order.distance_km} km`
                      : "-- km"}
                  </Text>
                </View>

                <View style={styles.chip}>
                  <Ionicons
                    name="time-outline"
                    size={15}
                    color={COLORS.lightGray}
                  />
                  <Text style={styles.chipText}>
                    {order.estimated_time != null
                      ? `${order.estimated_time} mins`
                      : "-- mins"}
                  </Text>
                </View>
              </View>

              {/* Accept Button */}
              <TouchableOpacity
                style={[
                  styles.acceptButton,
                  isAccepting && styles.acceptDisabled,
                ]}
                activeOpacity={0.85}
                disabled={isAccepting}
                onPress={() => handleAccept(order.id)}
              >
                {isAccepting ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={COLORS.white}
                    />
                    <Text style={styles.acceptButtonText}>Accept Order</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    justifyContent: "center",
    alignItems: "center",
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  countPill: {
    marginLeft: 8,
    minWidth: 26,
    height: 26,
    paddingHorizontal: 8,
    borderRadius: 13,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
  },
  countPillText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: "800",
  },
  headerRight: {
    width: 40,
  },

  // List
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 30,
    flexGrow: 1,
  },

  // States
  centerBox: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  stateText: {
    color: COLORS.gray,
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.redSoft,
    borderWidth: 1,
    borderColor: "rgba(249, 8, 12, 0.35)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    flex: 1,
    color: COLORS.red,
    fontSize: 14,
    marginLeft: 8,
  },
  retryText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 8,
  },

  // Card
  orderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  label: {
    color: COLORS.gray,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 2,
  },
  orderId: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: "700",
  },
  newBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.redSoft,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.red,
    marginRight: 6,
  },
  newBadgeText: {
    color: COLORS.red,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
  },

  // Amount
  amountBox: {
    marginTop: 16,
    backgroundColor: COLORS.goldSoft,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  amountLabel: {
    color: COLORS.lightGray,
    fontSize: 14,
    fontWeight: "500",
  },
  amount: {
    color: COLORS.gold,
    fontSize: 24,
    fontWeight: "800",
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginVertical: 16,
  },

  // Restaurant
  restaurantRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  restaurantIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.goldSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: 12,
  },
  restaurantName: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "600",
  },
  address: {
    color: COLORS.gray,
    fontSize: 14,
    marginTop: 3,
    lineHeight: 19,
  },

  // Chips
  chipsRow: {
    flexDirection: "row",
    marginTop: 14,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginRight: 10,
  },
  chipText: {
    color: COLORS.lightGray,
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 6,
  },

  // Accept button
  acceptButton: {
    height: 50,
    marginTop: 18,
    flexDirection: "row",
    backgroundColor: COLORS.red,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: COLORS.red,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  acceptDisabled: {
    opacity: 0.7,
  },
  acceptButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },
});
