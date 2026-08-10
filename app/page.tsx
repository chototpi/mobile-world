"use client";

import {
  useState,
  useEffect
} from "react";

import {
  ShoppingCart,
  Search,
  X,
  Settings
} from "lucide-react";

import { Button }
from "@/components/ui/button";

import { Input }
from "@/components/ui/input";

import { Card }
from "@/components/ui/card";

import { Badge }
from "@/components/ui/badge";

import Link from "next/link";

import { BottomNavigation }
from "@/components/bottom-navigation";

import { LoginButton }
from "@/components/login-button";

import { usePiAuth }
from "@/contexts/pi-auth-context";

import type {
  Product
} from "@/lib/products";

const CATEGORIES = [
  "All",
  "Smartphones",
  "Tablets",
  "Laptops",
  "Desktops",
  "Accessories",
];

export default function HomePage(){

  const [products,
    setProducts] =
    useState<Product[]>([]);

  const [selectedCategory,
    setSelectedCategory] =
    useState("All");

  const [searchTerm,
    setSearchTerm] =
    useState("");

  const [cartCount,
    setCartCount] =
    useState(0);

  const [isSearchOpen,
    setIsSearchOpen] =
    useState(false);

  const [loading,
    setLoading] =
    useState(true);

  const { sdk,
    isAuthenticated } =
    usePiAuth();

// random helper
function shuffleArray<T>(
  array:T[]
){

  return [...array].sort(
    ()=>Math.random()-0.5
  );
}

// load products
useEffect(()=>{

  async function loadProducts(){

    try{

      // fetch latest products
      const response =
        await fetch(
          "/payment-backend/api-proxy/products"
        );

      const data =
        await response.json();

      if(!data.success){

        setLoading(false);

        return;
      }

      const latestProducts =
        data.products||[];

      // load cache
      const cachedProducts =
        JSON.parse(
          localStorage.getItem(
            "mw_shuffled_products"
          )||"[]"
        );

      // first app open
      if(cachedProducts.length===0){

        const shuffled =
          shuffleArray(
            latestProducts
          );

        localStorage.setItem(
          "mw_shuffled_products",
          JSON.stringify(
            shuffled
          )
        );

        setProducts(
          shuffled
        );

        return;
      }

      // ids
      const cachedIds =
        cachedProducts.map(
          (p:any)=>p.id
        );

      const latestIds =
        latestProducts.map(
          (p:any)=>p.id
        );

      // remove deleted products
      let finalProducts =
        cachedProducts.filter(
          (p:any)=>
            latestIds.includes(
              p.id
            )
        );

      // detect new products
      const newProducts =
        latestProducts.filter(
          (p:any)=>
            !cachedIds.includes(
              p.id
            )
        );

      // add new products
      if(newProducts.length>0){

        const shuffledNew =
          shuffleArray(
            newProducts
          );

        finalProducts = [

          ...shuffledNew,

          ...finalProducts
        ];
      }

      // sync updated product info
      finalProducts =
        finalProducts.map(
          (cached:any)=>{

            const latest =
              latestProducts.find(
                (p:any)=>
                  p.id===cached.id
              );

            return latest||cached;
          }
        );

      // update cache
      localStorage.setItem(
        "mw_shuffled_products",
        JSON.stringify(
          finalProducts
        )
      );

      setProducts(
        finalProducts
      );

    }catch(err){

      console.error(err);

    }finally{

      setLoading(false);
    }
  }

  loadProducts();

},[]);

// load cart count
useEffect(()=>{

  const cart =
    JSON.parse(
      localStorage.getItem(
        "cart"
      )||"[]"
    );

  setCartCount(
    cart.length
  );

},[]);

// filter products
const filteredProducts =
  products.filter(
    (product)=>{

      const matchesCategory =
        selectedCategory==="All" ||
        product.category===
        selectedCategory;

      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(
            searchTerm.toLowerCase()
          );

      return(

        matchesCategory &&
        matchesSearch &&
        product.status==="active"
      );
    }
  );

// add cart
const addToCart = (
  e:React.MouseEvent,
  product:Product
)=>{

  e.preventDefault();

  e.stopPropagation();

  const cart =
    JSON.parse(
      localStorage.getItem(
        "cart"
      )||"[]"
    );

  const existingItem =
    cart.find(
      (item:any)=>
        item.productId===
        product.id
    );

  if(existingItem){

    existingItem.quantity += 1;

  }else{

    cart.push({

      ...product,

      quantity:1,

      cartId:
        product.id,
    });
  }

  localStorage.setItem(
    "cart",
    JSON.stringify(cart)
  );

  setCartCount(
    cart.length
  );

  alert(
    `${product.name} added to cart!`
  );
};

  return(
    <div className="min-h-screen bg-background pb-20 flex flex-col">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">

        <div className="px-3 py-3">

          <div className="flex items-center justify-between gap-1 mb-1">

            <h1 className="text-xl font-bold text-blue-600">
              Mobile World
            </h1>

            <div className="flex items-center gap-1">

              <Button
                variant="ghost"
                size="icon"
                onClick={()=>
                  setIsSearchOpen(
                    !isSearchOpen
                  )
                }
                className="flex-shrink-0"
              >

                {
                  isSearchOpen
                  ?<X className="w-5 h-5"/>
                  :<Search className="w-5 h-5"/>
                }

              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="relative flex-shrink-0"
                asChild
              >

                <Link href="/cart">

                  <ShoppingCart className="w-5 h-5"/>

                  {cartCount>0&&(

                    <Badge className="absolute -top-1 -right-1 h-3.5 min-w-3.5 px-1 flex items-center justify-center text-[10px] leading-none">

                      {cartCount}

                    </Badge>
                  )}

                </Link>

              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
                asChild
              >

                <Link href="/settings">
                  <Settings className="w-5 h-5"/>
                </Link>

              </Button>

              <LoginButton/>

            </div>

          </div>

          {/* Search */}
          {isSearchOpen&&(

            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 mb-2">

              <Search className="w-4 h-4 text-gray-500 flex-shrink-0"/>

              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e)=>
                  setSearchTerm(
                    e.target.value
                  )
                }
                className="bg-transparent border-0 focus-visible:ring-0 placeholder:text-gray-500"
                autoFocus
              />

            </div>
          )}

        </div>

        {/* Categories */}
        <div className="overflow-x-auto px-3 pb-3">

          <div className="flex gap-2">

            {CATEGORIES.map(
              (category)=>(
                <Button
                  key={category}
                  variant={
                    selectedCategory===
                    category
                    ?"default"
                    :"outline"
                  }
                  size="sm"
                  onClick={()=>
                    setSelectedCategory(
                      category
                    )
                  }
                  className="whitespace-nowrap"
                >

                  {category}

                </Button>
              )
            )}

          </div>

        </div>

      </header>

      {/* Products */}
      <main className="px-3 py-3 flex-1">

        {loading?(
          
          <div className="text-center py-12 text-gray-500">
            Loading products...
          </div>

        ):filteredProducts.length===0?(
          
          <div className="text-center py-12">
            <p className="text-gray-500">
              No products found
            </p>
          </div>

        ):(

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">

            {filteredProducts.map(
              (product)=>(
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                >

                  <Card className="p-0 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">

                    <div className="aspect-[6/5] bg-gray-100 relative overflow-hidden">

                      <img
                        src={product.image}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />

                      {!product.inStock&&(

                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">

                          <span className="text-white font-bold text-sm">
                            Out of Stock
                          </span>

                        </div>
                      )}

                    </div>

                    <div className="p-2 flex-1 flex flex-col justify-between">

                      <div>

                        <p className="text-xs text-gray-500 mb-1">
                          {product.category}
                        </p>

                        <h3 className="font-semibold text-sm line-clamp-2">
                          {product.name}
                        </h3>

                      </div>

                      <div className="mt-2">

                        <p className="font-bold text-blue-600">
                          Π {Number(product.price).toFixed(4)}
                        </p>
                      
                      </div>

                    </div>

                  </Card>

                </Link>
              )
            )}

          </div>
        )}

      </main>
      <BottomNavigation/>

    </div>
  );
}
