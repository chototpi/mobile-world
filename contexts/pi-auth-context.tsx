"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { PI_NETWORK_CONFIG } from "@/lib/system-config";
import { piService } from "@/lib/pi-service";
import type {
  Product,
  SDKLiteInstance,
  UserPurchaseBalance,
} from "@/lib/sdklite-types";

interface PiAuthContextType {
  isAuthenticated: boolean;
  authMessage: string;
  hasError: boolean;
  sdk: SDKLiteInstance | null;
  products: Product[] | null;
  restoredPurchases: UserPurchaseBalance[] | null;
  username: string | null;
  reinitialize: () => Promise<void>;
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

// Currently unused while the payment flow is disabled (see initialize()).
const loadSDKLite = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window.SDKLite !== "undefined") {
      resolve();
      return;
    }

    const script = document.createElement("script");
    if (!PI_NETWORK_CONFIG.SDK_LITE_URL) {
      reject(new Error("SDKLite URL is not set"));
      return;
    }
    script.src = PI_NETWORK_CONFIG.SDK_LITE_URL;
    script.async = true;

    script.onload = () => {
      console.log("SDKLite script loaded successfully");
      resolve();
    };

    script.onerror = () => {
      console.error("Failed to load SDKLite script");
      reject(new Error("Failed to load SDKLite script"));
    };

    document.head.appendChild(script);
  });
};

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMessage, setAuthMessage] = useState("Initializing Pi Network...");
  const [hasError, setHasError] = useState(false);
  const [sdk, setSdk] = useState<SDKLiteInstance | null>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [restoredPurchases, setRestoredPurchases] = useState<
    UserPurchaseBalance[] | null
  >(null);
  const [username, setUsername] = useState<string | null>(null);

  // Currently unused while the payment flow is disabled (see initialize()).
  // Kept so it's a one-line change to wire back in when payments return.
  const fetchProducts = async (sdkInstance: SDKLiteInstance): Promise<void> => {
    try {
      const { products } = await sdkInstance.state.products();
      setProducts(products);
    } catch (e) {
      console.error("Failed to load products:", e);
      setProducts([]);
    }
  };

  const initialize = async () => {
    console.log("[v0] Initialize called");
    setHasError(false);
    setRestoredPurchases(null);
    try {
      // Call Service: piService.login() handles loading the Pi SDK,
      // awaiting Pi.init() fully as a Promise, then calling
      // Pi.authenticate() with the given scopes. "payments" flow is
      // disabled app-wide right now, so only request "username".
      setAuthMessage("Authenticating with Pi...");
      console.log("[v0] Calling piService.login()");
      const loginResult = await piService.login(["username"]);

      if (!loginResult.success || !loginResult.accessToken) {
        throw new Error(loginResult.error || "Authentication failed");
      }

      // Token Exchange: send the accessToken to our backend, which calls
      // GET https://api.minepi.com/v2/me with it and only reports success
      // once Pi confirms the token is valid. The session is only
      // established after that server-side check passes.
      setAuthMessage("Verifying with server...");
      console.log("[v0] Verifying access token with backend");
      const verifyResult = await piService.verifyWithBackend(loginResult.accessToken);

      if (!verifyResult.success || !verifyResult.user) {
        throw new Error(verifyResult.error || "Server rejected Pi access token");
      }

      // UI Update: transition from "Guest" to "User" state using the
      // server-verified username as the source of truth.
      const piUsername = verifyResult.user.username;
      console.log("[v0] Backend verified user:", verifyResult.user);
      setUsername(piUsername);
      localStorage.setItem('pi_username', piUsername);
      localStorage.setItem('uid', verifyResult.user.uid);
      localStorage.setItem('accessToken', loginResult.accessToken);

      // Payment flow disabled for now: no SDKLite load/init, no product
      // fetch, no purchase restore. sdk/products/restoredPurchases stay at
      // their initial null values so pages that read them (buy-now-button,
      // checkout, etc.) fall back to empty state instead of crashing.
      console.log("[v0] Login-only flow complete (payments disabled)");
      setIsAuthenticated(true);
    } catch (err) {
      console.error("[v0] Pi authentication failed:", err);
      setHasError(true);
      setAuthMessage(
        err instanceof Error
          ? err.message
          : "Authentication failed. Please try again.",
      );
    }
  };

  useEffect(() => {
    // Try to restore username from localStorage
    const savedUsername = localStorage.getItem('pi_username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
    initialize();
  }, []);

  const value: PiAuthContextType = {
    isAuthenticated,
    authMessage,
    hasError,
    sdk,
    products,
    restoredPurchases,
    username,
    reinitialize: initialize,
  };

  return (
    <PiAuthContext.Provider value={value}>{children}</PiAuthContext.Provider>
  );
}

export function usePiAuth() {
  const context = useContext(PiAuthContext);
  if (context === undefined) {
    throw new Error("usePiAuth must be used within a PiAuthProvider");
  }
  return context;
}
