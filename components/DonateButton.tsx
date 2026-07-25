"use client";

import { useState } from "react";

import { usePiAuth }
from "@/contexts/pi-auth-context";

import { PRODUCT_CONFIG }
from "@/lib/product-config";

declare global{
  interface Window{
    SDKLite?:any;
  }
}

export function DonateButton(){

  const authContext =
    usePiAuth();

  const products =
    authContext?.products||[];

  const [loading,setLoading] =
    useState(false);

  const [error,setError] =
    useState<string|null>(null);

  const [success,setSuccess] =
    useState(false);

  const configProductId =
    PRODUCT_CONFIG
      .PRODUCT_DONATE;

  const product =
    products.find(
      (p)=>
        p.id===configProductId
    );

  const handleDonate =
    async()=>{

      try{

        if(!product){

          throw new Error(
            "Donation product not found"
          );
        }

        if(
          typeof window==="undefined"||
          !window.SDKLite
        ){

          throw new Error(
            "Pi SDK not initialized"
          );
        }

        setLoading(true);

        setError(null);

        setSuccess(false);

        const sdk =
          await window.SDKLite.init();

        console.log(
          "SDK:",
          sdk
        );

        console.log(
          "SDK Keys:",
          Object.keys(sdk||{})
        );

        // IMPORTANT
        // makePurchase only works
        // in published Pi App runtime
        if(
          typeof sdk.makePurchase!=="function"
        ){

          throw new Error(
            "makePurchase not available. Open the published app inside Pi Browser."
          );
        }

        const result =
          await sdk.makePurchase(
            product.slug
          );

        console.log(
          "[DONATION SUCCESS]",
          result
        );

        // consume donation
        try{

          await sdk.state.consume(
            product.slug,
            1
          );

        }catch(consumeError){

          console.warn(
            "Consume failed:",
            consumeError
          );
        }

        setSuccess(true);

      }catch(err:any){

        console.error(
          "[DONATE ERROR]",
          err
        );

        if(
          err?.code===
          "purchase_cancelled"
        ){

          setError(
            "Payment cancelled"
          );

        }else{

          setError(
            err?.message||
            "Donation failed"
          );
        }

      }finally{

        setLoading(false);
      }
    };

  if(!product){

    return(
      <div className="w-full px-4 py-2 text-center text-sm text-gray-500">

        Donate button loading...

      </div>
    );
  }

  return(
    <div className="w-full">

      <button
        onClick={handleDonate}
        disabled={
          loading
        }
        className="w-full px-4 py-2 bg-gradient-to-r from-amber-500 to-white-500 text-black font-bold rounded disabled:opacity-50 hover:from-amber-600 hover:to-orange-600 transition-all"
      >

        {loading
          ?"Processing..."
          :`❤️ Donate ${product.price_in_pi} Pi`
        }

      </button>

      {error&&(
        <p className="text-xs text-red-500 mt-2 text-center">

          {error}

        </p>
      )}

      {success&&(
        <p className="text-xs text-green-500 mt-2 text-center">

          ✓ Thank you for your donation!

        </p>
      )}

    </div>
  );
}
