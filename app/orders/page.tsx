"use client";

import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  ShoppingBag
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const API_URL=
  "https://payofpi.click/payment-backend/api-proxy/get-orders";

interface Order{
  id:number;
  product_name:string;
  amount:number;
  status:string;
  payment_method:string;
  created_at:string;
}

export default function OrdersPage(){

  const router=
    useRouter();

  const [orders,setOrders]=
    useState<Order[]>([]);

  const [isLoading,setIsLoading]=
    useState(true);

  useEffect(()=>{

    async function loadOrders(){

      try{

        const username=
          localStorage.getItem(
            "pi_username"
          );

        if(!username){

          setIsLoading(false);
          return;
        }

        const response=
          await fetch(
            `${API_URL}?username=${username}`
          );

        const data=
          await response.json();

        if(data.success){

          setOrders(
            data.orders||[]
          );
        }

      }catch(err){

        console.error(err);

      }finally{

        setIsLoading(false);
      }
    }

    loadOrders();

  },[]);

  const getStatusColor=(
    status:string
  )=>{

    switch(status){

      case "paid":
        return "bg-yellow-100 text-yellow-800";

      case "processing":
        return "bg-orange-100 text-orange-800";

      case "shipped":
        return "bg-blue-100 text-blue-800";

      case "completed":
        return "bg-green-100 text-green-800";

      case "return_pending":
        return "bg-purple-100 text-purple-800";

      case "returned":
        return "bg-gray-200 text-gray-800";

      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if(isLoading){

    return(
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-gray-500">
          Loading orders...
        </p>
      </div>
    );
  }

  return(
    <div className="min-h-screen bg-background pb-20">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b px-4 py-3 flex items-center gap-3">

        <Button
          variant="ghost"
          size="icon"
          onClick={()=>
            router.back()
          }
        >
          <ArrowLeft className="w-5 h-5"/>
        </Button>

        <h1 className="text-lg font-semibold flex-1">
          My Orders
        </h1>

      </div>

      <main className="px-4 py-6">

        {orders.length===0?(
          <div className="text-center py-12">

            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4"/>

            <p className="text-gray-500 text-lg mb-4">
              No orders yet
            </p>

            <Button
              onClick={()=>
                router.push("/")
                }
              className="bg-blue-600 hover:bg-blue-700"
            >
              Start Shopping
            </Button>

          </div>
        ):(
          <div className="space-y-3">

            {orders.map(order=>(
              <Card
                key={order.id}
                className="p-4"
              >

                <div className="flex items-start justify-between mb-3">

                  <div>

                    <p className="font-semibold text-sm">
                      ORDER #{order.id}
                    </p>

                    <p className="text-xs text-gray-500">
                      {
                        new Date(
                          order.created_at
                        ).toLocaleString()
                      }
                    </p>

                  </div>

                  <Badge
                    variant="outline"
                    className={
                      getStatusColor(
                        order.status
                      )
                    }
                  >
                    {order.status}
                  </Badge>

                </div>

                {/* Product */}
                <div className="bg-gray-50 rounded p-3 mb-3">

                  <div className="flex justify-between items-start">

                    <div>

                      <p className="font-medium">
                        {order.product_name}
                      </p>

                      <p className="text-xs text-gray-500">
                        Payment:
                        {" "}
                        {order.payment_method}
                      </p>

                    </div>

                    <p className="font-semibold text-blue-600">
                      Π {Number(order.amount).toFixed(4)}
                    </p>

                  </div>

                </div>

                {/* Total */}
                <div className="flex justify-between items-center border-t pt-3">

                  <p className="text-sm font-semibold">
                    Total
                  </p>

                  <p className="text-lg font-bold text-blue-600">
                    Π {Number(order.amount).toFixed(4)}
                  </p>

                </div>

              </Card>
            ))}

          </div>
        )}

      </main>

    </div>
  );
}
