
import { getMethod } from "./APIServices";

import {
  DELIVERY_HOME_API,
} from "../constants/AppUrls";

export const getDeliveryHome = async () => {
  try {
    console.log("DELIVERY HOME API:", DELIVERY_HOME_API);

    const response = await getMethod(DELIVERY_HOME_API);

    console.log("DELIVERY HOME RESPONSE:", response);

    return response;
  } catch (error) {
    console.log("GET DELIVERY HOME ERROR:", error.message);
    throw error;
  }
};
