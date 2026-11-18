import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMethod, postMethod } from "./APIServices";

export const TOKEN_KEY = "bakasuran_token";

// SAVE TOKEN
export const saveToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.log("Save Token Error:", error);
    return false;
  }
};

// GET TOKEN
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.log("Get Token Error:", error);
    return null;
  }
};

// REMOVE TOKEN
export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return true;
  } catch (error) {
    console.log("Remove Token Error:", error);
    return false;
  }
};

// DELIVERY LOGIN API
export const deliveryLogin = async (mobile) => {
  return await postMethod("/api/delivery/login", {
    mobile,
  });
};

// VERIFY OTP API
export const verifyDeliveryOtp = async (mobile, otp) => {
  return await postMethod("/api/delivery/verify-otp", {
    mobile,
    otp,
  });
};

// DELIVERY LOGOUT API
export const deliveryLogout = async () => {
  return await postMethod("/api/delivery/logout", {});
};

export const getDeliveryHome = async () => {
  try {
    const response = await getMethod("/api/delivery/home");
    return response;
  } catch (error) {
    console.log("Delivery Home API:", error);
    return {
      success: 0,
      messege: "unable to load dashboard",
    };
  }
};
// Get New Orders API
export const getNewOrders = async () => {
  return await getMethod("/api/delivery/new-orders");
};
export const acceptOrder = async (orderId) => {
  return await postMethod(`/api/delivery/orders/${orderId}/accept`, {});
};
export const getOrderDetails = async (orderId) => {
  return await getMethod(`/api/delivery/orders/${orderId}/details`);
};
export const pickupOrder = async (orderId, pickupOtp) => {
  return await postMethod(`/api/delivery/orders/${orderId}/pickup`, {
    pickup_otp: pickupOtp,
  });
};
export const getDeliveryEarnings = async () => {
  return await getMethod("/api/delivery/earnings");
};
// Today's Earning History
export const getTodayEarningHistory = async () => {
  return await getMethod("/api/delivery/earning-history?period=today");
};

// Weekly Earning History
export const getWeeklyEarningHistory = async () => {
  return await getMethod("/api/delivery/earning-history?period=week");
};

// Monthly Earning History
export const getMonthlyEarningHistory = async () => {
  return await getMethod("/api/delivery/earning-history?period=month");
};
