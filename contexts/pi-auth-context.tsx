"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { piService } from "@/lib/pi-service";


// =====================================================
// TYPES
// =====================================================

interface PiAuthContextType {
  isAuthenticated: boolean;
  isInitializing: boolean;

  authMessage: string;
  hasError: boolean;

  username: string | null;
  uid: string | null;
  accessToken: string | null;

  reinitialize: () => Promise<void>;
}


// =====================================================
// CONTEXT
// =====================================================

const PiAuthContext =
  createContext<PiAuthContextType | undefined>(
    undefined
  );


// =====================================================
// PROVIDER
// =====================================================

export function PiAuthProvider({
  children,
}: {
  children: ReactNode;
}) {

  const [
    isAuthenticated,
    setIsAuthenticated,
  ] = useState(false);

  const [
    isInitializing,
    setIsInitializing,
  ] = useState(true);

  const [
    authMessage,
    setAuthMessage,
  ] = useState(
    "Initializing Pi Network..."
  );

  const [
    hasError,
    setHasError,
  ] = useState(false);

  const [
    username,
    setUsername,
  ] = useState<string | null>(null);

  const [
    uid,
    setUid,
  ] = useState<string | null>(null);

  const [
    accessToken,
    setAccessToken,
  ] = useState<string | null>(null);


  // ===================================================
  // INITIALIZE PI AUTH
  // ===================================================

  const initialize = async () => {

    console.log(
      "[PiAuth] Initialize"
    );

    setIsInitializing(true);
    setHasError(false);

    setAuthMessage(
      "Connecting to Pi Network..."
    );


    try {

      // ===============================================
      // 1. PI INIT + AUTHENTICATE
      //
      // piService.login() performs:
      //
      // await Pi.init(...)
      //
      // then:
      //
      // Pi.authenticate(
      //   ["username", "payments"],
      //   onIncompletePaymentFound
      // )
      // ===============================================

      console.log(
        "[PiAuth] Authenticating..."
      );

      setAuthMessage(
        "Authenticating with Pi..."
      );


      const loginResult =
        await piService.login();


      if (
        !loginResult.success ||
        !loginResult.accessToken ||
        !loginResult.user
      ) {

        throw new Error(
          loginResult.error ||
          "Pi authentication failed"
        );

      }


      console.log(
        "[PiAuth] Pi authentication successful:",
        loginResult.user
      );


      // ===============================================
      // 2. SERVER VERIFICATION
      //
      // Backend verifies accessToken against:
      //
      // GET /v2/me
      // Authorization: Bearer accessToken
      //
      // Client identity is NOT trusted until this
      // succeeds.
      // ===============================================

      setAuthMessage(
        "Verifying Pi account..."
      );


      const verifyResult =
        await piService.verifyWithBackend(
          loginResult.accessToken
        );


      if (
        !verifyResult.success ||
        !verifyResult.user
      ) {

        throw new Error(
          verifyResult.error ||
          "Server rejected Pi account"
        );

      }


      console.log(
        "[PiAuth] Server verified:",
        verifyResult.user
      );


      // ===============================================
      // 3. VERIFIED USER
      // ===============================================

      const verifiedUsername =
        verifyResult.user.username;

      const verifiedUid =
        verifyResult.user.uid;


      setUsername(
        verifiedUsername
      );

      setUid(
        verifiedUid
      );

      setAccessToken(
        loginResult.accessToken
      );


      // ===============================================
      // 4. LOCAL SESSION CACHE
      //
      // These are convenience values only.
      // Backend must never trust them for payment
      // authorization.
      // ===============================================

      localStorage.setItem(
        "pi_username",
        verifiedUsername
      );

      localStorage.setItem(
        "uid",
        verifiedUid
      );

      localStorage.setItem(
        "accessToken",
        loginResult.accessToken
      );


      // ===============================================
      // 5. AUTH READY
      // ===============================================

      setIsAuthenticated(true);

      setAuthMessage(
        "Connected to Pi Network"
      );


      console.log(
        "[PiAuth] Authentication complete"
      );

    } catch (err) {

      console.error(
        "[PiAuth] Authentication failed:",
        err
      );


      setIsAuthenticated(false);

      setHasError(true);


      setAuthMessage(
        err instanceof Error
          ? err.message
          : "Authentication failed. Please try again."
      );

    } finally {

      setIsInitializing(false);

    }

  };


  // ===================================================
  // START AUTH
  // ===================================================

  useEffect(() => {

    // -----------------------------------------------
    // Restore UI state while Pi authentication runs.
    //
    // This does NOT mean authenticated.
    // -----------------------------------------------

    const savedUsername =
      localStorage.getItem(
        "pi_username"
      );

    const savedUid =
      localStorage.getItem(
        "uid"
      );


    if (savedUsername) {
      setUsername(
        savedUsername
      );
    }

    if (savedUid) {
      setUid(
        savedUid
      );
    }
    // -----------------------------------------------
    // Actual authentication
    // -----------------------------------------------

    initialize();

  }, []);


  // ===================================================
  // CONTEXT VALUE
  // ===================================================

  const value:
    PiAuthContextType = {

      isAuthenticated,

      isInitializing,

      authMessage,

      hasError,

      username,

      uid,

      accessToken,

      reinitialize:
        initialize,

    };


  return (

    <PiAuthContext.Provider
      value={value}
    >

      {children}

    </PiAuthContext.Provider>

  );

}


// =====================================================
// HOOK
// =====================================================

export function usePiAuth() {

  const context =
    useContext(
      PiAuthContext
    );


  if (
    context === undefined
  ) {

    throw new Error(
      "usePiAuth must be used within a PiAuthProvider"
    );

  }


  return context;

}