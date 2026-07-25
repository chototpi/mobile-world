/**
 * Mobile World - Pi Network U2A Payment
 *
 * Flow:
 *
 * Pi.init()
 *   ↓
 * Pi.createPayment()
 *   ↓
 * onReadyForServerApproval
 *   ↓
 * Backend -> Pi /approve
 *   ↓
 * User signs payment
 *   ↓
 * onReadyForServerCompletion
 *   ↓
 * Backend -> Pi /complete
 *   ↓
 * Payment success
 */

import { piService } from "@/lib/pi-service";


// =====================================================
// CONFIG
// =====================================================

const PI_BACKEND_URL =
  "https://pi-backend-zeta.vercel.app";


// =====================================================
// TYPES
// =====================================================

export type PaymentMetadata = {
  [key: string]: unknown;
};

export interface PiPayment {
  identifier: string;

  amount: number;

  memo?: string;

  metadata?: PaymentMetadata;

  transaction?: {
    txid?: string;
  };
}

export interface PaymentOptions {
  amount: number;

  memo: string;

  metadata: PaymentMetadata;

  onComplete?: (
    result: PaymentCompleteResult
  ) => void;

  onCancel?: (
    paymentId: string
  ) => void;

  onError?: (
    error: Error,
    payment?: PiPayment
  ) => void;
}

export interface PaymentCompleteResult {
  paymentId: string;

  txid: string;

  payment?: unknown;
}

interface PiPaymentData {
  amount: number;

  memo: string;

  metadata: PaymentMetadata;
}

interface PiPaymentCallbacks {

  onReadyForServerApproval:
    (
      paymentId: string
    ) => void;

  onReadyForServerCompletion:
    (
      paymentId: string,
      txid: string
    ) => void;

  onCancel:
    (
      paymentId: string
    ) => void;

  onError:
    (
      error: Error,
      payment?: PiPayment
    ) => void;
}


// =====================================================
// WINDOW TYPE
// =====================================================

declare global {

  interface Window {

    Pi: {

      init: (
        config: {
          version: string;
          sandbox?: boolean;
        }
      ) => Promise<void>;

      authenticate: (
        scopes: string[],

        onIncompletePaymentFound:
          (
            payment: PiPayment
          ) => Promise<void>

      ) => Promise<{
        accessToken: string;

        user: {
          uid: string;
          username: string;
        };
      }>;

      createPayment: (
        paymentData: PiPaymentData,

        callbacks: PiPaymentCallbacks

      ) => void;
    };

  }

}


// =====================================================
// RESPONSE HELPER
// =====================================================

async function readResponse(
  response: Response
): Promise<any> {

  const text =
    await response.text();


  if (!text) {

    return {};

  }


  try {

    return JSON.parse(text);

  } catch {

    return {
      raw: text,
    };

  }

}


// =====================================================
// APPROVE PAYMENT
// =====================================================
async function approvePayment(
  paymentId: string
): Promise<void> {

  console.log(
    "[PiPayment] Server approval:",
    paymentId
  );


  const response =
    await fetch(
      `${PI_BACKEND_URL}/pi/payments/${encodeURIComponent(
        paymentId
      )}/approve`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },
      }
    );


  const data =
    await readResponse(
      response
    );


  if (
    !response.ok ||
    !data?.success
  ) {

    console.error(
      "[PiPayment] Approval rejected:",
      data
    );


    throw new Error(
      data?.error ||
      "Server failed to approve payment"
    );

  }


  console.log(
    "[PiPayment] Payment approved:",
    paymentId
  );

}


// =====================================================
// COMPLETE PAYMENT
// =====================================================

async function completePayment(
  paymentId: string,
  txid: string
): Promise<PaymentCompleteResult> {

  console.log(
    "[PiPayment] Server completion:",
    {
      paymentId,
      txid,
    }
  );


  const response =
    await fetch(
      `${PI_BACKEND_URL}/pi/payments/${encodeURIComponent(
        paymentId
      )}/complete`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          txid,
        }),
      }
    );


  const data =
    await readResponse(
      response
    );


  if (
    !response.ok ||
    !data?.success
  ) {

    console.error(
      "[PiPayment] Completion rejected:",
      data
    );


    throw new Error(
      data?.error ||
      "Server failed to complete payment"
    );

  }


  console.log(
    "[PiPayment] Payment completed:",
    paymentId
  );


  return {
    paymentId,

    txid,

    payment:
      data.payment,
  };

}


