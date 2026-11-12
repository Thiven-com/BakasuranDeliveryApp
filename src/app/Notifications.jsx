import { useMemo, useState } from "react";

import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "../constants/Colors";
import Fonts from "../constants/Fonts";

// Notification data

const initialNotifications = [
  {
    id: "1",
    title: "New Order Assigned",
    message: "Order #BD2846 has been assigned to you.",
    time: "2 min ago",
    category: "Orders",
    group: "Today",
    icon: "cube-outline",
    iconColor: "#F10D16",
    backgroundColor: "#650B12",
    unread: true,
  },
  {
    id: "2",
    title: "Order Delivered",
    message: "Order #BD2839 has been delivered successfully.",
    time: "35 min ago",
    category: "Orders",
    group: "Today",
    icon: "checkmark-circle-outline",
    iconColor: "#00C853",
    backgroundColor: "#075D29",
    unread: false,
  },
  {
    id: "3",
    title: "Payout Credited",
    message: "₹1,250 has been credited to your bank account.",
    time: "1 hr ago",
    category: "Earnings",
    group: "Today",
    icon: "wallet-outline",
    iconColor: "#FFC107",
    backgroundColor: "#715600",
    unread: false,
  },
  {
    id: "4",
    title: "Update: Peak Hours",
    message:
      "High demand expected between 7 PM – 10 PM. Go online to earn more!",
    time: "Yesterday, 6:30 PM",
    category: "Updates",
    group: "Yesterday",
    icon: "megaphone-outline",
    iconColor: "#03A9F4",
    backgroundColor: "#064B70",
    unread: true,
  },
  {
    id: "5",
    title: "Incentive Unlocked",
    message: "You have completed 10 deliveries today. ₹100 incentive added!",
    time: "Yesterday, 4:15 PM",
    category: "Earnings",
    group: "Yesterday",
    icon: "gift-outline",
    iconColor: "#D946EF",
    backgroundColor: "#581078",
    unread: false,
  },
  {
    id: "6",
    title: "Profile Verified",
    message: "Your account and documents have been verified successfully.",
    time: "12 Jan, 11:20 AM",
    category: "Updates",
    group: "Earlier",
    icon: "information-circle-outline",
    iconColor: "#F06292",
    backgroundColor: "#791638",
    unread: false,
  },
  {
    id: "7",
    title: "Vehicle Verification",
    message: "Your vehicle details have been verified.",
    time: "10 Jan, 2:45 PM",
    category: "Updates",
    group: "Earlier",
    icon: "shield-checkmark-outline",
    iconColor: "#00C853",
    backgroundColor: "#075D29",
    unread: false,
  },
];

const FILTERS = ["All", "Orders", "Earnings", "Updates"];

const GROUPS = ["Today", "Yesterday", "Earlier"];

