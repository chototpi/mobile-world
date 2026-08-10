"use client";

import { useState,useEffect } from "react";
import { usePiAuth } from "@/contexts/pi-auth-context";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BottomNavigation } from "@/components/bottom-navigation";

import {
  ChevronLeft,
  CheckCircle,
  XCircle,
  Edit2,
  X,
  Package,
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const ADMIN_USERNAMES = [
  "thaibinh1985",
  "hanni84dn"
];

interface Product{
  id:string;
  uid:string;
  username:string;
  name:string;
  category:string;
  price:number;
  image:string;
  description:string;
  status:string;
  stock_quantity:number;
}

export default function ManagerPage(){

  const {
    username,
    isAuthenticated
  } = usePiAuth();

  const router =
    useRouter();

  const [products,setProducts] =
    useState<Product[]>([]);

  const [loading,setLoading] =
    useState(true);

  const [editingProduct,setEditingProduct] =
    useState<Product|null>(null);

  const [editName,setEditName] =
    useState("");

  const [editPrice,setEditPrice] =
    useState("");

  const [editDescription,setEditDescription] =
    useState("");

  useEffect(()=>{

    if(!isAuthenticated)
      return;

    if(
      !ADMIN_USERNAMES.includes(
        username||""
      )
    ){

      router.push("/");
      return;
    }

    loadProducts();

  },[
    isAuthenticated,
    username
  ]);

  const loadProducts =
    async()=>{

      try{

        setLoading(true);

        const response =
          await fetch(
            "/payment-backend/api-proxy/products"
          );

        const data =
          await response.json();

        if(data.success){

          setProducts(
            data.products||[]
          );

        }else{

          setProducts([]);
        }

      }catch(err){

        console.error(err);

        setProducts([]);

      }finally{

        setLoading(false);
      }
    };    

  const rejectProduct =
    async(id:string)=>{

      try{

        await fetch(
          `/payment-backend/api-proxy/delete-product/${id}`,
          {
            method:"DELETE"
          }
        );

        await loadProducts();

      }catch(err){

        console.error(err);
      }
    };

  const startEditProduct = (
    product:Product
  )=>{

    setEditingProduct(product);

    setEditName(
      product.name
    );

    setEditPrice(
      String(product.price)
    );

    setEditDescription(
      product.description
    );
  };

  const saveProduct =
    async()=>{

      if(!editingProduct)
        return;

      try{

        await fetch(
          "/payment-backend/api-proxy/edit-product",
          {
            method:"POST",

            headers:{
              "Content-Type":
                "application/json"
            },

            body:JSON.stringify({
              id:
                editingProduct.id,

              name:
                editName,

              price:
                editPrice,

              description:
                editDescription,
            })
          }
        );

        setEditingProduct(
          null
        );

        await loadProducts();

      }catch(err){

        console.error(err);
      }
    };

  if(
    !isAuthenticated||
    !ADMIN_USERNAMES.includes(
      username||""
    )
  ){

    return(
      <div className="min-h-screen flex items-center justify-center bg-background">

        <div className="text-center">

          <p className="text-gray-500 mb-4">
            Access Denied
          </p>

          <Link href="/">
            <Button>
              Back to Home
            </Button>
          </Link>

        </div>

      </div>
    );
  }

  return(
    <div className="min-h-screen bg-slate-50">

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
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
          <div>
            <h1 className="text-xl font-bold text-black-600">
              Product Manager
            </h1>
            <p className="text-xs text-slate-500">
              {products.length} Active
            </p>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 pb-20 max-w-2xl mx-auto">

        {loading?(
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-blue-600 rounded-full animate-spin"/>
          </div>
        ):products.length===0?(
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3"/>
            <p className="text-slate-500 font-medium">No pending products</p>
          </div>
        ):(
          <div className="space-y-3">
            {products.map((product)=>(
              <Card
                key={product.id}
                className="p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-3">
                  <Link
                    key={product.id}
                    href={`/product/${product.id}`}
                  >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 rounded object-cover bg-slate-100 flex-shrink-0"
                  />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm text-slate-900 line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {product.category}
                        </p>
                      </div>
                      <p className="font-bold text-blue-600 text-sm flex-shrink-0">
                        Π {Number(product.price).toFixed(2)}
                      </p>
                    </div>                    

                    <p className="text-xs text-slate-600 line-clamp-1 mb-3">
                      {product.description}
                    </p>

                    <div className="flex gap-2">                      
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 h-8 text-xs flex-1"
                        onClick={()=>startEditProduct(product)}
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1"/>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 h-8 text-xs flex-1"
                        onClick={()=>rejectProduct(product.id)}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1"/>
                        Hidden
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

      </main>

      {/* Modal */}
      {editingProduct&&(
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <Card className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-xl shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-900">
                Edit Product
              </h2>
              <button
                onClick={()=>setEditingProduct(null)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-5 h-5 text-slate-500"/>
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="text-xs font-medium text-slate-900 block mb-1.5">
                  Name
                </label>
                <Input
                  value={editName}
                  onChange={(e)=>setEditName(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-900 block mb-1.5">
                  Price (Π)
                </label>
                <Input
                  type="number"
                  value={editPrice}
                  onChange={(e)=>setEditPrice(e.target.value)}
                  step="0.01"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-900 block mb-1.5">
                  Description
                </label>
                <Textarea
                  value={editDescription}
                  onChange={(e)=>setEditDescription(e.target.value)}
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 p-4 border-t border-slate-200">
              <Button
                variant="outline"
                className="flex-1 h-9"
                onClick={()=>setEditingProduct(null)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700 h-9"
                onClick={saveProduct}
              >
                Save
              </Button>
            </div>
          </Card>
        </div>
      )}

    <BottomNavigation/>
    </div>
  );
}
