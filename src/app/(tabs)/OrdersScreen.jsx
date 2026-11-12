
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
  cardBorder: "#252525",
  red: "#F9080C",
  white: "#FFFFFF",
  gray: "#B8B8B8",
  gold: "#F5B51B",
};

const orders = [
  {
    id: "#BSK100234",
    amount: "₹320",
    items: "2 Items",
    restaurant: "Biryani House",
    address: "Madhapur, Hyderabad",
    distance: "4.5 km",
    time: "15 mins",
  },
  {
    id: "#BSK100235",
    amount: "₹450",
    items: "3 Items",
    restaurant: "Pizza Planet",
    address: "Hitech City, Hyderabad",
    distance: "5.2 km",
    time: "18 mins",
  },
  {
    id: "#BSK100236",
    amount: "₹280",
    items: "2 Items",
    restaurant: "Spice Kitchen",
    address: "Kondapur, Hyderabad",
    distance: "3.8 km",
    time: "12 mins",
  },
];

export default function OrdersScreen() {
  const handleAccept = (order) => {
    Alert.alert(
      "Accept Order",
      `Do you want to accept ${order.id}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Accept",
          onPress: () => {
            Alert.alert(
              "Demo",
              "Order acceptance API is not connected yet."
            );
          },
        },
      ]
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
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-back"
            size={25}
            color={COLORS.white}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          New Orders (3)
        </Text>

        <View style={styles.headerRight} />
      </View>

      {/* Orders List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>

            {/* Order ID and Badge */}
            <View style={styles.topRow}>
              <Text style={styles.orderId}>
                {order.id}
              </Text>

              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>
                  New
                </Text>
              </View>
            </View>

            {/* Amount and Items */}
            <View style={styles.amountRow}>
              <Text style={styles.amount}>
                {order.amount}
              </Text>

              <Text style={styles.separator}> • </Text>

              <Text style={styles.itemCount}>
                {order.items}
              </Text>
            </View>

            {/* Restaurant Details */}
            <View style={styles.restaurantRow}>
              <Ionicons
                name="location"
                size={17}
                color={COLORS.red}
              />

              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>
                  {order.restaurant}
                </Text>

                <Text style={styles.address}>
                  {order.address}
                </Text>
              </View>
            </View>

            {/* Distance and Delivery Time */}
            <View style={styles.deliveryInfo}>
              <Ionicons
                name="arrow-down"
                size={19}
                color={COLORS.red}
              />

              <Ionicons
                name="location"
                size={15}
                color={COLORS.gray}
              />

              <Text style={styles.deliveryText}>
                {order.distance}
              </Text>

              <Text style={styles.separator}> • </Text>

              <Text style={styles.deliveryText}>
                Est. {order.time}
              </Text>
            </View>

            {/* Accept Button */}
            <TouchableOpacity
              style={styles.acceptButton}
              activeOpacity={0.8}
              onPress={() => router.push("/OrderDetails")}
            >
              <Text style={styles.acceptButtonText}>
                Accept
              </Text>
            </TouchableOpacity>
          </View>
        ))}
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
    height: 70,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
  },

  backButton: {
    width: 35,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: "700",
    textAlign: "center",
  },

  headerRight: {
    width: 35,
  },

  // Orders List
  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 5,
    paddingBottom: 25,
  },

  // Order Card
  orderCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 10,
    paddingTop: 20,
    paddingBottom: 15,
    marginBottom: 19,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
  },

  orderId: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "700",
  },

  newBadge: {
    backgroundColor: COLORS.red,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 3,
    minWidth: 32,
    alignItems: "center",
  },

  newBadgeText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },

  // Amount
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 7,
  },

  amount: {
    color: COLORS.gold,
    fontSize: 12,
    fontWeight: "800",
  },

  separator: {
    color: COLORS.gray,
    fontSize: 19,
  },

  itemCount: {
    color: COLORS.gray,
    fontSize: 17,
    fontWeight: "500",
  },

  // Restaurant
  restaurantRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },

  restaurantInfo: {
    marginLeft: 5,
    flex: 1,
  },

  restaurantName: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: "600",
  },

  address: {
    color: COLORS.gray,
    fontSize: 17,
    marginTop: 2,
  },

  // Distance
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    paddingLeft: 1,
  },

  deliveryText: {
    color: "#D0D0D0",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 3,
  },

  // Accept Button
  acceptButton: {
    height: 40,
    width: "80%",
    backgroundColor: COLORS.red,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },

  acceptButtonText: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "700",
  },
});
