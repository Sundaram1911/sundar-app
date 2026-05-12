// src/config/env.ts

/**
 * 🛠️ CENTRAL API CONFIGURATION
 * 
 * For Real Devices: Use your machine's IP address (e.g., 192.168.0.103)
 * For Simulator: Use 'localhost' or your machine's IP address
 */
export const API_IP = "localhost"; // <-- CHANGE THIS WHEN YOUR IP CHANGES
export const PORT = "3000";

export const BASE_URL = `http://${API_IP}:${PORT}`;
export const API_URL = `${BASE_URL}/api`;
export const MEDIA_URL = `${BASE_URL}/media-files-storage`;
