
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from "../constants/AppUrls";

// =====================================================
// CONFIGURATION
// =====================================================

export const TOKEN_KEY = "bakasuran_token";

const REQUEST_TIMEOUT = 30000;

const API_BASE_URL = String(BASE_URL || "").replace(/\/+$/, "");

// =====================================================
// BUILD API URL
// =====================================================

const buildUrl = (endpoint = "") => {
  if (!endpoint) {
    throw new Error("API endpoint is required.");
  }

  const value = String(endpoint).trim();

  // Already a complete URL
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // Remove leading slashes
  const cleanEndpoint = value.replace(/^\/+/, "");

  if (!API_BASE_URL) {
    throw new Error("BASE_URL is missing in AppUrls.");
  }

  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// =====================================================
// BUILD HEADERS
// =====================================================

const buildHeaders = async (isMultipart = false) => {
  const headers = {
    Accept: "application/json",
  };

  const token = await AsyncStorage.getItem(TOKEN_KEY);

  if (token) {
    headers.Authorization = `Bearer ${token.trim()}`;
  }

  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }

  console.log("AUTH TOKEN:", token ? "TOKEN FOUND" : "TOKEN NOT FOUND");

  return headers;
};

// =====================================================
// COMMON ERROR HANDLER
// =====================================================

const handleApiError = (error, method) => {
  console.log("====================================");
  console.log(`${method} API ERROR`);
  console.log("MESSAGE:", error?.message);

  if (error?.response) {
    console.log("HTTP STATUS:", error.response.status);
    console.log(
      "SERVER RESPONSE:",
      JSON.stringify(error.response.data, null, 2)
    );

    const responseData = error.response.data;

    return {
      ...(responseData && typeof responseData === "object"
        ? responseData
        : {}),
      success: 0,
      status: false,
      httpStatus: error.response.status,
      message:
        responseData?.message ||
        `Request failed with status ${error.response.status}.`,
    };
  }

  if (error?.request) {
    console.log("NO RESPONSE RECEIVED FROM SERVER");
    console.log("CHECK NETWORK / SERVER / BASE URL");
    console.log("REQUEST URL:", error?.config?.url);
    console.log("REQUEST METHOD:", error?.config?.method);

    return {
      success: 0,
      status: false,
      httpStatus: 0,
      message:
        "No response from server. Check your network connection and API server.",
    };
  }

  return {
    success: 0,
    status: false,
    httpStatus: 0,
    message: error?.message || "Unable to complete request.",
  };
};

// =====================================================
// POST METHOD
// Supports JSON and FormData
// =====================================================

export const postMethod = async (
  endpoint,
  userOrData = null,
  optionalData = undefined
) => {
  console.log("========== POST METHOD START ==========");

  try {
    const url = buildUrl(endpoint);

    const data =
      optionalData !== undefined
        ? optionalData || {}
        : userOrData || {};

    const isMultipart =
      typeof FormData !== "undefined" && data instanceof FormData;

    const headers = await buildHeaders(isMultipart);

    console.log("POST API REQUEST");
    console.log("FINAL URL:", url);
    console.log("REQUEST TYPE:", isMultipart ? "MULTIPART" : "JSON");

    if (!isMultipart) {
      console.log("REQUEST BODY:", JSON.stringify(data, null, 2));
    }

    const response = await axios.post(url, data, {
      headers,
      timeout: REQUEST_TIMEOUT,
    });

    console.log("========== POST API SUCCESS ==========");
    console.log("HTTP STATUS:", response.status);
    console.log(
      "RESPONSE DATA:",
      JSON.stringify(response.data, null, 2)
    );

    return {
      ...(response.data &&
      typeof response.data === "object"
        ? response.data
        : {}),
      httpStatus: response.status,
    };
  } catch (error) {
    return handleApiError(error, "POST");
  } finally {
    console.log("========== POST METHOD END ==========");
  }
};

// =====================================================
// GET METHOD
// =====================================================

export const getMethod = async (endpoint) => {
  try {
    const url = buildUrl(endpoint);
    const headers = await buildHeaders(false);

    console.log("GET API REQUEST:", url);

    const response = await axios.get(url, {
      headers,
      timeout: REQUEST_TIMEOUT,
    });

    console.log("GET API SUCCESS:", response.status);
    console.log("GET RESPONSE:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    return handleApiError(error, "GET");
  }
};

// =====================================================
// PUT METHOD
// =====================================================

export const putMethod = async (endpoint, data = {}) => {
  try {
    const url = buildUrl(endpoint);
    const headers = await buildHeaders(false);

    console.log("PUT API REQUEST:", url);

    const response = await axios.put(url, data, {
      headers,
      timeout: REQUEST_TIMEOUT,
    });

    console.log("PUT API SUCCESS:", response.status);

    return response.data;
  } catch (error) {
    return handleApiError(error, "PUT");
  }
};

// =====================================================
// PATCH METHOD
// =====================================================

export const patchMethod = async (endpoint, data = {}) => {
  try {
    const url = buildUrl(endpoint);
    const headers = await buildHeaders(false);

    console.log("PATCH API REQUEST:", url);

    const response = await axios.patch(url, data, {
      headers,
      timeout: REQUEST_TIMEOUT,
    });

    console.log("PATCH API SUCCESS:", response.status);

    return response.data;
  } catch (error) {
    return handleApiError(error, "PATCH");
  }
};

// =====================================================
// DELETE METHOD
// =====================================================

export const deleteMethod = async (endpoint) => {
  try {
    const url = buildUrl(endpoint);
    const headers = await buildHeaders(false);

    console.log("DELETE API REQUEST:", url);

    const response = await axios.delete(url, {
      headers,
      timeout: REQUEST_TIMEOUT,
    });

    console.log("DELETE API SUCCESS:", response.status);

    return {
      success: 1,
      status: response.status,
      message: response.data?.message || "Deleted successfully.",
      data: response.data?.data ?? response.data,
    };
  } catch (error) {
    return handleApiError(error, "DELETE");
  }
};
