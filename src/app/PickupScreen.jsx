
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Svg, {
  Path,
  Circle,
} from "react-native-svg";

const COLORS = {
  background: "#050505",
  map: "#17191A",
  road: "#292C2D",
  roadLight: "#343738",
  red: "#F9080C",
  white: "#FFFFFF",
  gray: "#BDBDBD",
  yellow: "#F5E36B",
  card: "#111111",
};

export default function NavigateToPickupScreen() {
  const handleNavigation = () => {
    // Add live map navigation functionality here.
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
            size={24}
            color={COLORS.white}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Navigate to Pickup
        </Text>

        <View style={styles.headerRight} />
      </View>

      {/* MAP CONTAINER */}
      <View style={styles.mapContainer}>

        {/* Background Roads + Continuous Route */}
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 360 640"
          preserveAspectRatio="none"
          style={styles.mapSvg}
        >

          {/* Background Road Pattern */}
          <Path
            d="
              M-50 40 L410 390
              M-60 125 L410 475
              M-60 225 L410 575
              M-50 330 L360 650
              M20 -30 L-30 680
              M100 -30 L30 680
              M180 -30 L110 680
              M260 -30 L190 680
              M340 -30 L270 680
              M420 -30 L350 680
            "
            stroke={COLORS.road}
            strokeWidth="17"
            fill="none"
          />

          {/* Smaller Road Lines */}
          <Path
            d="
              M-40 90 L400 440
              M-40 185 L400 535
              M-40 285 L360 605
              M50 -20 L-10 650
              M145 -20 L75 650
              M240 -20 L165 650
              M335 -20 L255 650
            "
            stroke={COLORS.roadLight}
            strokeWidth="3"
            fill="none"
          />

          {/* Continuous Red Tracking Route */}
          <Path
            d="
              M82 430
              L170 350
              L145 240
              L280 165
            "
            stroke={COLORS.red}
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          {/* Destination Red Location Pin */}
          <Path
            d="
              M280 165
              C280 165 261 141 261 126
              C261 115 269 106 280 106
              C291 106 299 115 299 126
              C299 141 280 165 280 165 Z
            "
            fill={COLORS.red}
          />

          {/* White Center of Destination Pin */}
          <Circle
            cx="280"
            cy="126"
            r="6"
            fill={COLORS.white}
          />

        </Svg>

        {/* Rider Location Marker */}
        <View style={styles.riderMarker}>
          <Ionicons
            name="navigate"
            size={19}
            color={COLORS.white}
          />
        </View>

        {/* Bottom Restaurant Information Card */}
        <View style={styles.restaurantCard}>

          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>
              Biryani House
            </Text>

            <Text style={styles.restaurantAddress}>
              Madhapur, Hyderabad
            </Text>

            <Text style={styles.distanceText}>
              4.5 km · 15 mins
            </Text>
          </View>

          <TouchableOpacity
            style={styles.navigationButton}
            activeOpacity={0.8}
            onPress={handleNavigation}
          >
            <Ionicons
              name="navigate"
              size={19}
              color={COLORS.white}
            />
          </TouchableOpacity>

        </View>

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
    height: 73,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
    zIndex: 2,
  },

  backButton: {
    width: 32,
    height: 38,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  headerTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "700",
  },

  headerRight: {
    width: 32,
  },

  // Map
  mapContainer: {
    flex: 1,
    backgroundColor: COLORS.map,
    position: "relative",
    overflow: "hidden",
  },

  mapSvg: {
    ...StyleSheet.absoluteFillObject,
  },

  // Rider Marker
  riderMarker: {
    position: "absolute",
    left: "18%",
    top: "65.5%",
    width: 27,
    height: 27,
    borderRadius: 15,
    backgroundColor: COLORS.red,
    borderWidth: 2,
    borderColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
    transform: [
      { rotate: "-35deg" },
    ],
  },

  // Restaurant Information Card
  restaurantCard: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 40,
    height: 85,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: "#383838",
    borderRadius: 20,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },

  restaurantInfo: {
    flex: 1,
    justifyContent: "center",
  },

  restaurantName: {
    color: COLORS.white,
    fontSize: 21,
    fontWeight: "700",
    marginBottom: 2,
  },

  restaurantAddress: {
    color: COLORS.gray,
    fontSize: 18,
    marginBottom: 3,
  },

  distanceText: {
    color: COLORS.yellow,
    fontSize: 15,
    fontWeight: "700",
  },

  navigationButton: {
    width: 25,
    height: 25,
    borderRadius: 14,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
  },

});
