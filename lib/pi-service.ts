"use client";

import { PI_NETWORK_CONFIG } from "@/lib/system-config";

/**
 * PiService centralizes all communication with the Pi Network SDK so the
 * rest of the app never touches window.Pi directly. This follows the
 * service-wrapper pattern recommended for LLM-driven Pi integrations.
 *
 * Implementation note: this wraps the foundation SDK (window.Pi /
 * https://sdk.minepi.com/pi-sdk.js) rather than the pi-sdk-js /
 * pi-sdk-nextjs helper packages. Those packages exist on GitHub
 * (pi-apps org) but we couldn't confirm they're published as stable npm
 * releases, and their CLI scaffolder rewrites app/layout.tsx and
 * app/api/pi_payment/* in ways that could conflict with this project's
 * existing structure and its already-verified Pi App Studio sign-in flow.
 * Swap the internals of ensureInitialized()/login() for the helper
 * package later if you confirm it installs cleanly — the public API
 * (login, verifyWithBackend) can stay the same for callers.
 */

export interface PiUser {
  uid: string;
  username: string;
}

export interface PiLoginResult {
  success: boolean;
  accessToken?: string;
  user?: PiUser;
  error?: string;
}

export interface PiVerifyResult {
  success: boolean;
  user?: PiUser;
  error?: string;
}

let sdkLoadPromise: Promise<void> | null = null;
let initPromise: Promise<void> | null = null;

function loadPiSdkScript(): Promise<void> {
  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise((resolve, reject) => {
    if (typeof window !== "undefined" && window.Pi) {
      resolve();
      return;
    }
    if (!PI_NETWORK_CONFIG.SDK_URL) {
      reject(new Error("SDK URL is not set"));
      return;
    }

    const script = document.createElement("script");
    script.src = PI_NETWORK_CONFIG.SDK_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Pi SDK script"));
    document.head.appendChild(script);
  });

  return sdkLoadPromise;
}

class PiService {
  user: PiUser | null = null;

  /**
   * Loads the Pi SDK script (if needed) and runs Pi.init() as a Promise,
   * awaited fully before any authenticate() call. Cached so repeated
   * login() calls don't re-init.
   */
  private async ensureInitialized(): Promise<void> {
    await loadPiSdkScript();
    if (!initPromise) {
      initPromise = Promise.resolve(
        window.Pi.init({
          version: "2.0",
          sandbox: PI_NETWORK_CONFIG.SANDBOX,
        })
      );
    }
    await initPromise;
  }

  /**
   * Required callback for the Pi SDK. Handles payments that were
   * interrupted before completion.
   */
  private onIncompletePaymentFound(payment: any) {
    console.warn("[PiService] Incomplete payment found:", payment?.identifier);
    // Payments flow is currently disabled app-wide — nothing to resolve.
  }

  /**
   * Authenticates the user and requests specific data scopes.
   * Defaults to ['username']. Don't pass 'payments' unless you've
   * re-enabled the payment flow (see contexts/pi-auth-context.tsx).
   */
  async login(scopes: string[] = ["username"]): Promise<PiLoginResult> {
    try {
      await this.ensureInitialized();

      const auth = await window.Pi.authenticate(
        scopes,
        this.onIncompletePaymentFound
      );

      if (!auth?.user || !auth?.accessToken) {
        throw new Error("Authentication failed - no user data");
      }

      this.user = auth.user;
      console.log(`[PiService] Authenticated as ${this.user.username}`);

      return {
        success: true,
        accessToken: auth.accessToken,
        user: auth.user,
      };
    } catch (error) {
      console.error("[PiService] Authentication Error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Authentication failed",
      };
    }
  }

  /**
   * Token exchange: sends the accessToken to our backend, which calls
   * GET https://api.minepi.com/v2/me with it and only reports success
   * once Pi confirms the token is valid. Treat this as the source of
   * truth for the signed-in identity, not the client-reported user.
   */
  async verifyWithBackend(accessToken: string): Promise<PiVerifyResult> {
    try {
      const res = await fetch("/api/pi-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: accessToken }),
      });

      if (!res.ok) {
        return { success: false, error: "Server could not verify Pi access token" };
      }

      const data = await res.json();
      if (!data.success || !data.user?.username) {
        return { success: false, error: "Server rejected Pi access token" };
      }

      return {
        success: true,
        user: { uid: data.user.uid, username: data.user.username },
      };
    } catch (error) {
      console.error("[PiService] Backend verification error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Verification failed",
      };
    }
  }

  logout() {
    this.user = null;
  }
}

export const piService = new PiService();
