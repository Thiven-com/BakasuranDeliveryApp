
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
  cardBorder: "#242424",
  red: "#F9080C",
  redDark: "#B80000",
  white: "#FFFFFF",
  gray: "#B8B8B8",
  gold: "#F5B51B",
};

export default function EarningsScreen() {
  const stats = [
    {
      title: "Orders",
      value: "12",
      icon: "gift-outline",
      color: COLORS.gold,
    },
    {
      title: "Incentives",
      value: "₹700",
      icon: "trophy",
      color: COLORS.gold,
    },
    {
      title: "Total",
      value: "₹1,340",
      icon: "wallet-outline",
      color: COLORS.white,
    },
  ];

  const handleWithdraw = () => {
    Alert.alert(
      "Withdraw Earnings",
      "Withdrawal functionality will be connected to the backend."
    );
  };

  const handleWeeklyDetails = () => {
    Alert.alert(
      "Weekly Earnings",
      "Weekly earnings details will be available here."
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.background}
      />

      

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={COLORS.white}
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>My Earnings</Text>

          <View style={styles.headerRight} />
        </View>

        {/* Today's Earnings */}
        <View style={styles.todayCard}>
          <Text style={styles.todayLabel}>
            Today's Earnings
          </Text>

          <Text style={styles.todayAmount}>
            ₹1,240
          </Text>
        </View>

        {/* Earnings Statistics */}
        <View style={styles.statsContainer}>
          {stats.map((item, index) => (
            <View key={index} style={styles.statCard}>
              <Ionicons
                name={item.icon}
                size={23}
                color={item.color}
              />

              <Text style={styles.statTitle}>
                {item.title}
              </Text>

              <Text style={styles.statValue}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Withdraw Button */}
        <TouchableOpacity
          style={styles.withdrawButton}
          activeOpacity={0.8}
          onPress={handleWithdraw}
        >
          <Text style={styles.withdrawText}>
            Withdraw Earnings
          </Text>
        </TouchableOpacity>

          {/* Weekly Earnings */}
         <TouchableOpacity
              style={styles.weekCard}
            activeOpacity={0.8}
           onPress={() => router.push("/EarningHistoryScreen")}
          >
            <View>
           <Text style={styles.weekLabel}>
             This Week
           </Text>

            <Text style={styles.weekAmount}>
                ₹8,560
             </Text>
               </View>

                  <Ionicons
                   name="chevron-forward"
                   size={22}
                   color={COLORS.white}
                    />
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
