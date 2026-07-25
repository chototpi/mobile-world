"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { Button } from "@/components/ui/button";
import { PRODUCT_CONFIG } from "@/lib/product-config";

const BUY_API=
  "https://payofpi.click/payment-backend/api-proxy/buy-product";

const GET_USER_API=
  "https://payofpi.click/payment-backend/api-proxy/get-user";

export function BuyNowButton({
  product,
}:{
  product:any;
}) {

  const router=
    useRouter();

  const authContext=
    usePiAuth();

  const products=
    authContext?.products||[];

  const restoredPurchases=
    authContext?.restoredPurchases||[];

  const [loading,setLoading]=
    useState(false);

  const [error,setError]=
    useState<string|null>(null);

  const [success,setSuccess]=
    useState(false);

  const productConfigKey=
    `PRODUCT_${product.piProductId}` as keyof typeof PRODUCT_CONFIG;

  const configProductId=
    PRODUCT_CONFIG[
      productConfigKey
    ];

  const foundProduct=
    products.find(
      (p)=>p.id===configProductId
    );

  const piPrice=
    Number(
      product.price||0
    );

  const handlePayment = async () => {

  try {

    setLoading(true);

    const cartItem = {

      id:
        product.id,

      productId:
        product.id,

      name:
        product.name,

      price:
        Number(product.price || 0),

      quantity: 1,

      image:
        product.image,

      category:
        product.category,

      piProductId:
        product.piProductId,
    };

    // overwrite cart
    localStorage.setItem(
      "cart",
      JSON.stringify([cartItem])
    );

    router.push(
      "/checkout"
    );

  } catch (err: any) {

    console.error(err);

    setError(
      err.message ||
      "Failed to continue checkout"
    );

  } finally {

    setLoading(false);
  }
};

  const quantity=
    restoredPurchases?.find(
      (p)=>
        p.productId===
        product.piProductId
    )?.quantity??0;

  const isPurchased=
    quantity>0;

  const buttonText=
    loading
      ?"Processing..."
      :isPurchased
      ?"Already Owned"
      :`Buy Now - Π ${piPrice.toFixed(2)}`;

  return(
    <>

      <Button
        onClick={handlePayment}
        disabled={
          loading||
          isPurchased
        }
        className="w-full"
      >
        {buttonText}
      </Button>

      {error&&(
        <p className="text-xs text-red-600 mt-2">
          {error}
        </p>
      )}

      {success&&(
        <p className="text-xs text-green-600 mt-2">
          Payment completed successfully!
        </p>
      )}

    </>
  );
}
