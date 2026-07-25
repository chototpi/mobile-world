"use client";

import { PI_NETWORK_CONFIG } from "@/lib/system-config";

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

const PI_BACKEND_URL =
  "https://pi-backend-zeta.vercel.app";

let sdkLoadPromise: Promise<void> | null = null;
let initPromise: Promise<void> | null = null;


// =====================================================
// LOAD PI SDK
// =====================================================

function loadPiSdkScript(): Promise<void> {

  if (sdkLoadPromise) {
    return sdkLoadPromise;
  }

  sdkLoadPromise = new Promise(
    (resolve, reject) => {

      if (
        typeof window !== "undefined" &&
        window.Pi
      ) {
        resolve();
        return;
      }

      if (!PI_NETWORK_CONFIG.SDK_URL) {
        reject(
          new Error("SDK URL is not set")
        );
        return;
      }

      const existingScript =
        document.querySelector(
          `script[src="${PI_NETWORK_CONFIG.SDK_URL}"]`
        ) as HTMLScriptElement | null;

      if (existingScript) {

        if (window.Pi) {
          resolve();
          return;
        }

        existingScript.addEventListener(
          "load",
          () => resolve(),
          { once: true }
        );

        existingScript.addEventListener(
          "error",
          () =>
            reject(
              new Error(
                "Failed to load Pi SDK script"
              )
            ),
          { once: true }
        );

        return;
      }

      const script =
        document.createElement("script");

      script.src =
        PI_NETWORK_CONFIG.SDK_URL;

      script.async = true;

      script.onload = () => {
        resolve();
      };

      script.onerror = () => {
        reject(
          new Error(
            "Failed to load Pi SDK script"
          )
        );
      };

      document.head.appendChild(script);
    }
  );

  return sdkLoadPromise;
}


// =====================================================
// PI SERVICE
// =====================================================

class PiService {

  user: PiUser | null = null;


  // ===================================================
  // INIT
  // ===================================================

  private async ensureInitialized(): Promise<void> {

    await loadPiSdkScript();

    if (!window.Pi) {
      throw new Error(
        "Pi SDK is not available"
      );
    }

    if (!initPromise) {

      console.log(
        "[PiService] Initializing Pi SDK..."
      );

      initPromise = Promise.resolve(
        window.Pi.init({
          version: "2.0",
          sandbox:
            PI_NETWORK_CONFIG.SANDBOX,
        })
      );
    }

    await initPromise;

    console.log(
      "[PiService] Pi SDK initialized"
    );
  }
  // ===================================================
  // INCOMPLETE PAYMENT
  // ===================================================

  private onIncompletePaymentFound =
    async (payment: any) => {

      try {

        console.warn(
          "[PiService] Incomplete payment found:",
          payment
        );

        const paymentId =
          payment?.identifier;

        if (!paymentId) {

          console.error(
            "[PiService] Incomplete payment has no identifier"
          );

          return;
        }


        // -----------------------------------------------
        // Extract txid if Pi already has a transaction
        // -----------------------------------------------

        const txid =
          payment?.transaction?.txid ||
          null;


        console.log(
          "[PiService] Resolving incomplete payment:",
          {
            paymentId,
            txid,
          }
        );


        // -----------------------------------------------
        // Send to our backend.
        //
        // Backend decides whether it can be completed.
        // Frontend never declares payment successful.
        // -----------------------------------------------

        const response =
          await fetch(
            `${PI_BACKEND_URL}/pi/payments/incomplete`,
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                paymentId,
                txid,
              }),
            }
          );


        const data =
          await response.json();


        if (!response.ok || !data.success) {

          console.error(
            "[PiService] Failed to resolve incomplete payment:",
            data
          );

          return;
        }


        console.log(
          "[PiService] Incomplete payment response:",
          data
        );


        if (
          data.action ===
          "completed"
        ) {

          console.log(
            "[PiService] Incomplete payment completed:",
            paymentId
          );

          return;
        }


        if (
          data.action ===
          "pending"
        ) {

          console.log(
            "[PiService] Payment remains pending:",
            paymentId
          );

        }

      } catch (error) {

        console.error(
          "[PiService] Incomplete payment error:",
          error
        );

      }
    };


  // ===================================================
  // LOGIN
  // ===================================================

  async login(): Promise<PiLoginResult> {

    try {

      // Pi.init MUST finish before authenticate
      await this.ensureInitialized();


      // Payment scope is required for U2A payments
      const scopes = [
        "username",
        "payments",
      ];


      console.log(
        "[PiService] Authenticating with scopes:",
        scopes
      );


      const auth =
        await window.Pi.authenticate(
          scopes,
          this.onIncompletePaymentFound
        );


      if (
        !auth?.user ||
        !auth?.accessToken
      ) {

        throw new Error(
          "Authentication failed - no user data"
        );

      }


      this.user = {
        uid: auth.user.uid,
        username:
          auth.user.username,
      };


      console.log(
        `[PiService] Authenticated as ${this.user.username}`
      );


      return {
        success: true,

        accessToken:
          auth.accessToken,

        user:
          this.user,
      };

    } catch (error) {

      console.error(
        "[PiService] Authentication Error:",
        error
      );


      return {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Authentication failed",
      };

    }
  }


  // ===================================================
  // VERIFY USER WITH BACKEND
  // ===================================================

  async verifyWithBackend(
    accessToken: string
  ): Promise<PiVerifyResult> {

    try {

      const response =
        await fetch(
          "/api/pi-user",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              token: accessToken,
            }),
          }
        );


      if (!response.ok) {

        return {
          success: false,
          error:
            "Server could not verify Pi access token",
        };

      }


      const data =
        await response.json();


      if (
        !data.success ||
        !data.user?.username ||
        !data.user?.uid
      ) {

        return {
          success: false,
          error:
            "Server rejected Pi access token",
        };

      }


      return {
        success: true,

        user: {
          uid:
            data.user.uid,

          username:
            data.user.username,
        },
      };

    } catch (error) {

      console.error(
        "[PiService] Backend verification error:",
        error
      );


      return {
        success: false,

        error:
          error instanceof Error
            ? error.message
            : "Verification failed",
      };

    }
  }


  // ===================================================
  // PUBLIC INIT FOR PAYMENT
  // ===================================================

  async init(): Promise<void> {

    await this.ensureInitialized();

  }


  // ===================================================
  // LOGOUT
  // ===================================================

  logout() {

    this.user = null;

  }
}


export const piService =
  new PiService();