export default function NotificationsScreen() {
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState("All");
  const [notifications, setNotifications] = useState(initialNotifications);

  // Filter notifications

  const filteredNotifications = useMemo(() => {
    if (activeFilter === "All") {
      return notifications;
    }

    return notifications.filter((item) => item.category === activeFilter);
  }, [activeFilter, notifications]);

  // Unread notification count

  const unreadCount = notifications.filter((item) => item.unread).length;

  // Mark individual notification as read

  const handleNotificationPress = (id) => {
    const selectedNotification = notifications.find((item) => item.id === id);

    setNotifications((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, unread: false } : item,
      ),
    );

    // Navigate based on notification category

    if (selectedNotification?.category === "Orders") {
      // Add order details navigation here when available.
    }
  };

  // Mark all notifications as read

  const handleMarkAllRead = () => {
    if (unreadCount === 0) {
      Alert.alert("Notifications", "All notifications are already read.");
      return;
    }

    setNotifications((previous) =>
      previous.map((item) => ({
        ...item,
        unread: false,
      })),
    );
  };

  // Notification card

  const NotificationCard = ({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.notificationCard, item.unread && styles.unreadCard]}
        onPress={() => handleNotificationPress(item.id)}
      >
        {/* Notification icon */}

        <View
          style={[
            styles.notificationIcon,
            { backgroundColor: item.backgroundColor },
          ]}
        >
          <Ionicons name={item.icon} size={34} color={item.iconColor} />
        </View>

        {/* Notification content */}

        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>

          <Text style={styles.notificationMessage}>{item.message}</Text>
        </View>

        {/* Time and unread indicator */}

        <View style={styles.notificationRight}>
          <Text style={styles.notificationTime}>{item.time}</Text>

          {item.unread && <View style={styles.unreadDot} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />

      <LinearGradient
        colors={Colors.gradients.background}
        style={styles.background}
      >
        <View style={styles.container}>
          {/* HEADER */}

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="chevron-back" size={28} color={Colors.white} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>Notifications</Text>

            <View style={styles.headerRight}>
              <Ionicons
                name="notifications-outline"
                size={29}
                color={Colors.primary}
              />

              {unreadCount > 0 && <View style={styles.headerBadge} />}
            </View>
          </View>

          {/* FILTER TABS */}

          <View style={styles.filterContainer}>
            {FILTERS.map((filter) => {
              const isActive = activeFilter === filter;

              return (
                <TouchableOpacity
                  key={filter}
                  activeOpacity={0.8}
                  onPress={() => setActiveFilter(filter)}
                  style={[
                    styles.filterButton,
                    isActive && styles.activeFilterButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      isActive && styles.activeFilterText,
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* NOTIFICATION COUNT */}

          <View style={styles.countContainer}>
            <Text style={styles.notificationCount}>
              {filteredNotifications.length} Notifications
            </Text>

            <TouchableOpacity
              style={styles.markReadButton}
              onPress={handleMarkAllRead}
            >
              <Ionicons name="checkmark" size={23} color={Colors.primary} />

              <Text style={styles.markReadText}>Mark all as read</Text>
            </TouchableOpacity>
          </View>

          {/* NOTIFICATION LIST */}

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          >
            {GROUPS.map((group) => {
              const groupNotifications = filteredNotifications.filter(
                (item) => item.group === group,
              );

              if (groupNotifications.length === 0) {
                return null;
              }

              return (
                <View key={group}>
                  {/* GROUP HEADER */}

                  <LinearGradient
                    colors={["#260606", "#100303"]}
                    style={styles.groupHeader}
                  >
                    <Text style={styles.groupTitle}>{group}</Text>
                  </LinearGradient>

                  {/* GROUP NOTIFICATIONS */}

                  <View style={styles.groupContent}>
                    {groupNotifications.map((item) => (
                      <NotificationCard key={item.id} item={item} />
                    ))}
                  </View>
                </View>
              );
            })}

            {/* EMPTY STATE */}

            {filteredNotifications.length === 0 && (
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="notifications-off-outline"
                  size={65}
                  color={Colors.textMuted}
                />

                <Text style={styles.emptyTitle}>No Notifications</Text>

                <Text style={styles.emptyMessage}>
                  You don't have any {activeFilter.toLowerCase()} notifications.
                </Text>
              </View>
            )}

            {/* FOOTER */}

            <Text style={styles.footerText}>BAKASURAN DELIVERY PARTNER</Text>
          </ScrollView>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  background: {
    flex: 1,
  },

  container: {
    flex: 1,
  },

  // HEADER

  header: {
    height: 65,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },

  backButton: {
    width: 40,
    alignItems: "flex-start",
  },

  headerTitle: {
    color: Colors.white,
    fontSize: 21,
    fontFamily: Fonts.extraBold,
  },

  headerRight: {
    width: 40,
    alignItems: "flex-end",
    position: "relative",
  },

  headerBadge: {
    position: "absolute",
    top: 0,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    borderWidth: 1,
    borderColor: Colors.background,
  },

  // FILTERS

  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 15,
    marginBottom: 25,
  },

  filterButton: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 5,
  },

  activeFilterButton: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  filterText: {
    color: Colors.white,
    fontSize: 13,
    fontFamily: Fonts.semiBold,
  },

  activeFilterText: {
    color: Colors.white,
    fontFamily: Fonts.bold,
  },

  // COUNT

  countContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 22,
  },

  notificationCount: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },

  markReadButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  markReadText: {
    color: Colors.primary,
    fontSize: 13,
    fontFamily: Fonts.semiBold,
  },

  // LIST

  listContent: {
    paddingBottom: 30,
  },

  groupHeader: {
    height: 62,
    justifyContent: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
  },

  groupTitle: {
    color: Colors.white,
    fontSize: 21,
    fontFamily: Fonts.bold,
  },

  groupContent: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 18,
  },

  // NOTIFICATION CARD

  notificationCard: {
    minHeight: 112,
    backgroundColor: Colors.backgroundLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  unreadCard: {
    backgroundColor: "#190B0D",
    borderColor: "#702027",
  },

  notificationIcon: {
    width: 66,
    height: 66,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },

  notificationContent: {
    flex: 1,
    justifyContent: "center",
  },

  notificationTitle: {
    color: Colors.white,
    fontSize: 15,
    fontFamily: Fonts.bold,
    marginBottom: 5,
  },

  notificationMessage: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontFamily: Fonts.regular,
    lineHeight: 20,
  },

  notificationRight: {
    alignSelf: "flex-start",
    alignItems: "flex-end",
    gap: 12,
    minWidth: 12,
  },

  notificationTime: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontFamily: Fonts.medium,
  },

  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },

  // EMPTY STATE

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
    paddingHorizontal: 30,
  },

  emptyTitle: {
    color: Colors.white,
    fontSize: 20,
    fontFamily: Fonts.bold,
    marginTop: 20,
  },

  emptyMessage: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontFamily: Fonts.regular,
    textAlign: "center",
    marginTop: 8,
  },

  // FOOTER

  footerText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontFamily: Fonts.bold,
    letterSpacing: 1.5,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 15,
  },
});
