"use client";

import {
  useState,
  useEffect
} from "react";

import {
  useRouter
} from "next/navigation";

import {
  ArrowLeft,
  AlertCircle
} from "lucide-react";

import {
  Button
} from "@/components/ui/button";

import {
  Card
} from "@/components/ui/card";

import {
  pay,
  type PaymentCompleteResult
} from "@/lib/pi-payment";

import {
  Alert,
  AlertDescription
} from "@/components/ui/alert";

interface CartItem{
  id:string;
  cartId?:string;
  name:string;
  price:number;
  quantity:number;
  productId:string;
  image?:string;
  category?:string;
}

export default function CheckoutPage(){

  const router=
    useRouter();

  const [cart,setCart]=
    useState<CartItem[]>([]);

  const [isLoading,setIsLoading]=
    useState(true);

  const [isProcessing,setIsProcessing]=
    useState(false);

  const [selectedMethod,
    setSelectedMethod]=
    useState<"pi"|"balance">(
      "balance"
    );

  // load cart + refresh products from DB
  useEffect(()=>{

    async function loadCart(){

      try{

        const savedCart=
          JSON.parse(
            localStorage.getItem(
              "cart"
            )||"[]"
          );

        if(
          savedCart.length===0
        ){

          router.push("/cart");

          return;
        }

        const updatedCart=
          await Promise.all(

            savedCart.map(
              async(item:any)=>{

                try{

                  const response=
                    await fetch(
                      `/payment-backend/api-proxy/product/${item.productId||item.id}`
                    );

                  const data=
                    await response.json();

                  if(
                    data.success
                  ){

                    return{

                      ...data.product,

                      quantity:
                        item.quantity,
                    };
                  }

                  return item;

                }catch{

                  return item;
                }
              }
            )
          );

        setCart(
          updatedCart
        );

      }catch(err){

        console.error(err);

      }finally{

        setIsLoading(false);
      }
    }

    loadCart();

  },[router]);

  const subtotal=
    cart.reduce(
      (sum,item)=>
        sum+
        item.price*
        item.quantity,
      0
    )*0.9;

  const tax=
    cart.reduce(
      (sum,item)=>
        sum+
        item.price*
        item.quantity,
      0
    )*0.1;

  const total=
    subtotal+tax;

 // PI PAYMENT
const handlePiPayment = async () => {

  if (cart.length === 0) {
    alert("Your cart is empty");
    return;
  }

  if (isProcessing) {
    return;
  }

  const uid =
    localStorage.getItem("uid");

  const username =
    localStorage.getItem("pi_username");

  if (!uid || !username) {
    alert("User not logged in");
    return;
  }

  const totalAmount =
    Number(total.toFixed(4));

  if (
    !Number.isFinite(totalAmount) ||
    totalAmount <= 0
  ) {
    alert("Invalid payment amount");
    return;
  }

  setIsProcessing(true);

  try {

    // ================================================
    // PAYMENT METADATA
    //
    // This describes the order.
    // Backend must eventually validate product prices
    // independently before approving the payment.
    // ================================================

    const metadata = {

      type: "mobile_world_purchase",

      uid,

      username,

      items: cart.map((item) => ({
        productId:
          item.productId || item.id,

        name:
          item.name,

        quantity:
          Number(item.quantity),

        price:
          Number(item.price),
      })),

      itemCount:
        cart.reduce(
          (sum, item) =>
            sum + Number(item.quantity),
          0
        ),

      amount:
        totalAmount,
    };


    // ================================================
    // CREATE PI U2A PAYMENT
    // ================================================

    await pay({

      amount:
        totalAmount,

      memo:
        `Mobile World purchase - ${cart.length} item(s)`,

      metadata,


      // ==============================================
      // SUCCESS
      //
      // This callback only runs after our backend
      // successfully calls Pi /complete.
      // ==============================================

      onComplete:
        async (
          result: PaymentCompleteResult
        ) => {

          try {

            console.log(
              "[CHECKOUT] Pi payment completed:",
              result
            );


            // ==========================================
            // SAVE ORDERS
            // ==========================================

            for (const item of cart) {

              const response =
                await fetch(
                  "https://payofpi.click/payment-backend/api-proxy/buy-product",
                  {
                    method: "POST",

                    headers: {
                      "Content-Type":
                        "application/json",
                    },

                    body: JSON.stringify({

                      uid,

                      username,

                      product_id:
                        item.productId ||
                        item.id,

                      product_name:
                        item.name,

                      amount:
                        Number(item.price) *
                        Number(item.quantity),
                        quantity:
                        Number(item.quantity),

                      payment_method:
                        "pi",

                      payment_id:
                        result.paymentId,

                      txid:
                        result.txid,
                    }),
                  }
                );


              const data =
                await response.json();


              if (
                !response.ok ||
                !data.success
              ) {

                throw new Error(
                  data.error ||
                  `Failed to save order: ${item.name}`
                );

              }

            }


            // ==========================================
            // CLEAR CART
            // ==========================================

            localStorage.setItem(
              "cart",
              JSON.stringify([])
            );


            // ==========================================
            // SUCCESS PAGE
            // ==========================================

            const params =
              new URLSearchParams({

                transaction:
                  result.txid,

                paymentId:
                  result.paymentId,

                amount:
                  totalAmount.toFixed(4),

                items:
                  String(cart.length),

              });


            router.push(
              `/purchase-success?${params.toString()}`
            );

          } catch (error) {

            console.error(
              "[CHECKOUT] Payment completed but order save failed:",
              error
            );

            const params =
              new URLSearchParams({
                transaction: result.txid,
                paymentId: result.paymentId,
                amount: totalAmount.toFixed(4),
                items: String(cart.length),
              });

            router.push(
              `/purchase-success?${params.toString()}`
            );

          }

        },


      // ==============================================
      // CANCEL
      // ==============================================

      onCancel:
        (paymentId) => {

          console.log(
            "[CHECKOUT] Payment cancelled:",
            paymentId
          );

          setIsProcessing(false);

          alert(
            "Payment cancelled"
          );

        },


      // ==============================================
      // ERROR
      // ==============================================

      onError:
        (error) => {

          console.error(
            "[CHECKOUT] Pi payment error:",
            error
          );

          setIsProcessing(false);

          alert(
            error.message ||
            "Pi payment failed"
          );

        },

    });
    } catch (error) {

    console.error(
      "[CHECKOUT] Failed to start Pi payment:",
      error
    );


    setIsProcessing(false);


    alert(
      error instanceof Error
        ? error.message
        : "Unable to start Pi payment"
    );

  }

};

// BALANCE PAYMENT
const handleMuxedPayment = async () => {

  if (cart.length === 0) {

    alert("Your cart is empty");

    return;
  }

  try {

    setIsProcessing(true);

    const uid =
      localStorage.getItem(
        "uid"
      );

    const username =
      localStorage.getItem(
        "pi_username"
      );

    if (!uid || !username) {

      throw new Error(
        "User not logged in"
      );
    }

    // buy all cart items
    for (const item of cart) {

      const response =
        await fetch(
          "https://payofpi.click/payment-backend/api-proxy/buy-product",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({

              uid,

              username,

              product_id:
                item.productId ||
                item.id,

              product_name:
                item.name,

              amount:
                Number(item.price) *
                Number(item.quantity),

              quantity:
                item.quantity,

              payment_method:
                "balance",
            }),
          }
        );

      const data =
        await response.json();

      if (!data.success) {

        if (
          data.error ===
          "INSUFFICIENT_BALANCE"
        ) {

          alert(
            "Insufficient balance"
          );

          return;
        }

        throw new Error(
          data.error ||
          "Payment failed"
        );
      }
    }

    localStorage.setItem(
      "cart",
      JSON.stringify([])
    );

    router.push(
      `/purchase-success?amount=${total.toFixed(
        2
      )}&items=${cart.length}`
    );

  } catch (err: any) {

    console.error(
      "[BALANCE PAYMENT ERROR]",
      err
    );

    alert(
      err?.message ||
      "Payment failed"
    );

  } finally {

    setIsProcessing(false);
  }
};

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-lg font-semibold flex-1">Checkout</h1>
      </div>

      <main className="px-4 py-6 space-y-6">
        {/* Order Summary */}
        <div>
          <h2 className="font-semibold mb-3">Order Summary</h2>
          <Card className="p-4">
            <div className="space-y-2 mb-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-sm border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">
                    Π {(item.price * item.quantity).toFixed(4)}
                  </p>
                </div>
              ))}
              <div className="pt-2 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>Π {subtotal.toFixed(4)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (10%)</span>
                  <span>Π {tax.toFixed(4)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg text-blue-600">
                  <span>Total</span>
                  <span>Π {total.toFixed(4)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Payment Method */}
        <div>
          <h2 className="font-semibold mb-3">Payment Method</h2>
          {/* Pi Coin Payment */}
          <Card
            className={`p-4 cursor-pointer mt-3 mb-3 border-2 transition ${
              selectedMethod === "pi"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200"
            }`}
            onClick={() => setSelectedMethod("pi")}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 ${
                  selectedMethod === "pi"
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300"
                }`}
              >
                {selectedMethod === "pi" && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold">Pi Wallet</p>
                <p className="text-sm text-gray-600">
                  Fast and secure payment using Pi Wallet
                </p>
              </div>
            </div>
          </Card>

          {/* Muxed Wallet */}
          <Card
            className={`p-4 cursor-pointer border-2 transition ${
              selectedMethod === "balance"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200"
            }`}
            onClick={() => setSelectedMethod("balance")}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 ${
                  selectedMethod === "balance"
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300"
                }`}
              >
                {selectedMethod === "balance" && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold">Muxed Wallet</p>
                <p className="text-sm text-gray-600">
                  Fast and secure payment using Muxed Wallet
                </p>
              </div>
            </div>
          </Card>
        
        </div>

        {/* Info Alert */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-800">
            All transactions are secured and encrypted. Your payment information
            is never stored on our servers.
          </AlertDescription>
        </Alert>

        {/* Terms Checkbox */}
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            defaultChecked
            className="mt-1"
          />
          <span>
            I agree to the{" "}
            <a href="#" className="text-blue-600 underline">
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 underline">
              Privacy Policy
            </a>
          </span>
        </label>
      </main>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-4 py-3 flex gap-3">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={
            selectedMethod === "pi" ? handlePiPayment : handleMuxedPayment
          }
          disabled={isProcessing}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isProcessing
            ? "Processing..."
            : `Pay Π ${total.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
}
