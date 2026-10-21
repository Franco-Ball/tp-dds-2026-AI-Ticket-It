import { Platform } from "react-native";

// En emulador de Android, localhost es 10.0.2.2. En web e iOS es localhost.
const DEFAULT_HOST = Platform.OS === "android" ? "http://10.0.2.2:8000/api" : "http://localhost:8000/api";

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_HOST;

export const ROL_USUARIO = Object.freeze({
  COMPRADOR: "COMPRADOR",
  ORGANIZADOR: "ORGANIZADOR",
});
