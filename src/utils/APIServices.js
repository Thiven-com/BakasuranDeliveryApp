
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

import {
  BASE_URL,
  TOKEN_KEY,
} from "../constants/AppUrls";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem(TOKEN_KEY);

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getMethod = async (endpoint, config = {}) => {
  try {
    if (!endpoint) {
      throw new Error("API endpoint is undefined. Check AppUrls.js");
    }

    console.log("API BASE URL:", BASE_URL);
    console.log("API ENDPOINT:", endpoint);
    console.log("FULL API URL:", `${BASE_URL}${endpoint}`);

    const headers = await getAuthHeaders();

    const response = await apiClient.get(endpoint, {
      ...config,
      headers: {
        ...headers,
        ...(config.headers || {}),
      },
    });

    console.log("GET API SUCCESS:", response.data);

    return response.data;
  } catch (error) {
    console.log("GET API ERROR:", {
      message: error.message,
      status: error.response?.status,
      response: error.response?.data,
    });

    throw error;
  }
};

export const postMethod = async (endpoint, payload = {}) => {
  try {
    const headers = await getAuthHeaders();

    const response = await apiClient.post(endpoint, payload, {
      headers,
    });

    return response.data;
  } catch (error) {
    console.log("POST API ERROR:", error.response?.data || error.message);
    throw error;
  }
};

export const saveDeliveryToken = async (token) => {
  if (!token) {
    throw new Error("Token is missing");
  }

  await AsyncStorage.setItem(TOKEN_KEY, String(token));
};

export const clearDeliveryToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

export default apiClient;
