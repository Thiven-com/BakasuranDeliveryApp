import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { getOrderDetails } from "../utils/Function";

const COLORS = {
  background: "#0A0A0A",
  card: "#161616",
  border: "#292929",
  red: "#F9080C",
  white: "#FFFFFF",
  gray: "#999999",
  gold: "#F5B51B",
  green: "#20D34A",
};

export default function OrderMapScreen() {
  const { orderId: rawOrderId, stage: rawStage } = useLocalSearchParams();

  const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;

  const stage = Array.isArray(rawStage)
    ? rawStage[0]
    : rawStage || "restaurant";

  const isDeliveryStage = stage === "delivery";

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==================================
  // GET ORDER DETAILS
  // ==================================

  const loadOrderDetails = useCallback(async () => {
    console.log("Order ID:", orderId);
    console.log("Current Stage:", stage);

    if (!orderId) {
      setError("Order ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await getOrderDetails(orderId);

      console.log(
        "Order Details API Response:",
        JSON.stringify(response, null, 2),
      );

      if (response?.status !== true || !response?.data) {
        setError(response?.message || "Unable to load order details.");
        return;
      }

      const data = response.data;

      const restaurant = data.restaurant_details || {};
      const customer = data.customer_details || {};
      const address = data.customer_address || {};

      const customerAddress = [
        address.address,
        address.address_2,
        address.landmark,
        address.city,
        address.state,
        address.pincode,
      ]
        .filter(Boolean)
        .join(", ");

      setOrder({
        bookingNumber: data.order_details?.booking_number || orderId,

        status: data.order_details?.order_status || "",

        restaurantName: restaurant.restaurant_name || "Restaurant",

        restaurantAddress: restaurant.address || "",

        restaurantLatitude: restaurant.latitude ?? null,
        restaurantLongitude: restaurant.longitude ?? null,

        customerName: address.name || customer.customer_name || "Customer",

        customerAddress,

        customerLatitude: address.latitude ?? null,
        customerLongitude: address.longitude ?? null,
      });
    } catch (err) {
      console.log("Order Details Error:", err);
      setError(err?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [orderId, stage]);

  useEffect(() => {
    loadOrderDetails();
  }, [loadOrderDetails]);

  // ==================================
  // OPEN GOOGLE MAPS
  // ==================================

  const openGoogleMaps = async (latitude, longitude, address, locationName) => {
    let destination = "";

    const hasCoordinates =
      latitude !== null &&
      latitude !== undefined &&
      longitude !== null &&
      longitude !== undefined &&
      String(latitude).trim() !== "" &&
      String(longitude).trim() !== "" &&
      Number.isFinite(Number(latitude)) &&
      Number.isFinite(Number(longitude));

    if (hasCoordinates) {
      destination = `${latitude},${longitude}`;
    } else if (address?.trim()) {
      destination = address.trim();
    } else {
      Alert.alert(
        "Location Unavailable",
        `${locationName} address and coordinates are missing.`,
      );
      return;
    }

    const url =
      "https://www.google.com/maps/dir/?api=1" +
      `&destination=${encodeURIComponent(destination)}` +
      "&travelmode=driving";

    try {
      await Linking.openURL(url);
    } catch (err) {
      console.log("Google Maps Error:", err);

      Alert.alert("Navigation Error", "Unable to open Google Maps.");
    }
  };

  // ==================================
  // PICKUP ORDER BUTTON
  // ==================================

  const handlePickupOrder = () => {
    router.push({
      pathname: "/ConfirmPickupScreen",
      params: {
        orderId: String(orderId),
      },
    });
  };

  const handleReachedCustomer = () => {
    router.push({
      pathname: "/DeliverOrderScreen",
      params: {
        orderId: String(orderId),
        bookingNumber: order.bookingNumber,
      },
    });
  };

  // ==================================
  // LOADING SCREEN
  // ==================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <Header />

        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.red} />

          <Text style={styles.stateText}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ==================================
  // ERROR SCREEN
  // ==================================

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <Header />

        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={50} color={COLORS.red} />

          <Text style={styles.errorTitle}>Order Details Unavailable</Text>

          <Text style={styles.stateText}>
            {error || "No order information found."}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadOrderDetails}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ==================================
  // MAIN SCREEN
  // ==================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ORDER INFORMATION */}

        <View style={styles.orderCard}>
          <View style={styles.orderIcon}>
            <Ionicons name="receipt-outline" size={25} color={COLORS.red} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.smallLabel}>ORDER NUMBER</Text>

            <Text style={styles.orderNumber}>#{order.bookingNumber}</Text>

            <Text style={styles.orderStatus}>
              Status: {order.status || "Unavailable"}
            </Text>
          </View>
        </View>

        {/* RESTAURANT STAGE */}

        {!isDeliveryStage && (
          <>
            <View style={styles.stageCard}>
              <Ionicons name="restaurant" size={24} color={COLORS.gold} />

              <View style={{ flex: 1 }}>
                <Text style={styles.stageTitle}>Restaurant Pickup</Text>

                <Text style={styles.stageDescription}>
                  Navigate to the restaurant and collect the order.
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Restaurant Location</Text>

            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <View style={styles.restaurantIcon}>
                  <Ionicons name="restaurant" size={23} color={COLORS.gold} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.locationType}>PICKUP LOCATION</Text>

                  <Text style={styles.locationName}>
                    {order.restaurantName}
                  </Text>
                </View>
              </View>

              <Text style={styles.address}>
                {order.restaurantAddress || "Restaurant address unavailable"}
              </Text>

              <TouchableOpacity
                style={styles.restaurantButton}
                activeOpacity={0.85}
                onPress={() =>
                  openGoogleMaps(
                    order.restaurantLatitude,
                    order.restaurantLongitude,
                    order.restaurantAddress,
                    "Restaurant",
                  )
                }
              >
                <Ionicons name="navigate" size={20} color={COLORS.white} />

                <Text style={styles.buttonText}>Navigate to Restaurant</Text>
              </TouchableOpacity>
            </View>

            {/* PICKUP ORDER BUTTON */}

            <View style={styles.pickupCard}>
              <Ionicons name="bag-check" size={30} color={COLORS.green} />

              <Text style={styles.pickupTitle}>Reached the Restaurant?</Text>

              <Text style={styles.pickupDescription}>
                Collect the order and enter the pickup OTP provided by the
                restaurant.
              </Text>

              <TouchableOpacity
                style={styles.pickupButton}
                activeOpacity={0.85}
                onPress={handlePickupOrder}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={21}
                  color={COLORS.white}
                />

                <Text style={styles.buttonText}>Pickup Order</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* CUSTOMER STAGE - ONLY AFTER OTP SUCCESS */}

        {isDeliveryStage && (
          <>
            <View style={styles.stageCard}>
              <Ionicons name="bicycle" size={25} color={COLORS.green} />

              <View style={{ flex: 1 }}>
                <Text style={styles.stageTitle}>Order Picked Up</Text>

                <Text style={styles.stageDescription}>
                  Pickup OTP verified successfully. Now deliver the order to the
                  customer.
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Customer Location</Text>

            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <View style={styles.customerIcon}>
                  <Ionicons name="location" size={23} color={COLORS.green} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.customerLocationType}>
                    DELIVERY LOCATION
                  </Text>

                  <Text style={styles.locationName}>{order.customerName}</Text>
                </View>
              </View>

              <Text style={styles.address}>
                {order.customerAddress || "Customer address unavailable"}
              </Text>

              <TouchableOpacity
                style={styles.customerButton}
                activeOpacity={0.85}
                onPress={() =>
                  openGoogleMaps(
                    order.customerLatitude,
                    order.customerLongitude,
                    order.customerAddress,
                    "Customer",
                  )
                }
              >
                <Ionicons name="navigate" size={20} color={COLORS.white} />

                <Text style={styles.buttonText}>Navigate to Customer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.customerButton, styles.reachedCustomerButton]}
                activeOpacity={0.85}
                onPress={handleReachedCustomer}
              >
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.white}
                />

                <Text style={styles.buttonText}>Reached Customer</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ==================================
