"use client";

import { useEffect,useState } from "react";
import { useRouter,useParams } from "next/navigation";
import { ArrowLeft,ShoppingCart,Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BuyNowButton } from "@/components/buy-now-button";

import type { Product } from "@/lib/products";

export default function ProductPage(){

  const router=useRouter();

  const params=useParams();

  const id=
    params?.id as string;

  const [product,setProduct]=
    useState<Product|null>(null);

  const [loading,setLoading]=
    useState(true);

  const [quantity,setQuantity]=
    useState(1);

  useEffect(()=>{

    async function loadProduct(){

      try{

        if(!id) return;

        const response=
          await fetch(
            `https://payofpi.click/payment-backend/api-proxy/product/${id}`
          );

        const data=
          await response.json();

        console.log(data);

        if(data.success){

          setProduct(
            data.product
          );
        }

      }catch(err){

        console.error(err);

      }finally{

        setLoading(false);
      }
    }

    loadProduct();

  },[id]);

  if(loading){

    return(
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if(!product){

    return(
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Product not found
          </h2>

          <Button
            onClick={()=>
              router.push("/")
            }
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const addToCart=()=>{

    const cart=
      JSON.parse(
        localStorage.getItem("cart")||"[]"
      );

    const existingItem=
      cart.find(
        (item:any)=>
          item.productId===product.id
      );

    if(existingItem){

      existingItem.quantity+=quantity;

    }else{

      cart.push({
        ...product,
        quantity,
        cartId:product.id,
        productId:product.id,
      });
    }

    localStorage.setItem(
      "cart",
      JSON.stringify(cart)
    );

    alert(
      `${product.name} added to cart!`
    );
  };

  return(
    <div className="min-h-screen bg-background pb-24">

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

        <h1 className="text-lg font-semibold flex-1 line-clamp-1">
          {product.name}
        </h1>

      </div>

      <main className="px-4 py-6">

        <div className="bg-gray-100 rounded-lg overflow-hidden mb-6">

          <img
            src={product.image}
            className="w-full h-full object-contain"
          />

        </div>

        <div className="space-y-4 mb-6">

          <div>

            <Badge
              variant="outline"
              className="mb-2"
            >
              {product.category}
            </Badge>

            <h2 className="text-2xl font-bold mb-2">
              {product.name}
            </h2>

            <div className="flex items-center gap-2 mb-4">

              <div className="flex items-center gap-1">

                {[...Array(5)].map((_,i)=>(
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i<Math.round(product.rating||0)
                      ?"fill-yellow-400 text-yellow-400"
                      :"text-gray-300"
                    }`}
                  />
                ))}

              </div>

              <span className="text-sm text-gray-600">
                {product.rating} ({product.reviews} reviews)
              </span>

            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              {product.longDescription}
            </p>

          </div>

          <div className="bg-blue-50 p-4 rounded-lg">

            <p className="text-sm text-gray-600 mb-1">
              Price
            </p>

            <p className="text-3xl text-center font-bold text-blue-600">
              Π {Number(product.price).toFixed(4)}
            </p>

          </div>

          <div>

            <h3 className="font-semibold mb-3">
              Specifications
            </h3>

            <ul className="space-y-2">

              {product.specs.map((spec,idx)=>(
                <li
                  key={idx}
                  className="flex items-center gap-2 text-sm"
                >

                  <div className="w-1.5 h-1.5 rounded-full bg-blue-600"/>

                  {spec}

                </li>
              ))}

            </ul>

          </div>

          <div className="flex items-center gap-2 flex-wrap">

            {product.inStock?(
              <Badge className="bg-green-600">
                In Stock
              </Badge>
            ):(
              <Badge variant="destructive">
                Out of Stock
              </Badge>
            )}

            <Badge variant="outline">
              Stock: {product.stockQuantity}
            </Badge>

          </div>

          <div>

            <p className="text-sm font-semibold mb-2">
              Quantity
            </p>

            <div className="flex items-center gap-3">

              <Button
                variant="outline"
                size="icon"
                onClick={()=>
                  setQuantity(
                    Math.max(1,quantity-0)
                  )
                }
              >
                −
              </Button>
              <span className="text-lg font-semibold w-12 text-center">
                {quantity}
              </span>

              <Button
                variant="outline"
                size="icon"
                onClick={()=>
                  setQuantity(
                    Math.min(
                      product.stockQuantity,
                      quantity+0
                    )
                  )
                }
              >
                +
              </Button>

            </div>

          </div>

        </div>

      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t px-5 py-3.5 flex gap-3">

        <Button
          variant="outline"
          onClick={addToCart}
          className="flex-1 gap-2"
          disabled={!product.inStock}
        >

          <ShoppingCart className="w-4 h-4"/>

          Add to Cart

        </Button>

        <div className="flex-1">

          <BuyNowButton
            product={{
              ...product,
              quantity
            }}
          />

        </div>

      </div>

    </div>
  );
}
