"use client";

import { useEffect,useState } from "react";

import Link from "next/link";

import {
  ArrowLeft,
  Copy
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { Card } from "@/components/ui/card";

import { BottomNavigation } from "@/components/bottom-navigation";

import { LoginButton } from "@/components/login-button";

import { usePiAuth }
from "@/contexts/pi-auth-context";

import {
  getMuxedWallet,
  createMuxedAddress
} from "@/lib/muxed-wallet";

export default function AccountPage(){

  const {
    username,
    isAuthenticated
  } = usePiAuth();

  // ưu tiên localStorage
  const localUsername =
    typeof window!=="undefined"
      ?localStorage.getItem(
        "pi_username"
      )||""
      :"";

  const displayUsername =
    localUsername||
    username||
    "";

  const loggedIn =
    !!displayUsername||
    isAuthenticated;

  const [wallet,
    setWallet] =
    useState("");

  const [loading,
    setLoading] =
    useState(true);

  const [creating,
    setCreating] =
    useState(false);

  const [balance,
    setBalance] =
    useState(0);

  const [orders,
    setOrders] =
    useState(0);

  // load existing wallet
  useEffect(()=>{

    async function loadWallet(){

      try{

        if(
          !displayUsername
        ){

          setLoading(false);

          return;
        }

        const existingWallet =
          await getMuxedWallet();

        if(existingWallet){

          setWallet(
            existingWallet
          );
        }

      }catch(err){

        console.error(err);

      }finally{

        setLoading(false);
      }
    }

    async function loadBalance(){

      try{

        if(
          !displayUsername
        ) return;

        const response =
          await fetch(
            `https://payofpi.click/payment-backend/api-proxy/get-balance?username=${displayUsername}`
          );

        const data =
          await response.json();

        if(data.success){

          setBalance(
            Number(
              data.balance||0
            )
          );
        }

      }catch(err){

        console.error(err);
      }
    }

    async function loadOrders(){

      try{

        if(
          !displayUsername
        ) return;

        const response =
          await fetch(
            `https://payofpi.click/payment-backend/api-proxy/count-orders?username=${displayUsername}`
          );

        const data =
          await response.json();

        if(data.success){

          setOrders(
            Number(
              data.total||0
            )
          );
        }

      }catch(err){

        console.error(err);
      }
    }

    loadWallet();
    loadBalance();
    loadOrders();

  },[
    displayUsername
  ]);

  // create wallet
  async function handleCreateWallet() {

    try {

      setCreating(true);

      const newWallet =
        await createMuxedAddress();

      setWallet(
        newWallet
      );

      // wallet created successfully
      await loadBalance();

    } catch (err: any) {

      console.error(err);

      alert(
        err.message ||
        "Create wallet failed"
      );

    } finally {

      setCreating(false);
    }
  }

  // copy wallet
  async function copyWallet(){

    try{

      await navigator
        .clipboard
        .writeText(wallet);

      alert("Copied!");

    }catch{

      alert("Copy failed");
    }
  }
  
  return(
    <main className="min-h-screen bg-gray-50 pb-20">

      <div className="max-w-md mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 p-4 bg-white border-b sticky top-0 z-40">

          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
            >
              <ArrowLeft className="w-5 h-5"/>
            </Button>
          </Link>

          <h1 className="text-lg font-bold">
            Account
          </h1>

        </div>

        {/* Content */}
        <div className="p-4 space-y-4">

          {!loggedIn ? (

            <Card className="p-6 text-center">

              <p className="text-gray-600 mb-4">
                Please log in
              </p>

              <LoginButton/>

            </Card>

          ) : (

            <>

              {/* Profile */}
              <Card className="p-4">

                <div className="text-center">

                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">

                    <span className="text-2xl font-bold text-blue-600">
                      {displayUsername
                        ?.charAt(0)
                        .toUpperCase()}
                    </span>

                  </div>

                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {displayUsername}
                  </h2>

                  <Link href="/settings">
                    <p className="text-sm text-gray-500 cursor-pointer">
                      Update Information
                    </p>
                  </Link>

                </div>

              </Card>

              {/* Wallet */}
              <Card className="p-4">

                <h3 className="font-semibold text-gray-900 mb-2">
                  Muxed Wallet
                </h3>

                {loading ? (

                  <p className="text-sm text-gray-500">
                    Loading wallet...
                  </p>

                ) : wallet ? (

                  <>

                    <div className="bg-gray-100 rounded-lg p-2 text-sm break-all font-medium">
                      {wallet}
                    </div>

                    <Button
                      className="w-full mt-1"
                      onClick={copyWallet}
                    >

                      <Copy className="w-4 h-4 mr-2"/>

                      Copy Wallet

                    </Button>

                  </>

                ) : (

                  <Button
                  className="w-full"
                    onClick={handleCreateWallet}
                    disabled={creating}
                  >

                    {
                      creating
                        ?"Creating..."
                        :"Create Wallet"
                    }

                  </Button>

                )}

              </Card>

              {/* Stats */}
              <Card className="p-4">

                <h3 className="font-semibold text-gray-900 mb-2">
                  Account Stats
                </h3>

                <div className="grid grid-cols-2 gap-3">

                  <div className="bg-blue-50 rounded-lg p-2 text-center">

                    <p className="text-xl font-bold text-blue-600">
                      {orders}
                    </p>

                    <p className="text-xs text-gray-600 mt-1">
                      Orders
                    </p>

                  </div>

                  <div className="bg-green-50 rounded-lg p-2 text-center">

                    <p className="text-xl font-bold text-green-600">
                      Π {balance.toFixed(4)}
                    </p>

                    <p className="text-xs text-gray-600 mt-1">
                      Balance
                    </p>

                  </div>

                </div>

                {/* Actions */}
                <div className="space-y-2">

                  <Button
                  variant="outline"
                  className="w-full"
                  asChild >

                    <Link href="/orders">
                      View Order History
                    </Link>

                  </Button>
                  

                </div>

              </Card>

            </>

          )}

        </div>

      </div>

      <BottomNavigation/>

    </main>
  );
}
