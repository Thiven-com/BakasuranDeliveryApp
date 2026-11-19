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
  const { orderId: rawOrderId, id: fallbackId } = useLocalSearchParams();

  // Accept either parameter while supporting the corrected orderId route.
  const orderId = Array.isArray(rawOrderId)
    ? rawOrderId[0]
    : rawOrderId || (Array.isArray(fallbackId) ? fallbackId[0] : fallbackId);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // LOAD ORDER DETAILS
  const loadOrderDetails = useCallback(async () => {
    console.log("================================");
    console.log("Received Order ID:", orderId);
    console.log("================================");

    if (!orderId) {
      setError("Order ID is missing. Please check navigation.");
      setLoading(false);
      console.log("ERROR: Order ID is missing");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setOrder(null);

      const response = await getOrderDetails(orderId);

      // IMPORTANT DEBUG LOGS
      console.log("Order ID:", orderId);
      console.log(
        "Order Details API Response:",
        JSON.stringify(response, null, 2),
      );

      if (response?.status !== true || !response?.data) {
        const message = response?.message || "Unable to fetch order details";

        console.log("API FAILED:", message);
        setError(message);
        return;
      }

      const data = response.data;

      const orderDetails = data.order_details || {};
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

      const formattedOrder = {
        bookingNumber:
          orderDetails.booking_number || orderDetails.order_id || orderId,

        status: orderDetails.order_status || "Unavailable",

        restaurantName: restaurant.restaurant_name || "Restaurant",

        restaurantAddress: restaurant.address || "",

        restaurantLatitude: restaurant.latitude ?? null,
        restaurantLongitude: restaurant.longitude ?? null,

        customerName: address.name || customer.customer_name || "Customer",

        customerAddress,

        customerLatitude: address.latitude ?? null,
        customerLongitude: address.longitude ?? null,
      };

      console.log(
        "Formatted Order Details:",
        JSON.stringify(formattedOrder, null, 2),
      );

      setOrder(formattedOrder);
    } catch (err) {
      console.log("Order Details Error:", err);
      console.log("Error Message:", err?.message);

      setError(
        err?.message || "Something went wrong while loading order details.",
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrderDetails();
  }, [loadOrderDetails]);

  // OPEN GOOGLE MAPS
  const openGoogleMaps = async (latitude, longitude, address, label) => {
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
    } else if (address && address.trim()) {
      destination = address.trim();
    } else {
      Alert.alert(
        "Location unavailable",
        `${label} address and coordinates are not available from the API.`,
      );
      return;
    }

    const url =
      "https://www.google.com/maps/dir/?api=1" +
      `&destination=${encodeURIComponent(destination)}` +
      "&travelmode=driving";

    console.log("Opening Google Maps:", url);

    try {
      await Linking.openURL(url);
    } catch (err) {
      console.log("Google Maps Error:", err);
      Alert.alert("Error", "Unable to open Google Maps.");
    }
  };

  // LOADING
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <Header />

        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.red} />
          <Text style={styles.stateText}>Loading order locations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ERROR
  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <Header />

        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.red} />

          <Text style={styles.errorTitle}>Order details unavailable</Text>

          <Text style={styles.stateText}>
            {error || "No order information found."}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadOrderDetails}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButtonText}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // MAIN SCREEN
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

            <Text style={styles.orderStatus}>Status: {order.status}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Delivery Locations</Text>

        {/* RESTAURANT */}
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <View style={styles.restaurantIcon}>
              <Ionicons name="restaurant" size={22} color={COLORS.gold} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.locationType}>PICKUP LOCATION</Text>

              <Text style={styles.locationName}>{order.restaurantName}</Text>
            </View>
          </View>

          <Text style={styles.address}>
            {order.restaurantAddress || "Address unavailable"}
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

        {/* CUSTOMER */}
        <View style={styles.locationCard}>
          <View style={styles.locationHeader}>
            <View style={styles.customerIcon}>
              <Ionicons name="location" size={22} color={COLORS.green} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.customerLocationType}>DELIVERY LOCATION</Text>

              <Text style={styles.locationName}>{order.customerName}</Text>
            </View>
          </View>

          <Text style={styles.address}>
            {order.customerAddress || "Address unavailable"}
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
        </View>

        {/* INFORMATION */}
        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={22}
            color={COLORS.gold}
          />

          <Text style={styles.infoText}>
            Google Maps opens directions from your current location to the
            selected destination. Accurate navigation depends on the address or
            coordinates returned by your API.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// HEADER COMPONENT
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

// STYLES
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

  buttonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
  },

  backButtonText: {
    padding: 12,
    marginTop: 8,
  },

  backText: {
    color: COLORS.gray,
    fontSize: 14,
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
    marginBottom: 25,
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
    marginBottom: 16,
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
  },

  customerButton: {
    height: 49,
    borderRadius: 12,
    backgroundColor: COLORS.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(245,181,27,0.10)",
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginTop: 5,
  },

  infoText: {
    flex: 1,
    color: COLORS.gray,
    fontSize: 13,
    lineHeight: 20,
  },
});
