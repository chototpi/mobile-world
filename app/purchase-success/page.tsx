"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, Home, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function PurchaseSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const transaction = searchParams.get("transaction");
  const product = searchParams.get("product");
  const amount = searchParams.get("amount");
  const items = searchParams.get("items");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-6">
      <Card className="w-full max-w-md">
        <div className="p-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-green-600 mb-2">
              Purchase Successful!
            </h1>
            <p className="text-gray-600">
              Thank you for your order. Your transaction has been completed.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg space-y-2 text-left">
            {transaction && (
              <div>
                <p className="text-xs text-gray-600">Transaction ID</p>
                <p className="font-mono text-sm font-semibold break-all">
                  {transaction}
                </p>
              </div>
            )}

            {amount && (
              <div>
                <p className="text-xs text-gray-600">Amount Paid</p>
                <p className="text-lg font-bold text-blue-600">
                  Π {parseFloat(amount).toFixed(2)}
                </p>
              </div>
            )}

            {items && (
              <div>
                <p className="text-xs text-gray-600">Items Purchased</p>
                <p className="font-semibold">{items} item(s)</p>
              </div>
            )}

            {product && (
              <div>
                <p className="text-xs text-gray-600">Product</p>
                <p className="font-semibold">{product}</p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              ✓ Order confirmed
            </p>
            <p className="text-sm text-gray-600 mb-2">
              ✓ Receipt sent to your email
            </p>
            <p className="text-sm text-gray-600">
              ✓ You can view your orders in the "My Orders" section
            </p>
          </div>

          <div className="flex flex-col gap-2 pt-4">
            <Button
              onClick={() => router.push("/")}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Home className="w-4 h-4" />
              Continue Shopping
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/orders")}
              className="gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              View Orders
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function PurchaseSuccessPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <PurchaseSuccessContent />
    </Suspense>
  );
}