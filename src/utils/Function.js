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


// GET DELIVERY PARTNER PROFILE API
export const getDeliveryProfile = async () => {
  try {
    const response = await getMethod("api/delivery/profile");

    console.log(
      "DELIVERY PROFILE API RESPONSE:",
      JSON.stringify(response, null, 2)
    );

    return response;
  } catch (error) {
    console.log(
      "DELIVERY PROFILE API ERROR:",
      error.response?.data || error.message
    );

    return {
      success: 0,
      message:
        error.response?.data?.message ||
        error.message ||
        "Unable to fetch profile details",
    };
  }
};

export const updateBankDetails = async (payload) => {
  try {
    const response = await postMethod(
      "api/delivery/bank-details/update",
      payload
    );

    return response;
  } catch (error) {
    console.log(
      "UPDATE BANK DETAILS ERROR:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const uploadDeliveryDocument = async (file, documentType) => {
  try {
    const formData = new FormData();

    formData.append("file", {
      uri: file.uri,
      name: file.name || "document.pdf",
      type: file.mimeType || "application/pdf",
    });

    formData.append("document_type", documentType);

    const response = await postMethod(
      "api/delivery/documents/upload",
      formData
    );

    return response;
  } catch (error) {
    console.log(
      "DOCUMENT UPLOAD ERROR:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// UPDATE VEHICLE DETAILS
// POST: api/delivery/vehicle-details/update

export const updateVehicleDetails = async (payload) => {
  try {
    console.log("========== UPDATE VEHICLE DETAILS ==========");
    console.log("REQUEST:", JSON.stringify(payload, null, 2));

    const response = await postMethod(
      "api/delivery/vehicle-details/update",
      payload
    );

    console.log("VEHICLE DETAILS RESPONSE:", JSON.stringify(response, null, 2));
    console.log("============================================");

    return response;
  } catch (error) {
    console.log("UPDATE VEHICLE DETAILS ERROR:", error);

    return {
      status: false,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Unable to update vehicle details.",
    };
  }
};

export const logout = async () => {
  console.log("========== DELIVERY LOGOUT START ==========");

  const response = await postMethod("/api/delivery/logout", {});

  console.log(
    "DELIVERY LOGOUT RESPONSE:",
    JSON.stringify(response, null, 2)
  );

  if (response?.status !== true && response?.status !== 1) {
    throw new Error(response?.message || "Logout failed.");
  }

  return response;
};