// HEADER
// ==================================

function Header() {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerBack} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={23} color={COLORS.white} />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Order Navigation</Text>

      <View style={{ width: 40 }} />
    </View>
  );
}

// ==================================
// STYLES
// ==================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    height: 62,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerBack: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "700",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },

  stateText: {
    color: COLORS.gray,
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
    lineHeight: 21,
  },

  errorTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 14,
  },

  retryButton: {
    backgroundColor: COLORS.red,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 22,
  },

  content: {
    padding: 16,
    paddingBottom: 35,
  },

  orderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },

  orderIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "rgba(249,8,12,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  smallLabel: {
    color: COLORS.gray,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
  },

  orderNumber: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: "700",
    marginTop: 3,
  },

  orderStatus: {
    color: COLORS.gray,
    fontSize: 12,
    marginTop: 4,
  },

  stageCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 15,
    borderRadius: 14,
    marginBottom: 24,
  },

  stageTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },

  stageDescription: {
    color: COLORS.gray,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 14,
  },

  locationCard: {
    backgroundColor: COLORS.card,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 17,
    marginBottom: 18,
  },

  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  restaurantIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(245,181,27,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  customerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "rgba(32,211,74,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  locationType: {
    color: COLORS.gold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },

  customerLocationType: {
    color: COLORS.green,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },

  locationName: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "700",
    marginTop: 4,
  },

  address: {
    color: COLORS.gray,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 15,
    marginBottom: 17,
  },

  restaurantButton: {
    height: 49,
    borderRadius: 12,
    backgroundColor: COLORS.red,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  customerButton: {
    height: 49,
    borderRadius: 12,
    backgroundColor: COLORS.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  reachedCustomerButton: {
    marginTop: 12,
  },

  pickupCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginTop: 4,
  },

  pickupTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
    marginTop: 12,
  },

  pickupDescription: {
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 18,
  },

  pickupButton: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },
});
