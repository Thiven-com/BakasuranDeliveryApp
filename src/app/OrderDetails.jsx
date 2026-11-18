import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import BASE_URL from "../constants/AppUrls";
import { getOrderDetails } from "../utils/Function";

// COLORS
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
  green: "#20D34A",
  greenSoft: "rgba(32, 211, 74, 0.14)",
  gold: "#F5B51B",
  goldSoft: "rgba(245, 181, 27, 0.14)",
};

// PRODUCT IMAGE URL
const getProductImageUrl = (imagePath) => {
  if (!imagePath) return null;

  const baseUrl = BASE_URL.replace(/\/$/, "");
  const image = imagePath.replace(/^\//, "");

  return `${baseUrl}/${image}`;
};

// NORMALIZE API RESPONSE
const normalizeOrder = (data = {}) => {
  const orderDetails = data.order_details || {};
  const restaurant = data.restaurant_details || {};
  const customer = data.customer_details || {};
  const address = data.customer_address || {};

  const products = Array.isArray(data.products) ? data.products : [];

  const fullAddress = [
    address.address,
    address.address_2,
    address.landmark,
    address.city,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    id: orderDetails.order_id,

    bookingNumber: orderDetails.booking_number || "",

    status: orderDetails.order_status || "",

    paymentStatus: orderDetails.payment_status || "",

    amount: orderDetails.grand_total ?? null,

    restaurantName: restaurant.restaurant_name || "Restaurant",

    restaurantAddress: restaurant.address || "Address unavailable",

    restaurantPhone: restaurant.mobile || restaurant.phone || "",

    customerName: address.name || customer.customer_name || "Customer",

    customerAddress: fullAddress || "Address unavailable",

    customerPhone: address.mobile || address.phone || customer.mobile || "",

    items: products.map((item) => ({
      id: item.order_item_id,
      productId: item.product_id,

      name: item.product_name || `Product #${item.product_id}`,

      image: item.product_image,

      quantity: item.quantity ?? 1,

      price: item.price,

      total: item.total,
    })),
  };
};

// MAIN SCREEN
export default function OrderDetailsScreen() {
  const { orderId: rawOrderId } = useLocalSearchParams();

  const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  console.log("Received Order ID:", orderId);

  // LOAD ORDER DETAILS
  const loadOrderDetails = useCallback(async () => {
    if (!orderId) {
      setError("Order id is missing");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getOrderDetails(orderId);

      console.log("Order Details Response:", response);

      if (response?.status === true) {
        setOrder(normalizeOrder(response.data));
      } else {
        setError(response?.message || "Failed to load order details");
      }
    } catch (err) {
      console.log("Order Details Error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrderDetails();
  }, [loadOrderDetails]);

  // CALL RESTAURANT / CUSTOMER
  const handleCall = (label, phone) => {
    if (!phone) {
      Alert.alert(`Call ${label}`, "Phone number is not available.");
      return;
    }

    Linking.openURL(`tel:${phone}`).catch(() => {
      Alert.alert("Error", "Unable to open the phone dialer.");
    });
  };

  // PICKUP BUTTON
  const handlePickup = () => {
    router.push({
      pathname: "/ConfirmPickupScreen",
      params: {
        id: String(orderId),
      },
    });
  };

  const totalQty = order?.items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  // LOADING SCREEN
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.background}
        />

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color={COLORS.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Order Details</Text>

          <View style={styles.headerRight} />
        </View>

        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={COLORS.red} />
          <Text style={styles.stateText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ERROR SCREEN
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={COLORS.background}
        />

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="chevron-back" size={22} color={COLORS.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Order Details</Text>

          <View style={styles.headerRight} />
        </View>

        <View style={styles.centerBox}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={34}
              color={COLORS.red}
            />
          </View>

          <Text style={styles.errorTitle}>Couldn't load order</Text>

          <Text style={styles.stateText}>{error}</Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadOrderDetails}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // MAIN UI
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.white} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Order Details</Text>

        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ORDER SUMMARY */}
        <View style={styles.card}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.label}>ORDER ID</Text>

              <Text style={styles.orderId}>
                #{order?.bookingNumber || order?.id}
              </Text>
            </View>

            {!!order?.status && (
              <View style={styles.statusBadge}>
                <View style={styles.badgeDot} />

                <Text style={styles.statusText}>
                  {String(order.status).toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.amountBox}>
            <View>
              <Text style={styles.amountLabel}>
                {order?.items.length} Items
                {totalQty ? ` • Qty ${totalQty}` : ""}
              </Text>

              {!!order?.paymentStatus && (
                <Text style={styles.paymentStatus}>
                  Payment: {order.paymentStatus.toUpperCase()}
                </Text>
              )}
            </View>

            <Text style={styles.amount}>
              {order?.amount != null
                ? `₹${Number(order.amount).toFixed(2)}`
                : "--"}
            </Text>
          </View>
        </View>

        {/* RESTAURANT AND CUSTOMER DETAILS */}
        <View style={styles.card}>
          {/* RESTAURANT */}
          <View style={styles.stopRow}>
            <View style={styles.timeline}>
              <View style={[styles.stopIcon, styles.pickupIcon]}>
                <Ionicons name="restaurant" size={17} color={COLORS.gold} />
              </View>

              <View style={styles.timelineLine} />
            </View>

            <View style={styles.stopBody}>
              <Text style={[styles.stopTag, { color: COLORS.gold }]}>
                PICKUP FROM
              </Text>

              <Text style={styles.stopName}>{order?.restaurantName}</Text>

              <Text style={styles.stopAddress}>{order?.restaurantAddress}</Text>
            </View>

            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCall("Restaurant", order?.restaurantPhone)}
            >
              <Ionicons name="call" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* CUSTOMER */}
          <View style={[styles.stopRow, { marginTop: 4 }]}>
            <View style={styles.timeline}>
              <View style={[styles.stopIcon, styles.dropIcon]}>
                <Ionicons name="location" size={17} color={COLORS.green} />
              </View>
            </View>

            <View style={styles.stopBody}>
              <Text style={[styles.stopTag, { color: COLORS.green }]}>
                DELIVER TO
              </Text>

              <Text style={styles.stopName}>{order?.customerName}</Text>

              <Text style={styles.stopAddress}>{order?.customerAddress}</Text>
            </View>

            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCall("Customer", order?.customerPhone)}
            >
              <Ionicons name="call" size={18} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* PRODUCT ITEMS */}
        <View style={styles.card}>
          <View style={styles.itemsHeader}>
            <Text style={styles.sectionTitle}>Items</Text>

            <View style={styles.countPill}>
              <Text style={styles.countPillText}>{order?.items.length}</Text>
            </View>
          </View>

          {order?.items.length === 0 && (
            <Text style={styles.stateText}>No items found.</Text>
          )}

          {order?.items.map((item, index) => {
            const imageUrl = getProductImageUrl(item.image);

            const displayPrice =
              item.total != null && Number(item.total) > 0
                ? Number(item.total)
                : item.price != null
                  ? Number(item.price) * Number(item.quantity)
                  : null;

            return (
              <View
                key={item.id || index}
                style={[
                  styles.productRow,
                  index === order.items.length - 1 && styles.lastItemRow,
                ]}
              >
                {/* PRODUCT IMAGE */}
                {imageUrl ? (
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.productImage}
                    resizeMode="cover"
                    onError={() =>
                      console.log("Product image failed:", imageUrl)
                    }
                  />
                ) : (
                  <View style={styles.productImagePlaceholder}>
                    <Ionicons
                      name="fast-food-outline"
                      size={30}
                      color={COLORS.gray}
                    />
                  </View>
                )}

                {/* PRODUCT INFORMATION */}
                <View style={styles.productInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name}
                  </Text>

                  <Text style={styles.itemQuantity}>
                    Quantity: {item.quantity}
                  </Text>

                  <Text style={styles.productPrice}>
                    {displayPrice != null
                      ? `₹${displayPrice.toFixed(2)}`
                      : "Price unavailable"}
                  </Text>
                </View>

                <View style={styles.qtyPill}>
                  <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* PICKUP BUTTON */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.pickupButton}
          activeOpacity={0.85}
          onPress={handlePickup}
        >
          <Ionicons name="bag-check" size={22} color={COLORS.white} />

          <Text style={styles.pickupButtonText}>Pick Up Order</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // HEADER
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
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  headerRight: {
    width: 40,
  },

  // LOADING AND ERROR
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  stateText: {
    color: COLORS.gray,
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
  },

  errorIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.redSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  errorTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },

  retryButton: {
    marginTop: 20,
    height: 44,
    paddingHorizontal: 28,
    borderRadius: 22,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
  },

  retryText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },

  // SCROLL
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },

  // CARDS
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 16,
    marginBottom: 16,
  },

  // ORDER SUMMARY
  summaryTop: {
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
    fontSize: 20,
    fontWeight: "700",
  },

  statusBadge: {
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

  statusText: {
    color: COLORS.red,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
  },

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

  paymentStatus: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 5,
  },

  amount: {
    color: COLORS.gold,
    fontSize: 24,
    fontWeight: "800",
  },

  // RESTAURANT AND CUSTOMER
  stopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  timeline: {
    width: 38,
    alignItems: "center",
  },

  stopIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  pickupIcon: {
    backgroundColor: COLORS.goldSoft,
  },

  dropIcon: {
    backgroundColor: COLORS.greenSoft,
  },

  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 22,
    backgroundColor: COLORS.cardBorder,
    marginVertical: 4,
  },

  stopBody: {
    flex: 1,
    marginLeft: 12,
    paddingBottom: 12,
  },

  stopTag: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 3,
  },

  stopName: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "600",
  },

  stopAddress: {
    color: COLORS.gray,
    fontSize: 14,
    lineHeight: 19,
    marginTop: 3,
  },

  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  // ITEMS
  itemsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },

  countPill: {
    marginLeft: 8,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 7,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  countPillText: {
    color: COLORS.lightGray,
    fontSize: 12,
    fontWeight: "700",
  },

  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },

  productImage: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },

  productImagePlaceholder: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
  },

  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },

  itemName: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "600",
    paddingRight: 5,
  },

  itemQuantity: {
    color: COLORS.lightGray,
    fontSize: 13,
    fontWeight: "500",
    marginTop: 5,
  },

  productPrice: {
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: "700",
    marginTop: 5,
  },

  qtyPill: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 5,
  },

  lastItemRow: {
    borderBottomWidth: 0,
  },

  // BOTTOM BUTTON
  bottomContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === "web" ? 100 : 12,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
  },

  pickupButton: {
    height: 52,
    flexDirection: "row",
    backgroundColor: COLORS.red,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: COLORS.red,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
  },

  pickupButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },
});
