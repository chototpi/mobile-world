"use client";

import { useState } from "react";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { Button } from "@/components/ui/button";
import { PRODUCT_CONFIG } from "@/lib/product-config";

const ANKER_737_PRODUCT_ID = PRODUCT_CONFIG.PRODUCT_6a19059c62f7427ab22d3a30;

export function Anker737PaymentButton() {
  const authContext = usePiAuth();
  
  const products = authContext?.products || [];
  const restoredPurchases = authContext?.restoredPurchases || [];
  const sdk = authContext?.sdk;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Find the product from the products array
  const product = products.find((p) => p.id === ANKER_737_PRODUCT_ID);

  // Extract price from product
  const amount = product?.price_in_pi ?? 0.069;

  // Check restored purchases
  const quantity = restoredPurchases?.find(
    (p) => p.productId === product?.slug
  )?.quantity ?? 0;

  const isPurchased = quantity > 0;

  const handlePurchase = async () => {
    if (!product) {
      setError("Product not found");
      return;
    }

    if (!sdk) {
      setError("SDK not initialized");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      console.log("[v0] Starting purchase for:", product.slug);

      // Call makePurchase from SDKLite
      const result = await sdk.makePurchase(product.slug);

      console.log("[v0] Purchase result:", result);

      if (result.ok) {
        console.log("[v0] Purchase successful:", {
          productId: result.productId,
          paymentId: result.paymentId,
          txid: result.txid,
        });

        setSuccess(true);
        setError(null);

        // Optional: Consume the product if it's consumable
        // await sdk.state.consume(product.slug, 1);
      } else {
        const errorCode = (result as any).code || "unknown_error";
        const errorMessages: Record<string, string> = {
          product_not_found: "Product not found",
          purchase_cancelled: "Purchase was cancelled",
          purchase_error: "An error occurred during purchase",
        };
        setError(errorMessages[errorCode] || "Purchase failed");
      }
    } catch (err: any) {
      console.error("[v0] Purchase error:", err);
      
      const errorCode = err?.code || "unknown";
      const errorMessages: Record<string, string> = {
        product_not_found: "Product not found",
        purchase_cancelled: "Purchase was cancelled",
        purchase_error: "An error occurred during purchase",
      };
      
      setError(errorMessages[errorCode] || err.message || "Purchase failed");
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return (
      <Button disabled className="w-full">
        Product unavailable
      </Button>
    );
  }

  const buttonText = loading
    ? "Processing..."
    : isPurchased
    ? "Already Owned"
    : `Buy ${product.name || "Anker 737 Power Bank"} - Π ${amount.toFixed(3)}`;

  return (
    <>
      <Button
        onClick={handlePurchase}
        disabled={loading || isPurchased}
        className="w-full"
      >
        {buttonText}
      </Button>

      {error && (
        <p className="text-xs text-red-600 mt-2">
          {error}
        </p>
      )}

      {success && (
        <div className="text-xs text-green-600 mt-2">
          <p>Purchase completed successfully!</p>
          <p className="text-xs opacity-75 mt-1">
            Thank you for your purchase of Anker 737 Power Bank
          </p>
        </div>
      )}
    </>
  );
}
