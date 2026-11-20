import { useEffect } from "react";

import {
  ActivityIndicator,
  Image,
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import Colors from "../../constants/Colors";
import Fonts from "../../constants/Fonts";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/LogInScreen");
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <ImageBackground
      source={require("../../../assets/images/bike.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" backgroundColor="#080808" />

      <SafeAreaView style={styles.container}>
        {/* LOGO SECTION */}

        <View style={styles.logoContainer}>
          <Image
            source={require("../../../assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.partnerText}>Delivery Partner</Text>
        </View>

        {/* BOTTOM SECTION */}

        <View style={styles.bottomContainer}>
          <Text style={styles.tagline}>Delivering to Your Village</Text>

          <ActivityIndicator
            size="small"
            color="#FF101A"
            style={styles.loader}
          />

          <View style={styles.progressBackground}>
            <View style={styles.progressFill} />
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#080808",
  },

  container: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },

  logoContainer: {
    alignItems: "center",
    marginTop: 35,
  },

  logo: {
    width: 240,
    height: 140,
  },

  partnerText: {
    color: Colors.white,
    fontSize: 23,
    fontFamily: Fonts.extraBold,
    fontStyle: "italic",
    marginTop: 5,
  },

  bottomContainer: {
    width: "100%",
    alignItems: "center",
    paddingBottom: 35,
  },

  tagline: {
    color: Colors.white,
    fontSize: 19,
    fontFamily: Fonts.bold,
    fontStyle: "italic",
    marginBottom: 20,
  },

  loader: {
    marginBottom: 12,
  },

  progressBackground: {
    width: 90,
    height: 5,
    backgroundColor: "#555555",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    width: "65%",
    height: "100%",
    backgroundColor: "#FF101A",
    borderRadius: 10,
  },
});