// =====================================================
// CREATE CALLBACKS
// =====================================================

function createPaymentCallbacks(
  options: PaymentOptions
): PiPaymentCallbacks {

  // ---------------------------------------------------
  // APPROVAL
  // ---------------------------------------------------

  const onReadyForServerApproval =
    (
      paymentId: string
    ): void => {

      console.log(
        "[PiPayment] Ready for approval:",
        paymentId
      );


      approvePayment(
        paymentId
      ).catch(
        (error) => {

          console.error(
            "[PiPayment] Approval failed:",
            error
          );


          options.onError?.(
            error instanceof Error
              ? error
              : new Error(
                  "Payment approval failed"
                )
          );

        }
      );

    };


  // ---------------------------------------------------
  // COMPLETION
  // ---------------------------------------------------

  const onReadyForServerCompletion =
    (
      paymentId: string,
      txid: string
    ): void => {

      console.log(
        "[PiPayment] Ready for completion:",
        {
          paymentId,
          txid,
        }
      );


      completePayment(
        paymentId,
        txid
      )
        .then(
          (result) => {

            /*
             * THIS is the success point.
             *
             * We do not call onComplete before the
             * backend successfully completes the
             * payment with Pi.
             */

            options.onComplete?.(
              result
            );

          }
        )
        .catch(
          (error) => {

            console.error(
              "[PiPayment] Completion failed:",
              error
            );


            options.onError?.(
              error instanceof Error
                ? error
                : new Error(
                    "Payment completion failed"
                  )
            );

          }
        );

    };


  // ---------------------------------------------------
  // CANCEL
  // ---------------------------------------------------

  const onCancel =
    (
      paymentId: string
    ): void => {

      console.log(
        "[PiPayment] Payment cancelled:",
        paymentId
      );


      options.onCancel?.(
        paymentId
      );

    };


  // ---------------------------------------------------
  // ERROR
  // ---------------------------------------------------

  const onError =
    (
      error: Error,
      payment?: PiPayment
    ): void => {

      console.error(
        "[PiPayment] Pi SDK error:",
        error,
        payment
      );


      options.onError?.(
        error,
        payment
      );

    };


  return {
    onReadyForServerApproval,
    onReadyForServerCompletion,
    onCancel,
    onError,
  };

}


// =====================================================
// PAY
// =====================================================

export async function pay(
  options: PaymentOptions
): Promise<void> {

  try {

    // -------------------------------------------------
    // Validate payment data
    // -------------------------------------------------

    if (
      !Number.isFinite(
        options.amount
      ) ||
      options.amount <= 0
    ) {

      throw new Error(
        "Invalid payment amount"
      );

    }


    if (!options.memo?.trim()) {

      throw new Error(
        "Payment memo is required"
      );

    }


    // -------------------------------------------------
    // REQUIRED:
    //
    // Ensure Pi.init() has fully completed BEFORE
    // Pi.createPayment().
    //
    // piService caches initPromise, so this does not
    // initialize Pi twice.
    // -------------------------------------------------

    await piService.init();


    if (
      typeof window ===
        "undefined" ||
      !window.Pi
    ) {

      throw new Error(
        "Pi SDK is not available"
      );

    }
    // -------------------------------------------------
    // Payment request
    // -------------------------------------------------

    const paymentData:
      PiPaymentData = {

      amount:
        options.amount,

      memo:
        options.memo,

      metadata:
        options.metadata,

    };


    console.log(
      "[PiPayment] Creating payment:",
      paymentData
    );


    // -------------------------------------------------
    // U2A
    // -------------------------------------------------

    window.Pi.createPayment(
      paymentData,
      createPaymentCallbacks(
        options
      )
    );


  } catch (error) {

    const normalizedError =
      error instanceof Error
        ? error
        : new Error(
            "Failed to create payment"
          );


    console.error(
      "[PiPayment] createPayment failed:",
      normalizedError
    );


    options.onError?.(
      normalizedError
    );


    throw normalizedError;

  }

}