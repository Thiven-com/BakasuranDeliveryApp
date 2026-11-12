
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const COLORS = {
  background: "#050505",
  card: "#191919",
  cardBorder: "#292929",
  red: "#F9080C",
  redDark: "#B80000",
  white: "#FFFFFF",
  gray: "#AFAFAF",
  green: "#20D34A",
  gold: "#F5B51B",
};

export default function OrderDetailsScreen() {
  const order = {
    id: "#BSK100234",
    amount: "₹320",
    itemCount: "2 Items",

    restaurant: "Biryani House",
    restaurantAddress: "Madhapur, Hyderabad",
    restaurantPhone: "+919876543210",

    customer: "Ravi Kumar",
    customerAddress:
      "H.No 8-3-4, Kavuri Hills, Hyderabad",
    customerPhone: "+919876543211",

    items: [
      {
        name: "Chicken Biryani",
        quantity: "x1",
      },
      {
        name: "Egg Biryani",
        quantity: "x1",
      },
    ],
  };

  const handleCall = (person) => {
    Alert.alert(
      "Call " + person,
      "Phone calling will be connected when the actual contact details are available."
    );
  };

  const handlePickup = () => {
    Alert.alert(
      "Pick Up Order",
      "Pickup verification API is not connected yet."
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
      />

      

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={COLORS.white}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Order Details</Text>

        <View style={styles.headerRight} />
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Order Information */}
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>{order.id}</Text>

          <View style={styles.amountRow}>
            <Text style={styles.amount}>{order.amount}</Text>
            <Text style={styles.separator}> • </Text>
            <Text style={styles.itemCount}>{order.itemCount}</Text>
          </View>
        </View>

        {/* Pickup Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pickup From</Text>

          <View style={styles.locationRow}>
            <View style={styles.locationIcon}>
              <Ionicons
                name="home"
                size={18}
                color={COLORS.red}
              />
            </View>

            <View style={styles.locationDetails}>
              <Text style={styles.locationName}>
                {order.restaurant}
              </Text>

              <Text style={styles.locationAddress}>
                {order.restaurantAddress}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCall("Restaurant")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="call"
                size={17}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Delivery Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deliver To</Text>

          <View style={styles.locationRow}>
            <View style={styles.locationIcon}>
              <Ionicons
                name="location"
                size={19}
                color={COLORS.green}
              />
            </View>

            <View style={styles.locationDetails}>
              <Text style={styles.locationName}>
                {order.customer}
              </Text>

              <Text style={styles.locationAddress}>
                {order.customerAddress}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.callButton}
              onPress={() => handleCall("Customer")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="call"
                size={17}
                color={COLORS.white}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Items */}
        <View style={styles.itemsSection}>
          <Text style={styles.sectionTitle}>
            Items ({order.items.length})
          </Text>

          {order.items.map((item, index) => (
            <View
              key={index}
              style={[
                styles.itemRow,
                index === order.items.length - 1 &&
                  styles.lastItemRow,
              ]}
            >
              <Text style={styles.itemName}>
                {item.name}
              </Text>

              <Text style={styles.itemQuantity}>
                {item.quantity}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.pickupButton}
          activeOpacity={0.85}
         onPress={() => router.push("/PickupScreen")}
        >
          <Text style={styles.pickupButtonText}>
            Pick Up Order
          </Text>
        </TouchableOpacity>
      </View>
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
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },

  backButton: {
    width: 32,
    height: 38,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: "700",
  },

  headerRight: {
    width: 32,
  },

  // Main Scroll
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 13,
    paddingTop: 3,
    paddingBottom: 12,
  },

  // Order Header
  orderHeader: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 9,
    paddingVertical: 8,
    marginBottom: 18,
  },

  orderId: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: "700",
    marginBottom: 10,
  },

  amountRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  amount: {
    color: COLORS.gold,
    fontSize: 18,
    fontWeight: "800",
  },

  separator: {
    color: COLORS.gray,
    fontSize: 14,
  },

  itemCount: {
    color: COLORS.gray,
    fontSize: 18,
  },

  // Sections
  section: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 9,
    paddingVertical: 8,
    marginBottom: 18,
  },

  sectionTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 7,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  locationIcon: {
    width: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },

  locationDetails: {
    flex: 1,
    justifyContent: "center",
  },

  locationName: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 2,
  },

  locationAddress: {
    color: COLORS.gray,
    fontSize: 16,
    lineHeight: 18,
  },

  callButton: {
    width: 35,
    height: 35,
    borderRadius: 16,
    backgroundColor: COLORS.red,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },

  // Items
  itemsSection: {
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 9,
    paddingTop: 12,
    paddingBottom: 18,
  },

  itemRow: {
    minHeight: 28,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#303030",
  },

  lastItemRow: {
    borderBottomWidth: 0,
  },

  itemName: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "500",
  },

  itemQuantity: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "600",
  },

  // Bottom Button
  bottomContainer: {
    paddingHorizontal: 15,
    paddingTop: 8,
    paddingBottom: Platform.OS === "web" ? 100 : 15,
    backgroundColor: COLORS.background,
  },

  pickupButton: {
    height: 46,
    backgroundColor: COLORS.red,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },

  pickupButtonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "700",
  },
});
