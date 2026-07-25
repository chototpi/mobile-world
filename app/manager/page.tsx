"use client";

import Link from "next/link";

import {
  ChevronLeft,
  Package,
  CheckCircle,
  ShieldCheck
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/bottom-navigation";

export default function ManagerPage(){

  const router =
    useRouter();

  return(
    <div className="min-h-screen bg-background pb-20">

      {/* header */}
      <header className="sticky top-0 z-50 bg-white border-b">

        <div className="px-4 py-4 flex items-center gap-4">

          <Link href="/">
            <Button 
              variant="ghost" size="icon"
              onClick={()=>
              router.back()
              }>
              <ChevronLeft className="w-5 h-5"/>
            </Button>
          </Link>

          <h1 className="text-xl font-bold text-balck-600">
            Admin Manager
          </h1>

        </div>

      </header>

      {/* content */}
      <main className="px-4 py-6">

        <div className="space-y-4">

          <Link href="/manager/pending-product" className="p-4">

            <Card className="p-5 hover:bg-gray-50 transition cursor-pointer">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">

                  <Package className="w-6 h-6 text-yellow-600"/>

                </div>

                <div>

                  <h2 className="font-bold text-lg">
                    Pending Product
                  </h2>

                  <p className="text-sm text-gray-500">
                    Review pending products
                  </p>

                </div>

              </div>

            </Card>

          </Link>

          <Link href="/manager/active-product" className="p-4">

            <Card className="p-5 hover:bg-gray-50 transition cursor-pointer">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">

                  <CheckCircle className="w-6 h-6 text-green-600"/>

                </div>

                <div>

                  <h2 className="font-bold text-lg">
                    Active Product
                  </h2>

                  <p className="text-sm text-gray-500">
                    Manage active products
                  </p>

                </div>

              </div>

            </Card>

          </Link>

          <Link href="/manager/kyc" className="p-4">

            <Card className="p-5 hover:bg-gray-50 transition cursor-pointer">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">

                  <ShieldCheck className="w-6 h-6 text-blue-600"/>

                </div>

                <div>

                  <h2 className="font-bold text-lg">
                    KYC
                  </h2>

                  <p className="text-sm text-gray-500">
                    Verify partner accounts
                  </p>

                </div>

              </div>

            </Card>
            </Link>

        </div>
        
      </main>
      <BottomNavigation/>
    </div>
  );
}
