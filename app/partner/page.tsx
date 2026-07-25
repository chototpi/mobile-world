"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, LogOut, Store, TrendingUp, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { BottomNavigation } from "@/components/bottom-navigation";
import { usePiAuth } from "@/contexts/pi-auth-context";
import Link from "next/link";

interface PartnerProduct{
  id:string;
  name:string;
  category:string;
  price:number;
  image:string;
  description:string;
  specs:string[];
  inStock:boolean;
  stockQuantity:number;
  createdAt:string;
}

interface PartnerProfile{
  uid:string;
  username:string;
  name:string;
  phone:string;
  email:string;
  country:string;
  address:string;
  status:string;
  kyc:string;
}

const CATEGORIES=[
  "Smartphones",
  "Tablets",
  "Laptops",
  "Desktops",
  "Accessories",
];

export default function PartnerPage(){

  const {
    isAuthenticated,
    username
  } = usePiAuth();

  const [
    isRegistered,
    setIsRegistered
  ] = useState(false);

  const [
    partnerProfile,
    setPartnerProfile
  ] = useState<PartnerProfile|null>(
    null
  );

  const [
    products,
    setProducts
  ] = useState<PartnerProduct[]>(
    []
  );

  const [
    isLoading,
    setIsLoading
  ] = useState(true);

  const [
    isModalOpen,
    setIsModalOpen
  ] = useState(false);

  const [
    editingProduct,
    setEditingProduct
  ] = useState<PartnerProduct|null>(
    null
  );

  const [
    showSignup,
    setShowSignup
  ] = useState(false);

  // form state
  const [
    formData,
    setFormData
  ] = useState({

    businessName:"",

    email:"",

    phone:"",

    country:"",

    address:"",
  });

  const [
    productForm,
    setProductForm
  ] = useState({

    name:"",

    category:"Smartphones",

    price:"",

    image:"",

    description:"",

    specs:"",

    stockQuantity:"",
  });

  // load partner
  useEffect(()=>{

    loadPartnerData();

  },[username]);

  const loadPartnerData =
    async()=>{

      try{

        setIsLoading(true);

        if(!username){

          setIsLoading(false);

          return;
        }

        const response =
          await fetch(
            `https://payofpi.click/payment-backend/api-proxy/get-partner?username=${encodeURIComponent(username)}`
          );

        const data =
          await response.json();

        if(
          data.success &&
          data.partner
        ){

          setPartnerProfile({

            uid:
              data.partner.uid,

            username:
              data.partner.username,

            name:
              data.partner.name,

            phone:
              data.partner.phone,

            email:
              data.partner.email,

            country:
              data.partner.country,

            address:
              data.partner.address,

            status:
              data.partner.status,

            kyc:
              data.partner.kyc,
          });

          setIsRegistered(
            true
          );

          // load partner products
          const productsResponse =
          await fetch(
            `https://payofpi.click/payment-backend/api-proxy/partner-products?username=${encodeURIComponent(username)}`
            );

          const productsData =
          await productsResponse.json();

          if(productsData.success){

          setProducts(
            productsData.products||[]
            );
          }

        }else{

          setIsRegistered(
            false
          );
        }

      }catch(error){

        console.error(
          "Error loading partner:",
          error
        );

      }finally{

        setIsLoading(false);
      }
    };

  const handlePartnerSignup =
  async(
    e:React.FormEvent
  )=>{

    e.preventDefault();

    try{

      if(!username){

        alert(
          "Please log in with Pi Network first"
        );

        return;
      }

      if(
        !formData.businessName||
        !formData.email||
        !formData.phone
      ){

        alert(
          "Please fill in all required fields"
        );

        return;
      }

      const uid =
        localStorage.getItem(
          "uid"
        );

      const response =
        await fetch(
          "https://payofpi.click/payment-backend/api-proxy/save-partner",
          {
            method:"POST",

            headers:{
              "Content-Type":
                "application/json"
            },

            body:JSON.stringify({

              uid,

              username,

              name:
                formData.businessName,

              phone:
                formData.phone,

              email:
                formData.email,

              country:
                formData.country,

              address:
                formData.address,
            })
          }
        );

      const data =
        await response.json();

      if(!data.success){
        throw new Error(
          data.error||
          "Register failed"
        );
      }

      const newProfile = {
        uid,
        username,
        name:
          formData.businessName,
        phone:
          formData.phone,
        email:
          formData.email,
        country:
          formData.country,
        address:
          formData.address,
        status:"pending",
        kyc:"unverified",
      };

      setPartnerProfile(
        newProfile
      );

      setIsRegistered(
        true
      );

      setShowSignup(
        false
      );

      setFormData({
        businessName:"",
        email:"",
        phone:"",
        country:"",
        address:"",
      });

      alert(
        "Partner registration successful"
      );

    }catch(err:any){
      console.error(err);
      alert(
        err.message||
        "Register failed"
      );
    }
  };

  const handleAddProduct =
  async(
    e:React.FormEvent
  )=>{

    e.preventDefault();

    try{

      if(
        !productForm.name||
        !productForm.price||
        !productForm.stockQuantity
      ){

        alert(
          "Please fill in all required fields"
        );

        return;
      }

      if(!username){

        alert(
          "Please login first"
        );

        return;
      }

      const payload = {

        id:
          editingProduct?.id ||
          `partner_${Date.now()}`,

        name:
          productForm.name,

        category:
          productForm.category,

        price:
          parseFloat(
            productForm.price
          ),

        image:
          productForm.image,

        description:
          productForm.description,

        long_description:
          productForm.description,

        specs:
          productForm.specs
            .split(",")

            .map(
              (s)=>s.trim()
            )

            .filter(
              (s)=>s
            ),

        stock_quantity:
          parseInt(
            productForm.stockQuantity
          ),

        in_stock:
          parseInt(
            productForm.stockQuantity
          )>0,

        status:"pending",

        username,
        uid:
          localStorage.getItem("uid"),
      };

      const response =
        await fetch(
          "https://payofpi.click/payment-backend/api-proxy/save-product",
          {
            method:"POST",

            headers:{
              "Content-Type":
                "application/json"
            },

            body:JSON.stringify(
              payload
            )
          }
        );

      const data =
        await response.json();

      if(!data.success){

        throw new Error(
          data.error||
          "Save product failed"
        );
      }

      const newProduct:PartnerProduct={

        id:
          payload.id,

        name:
          payload.name,

        category:
          payload.category,

        price:
          payload.price,

        image:
          payload.image,

        description:
          payload.description,

        specs:
          payload.specs,

        inStock:
          payload.in_stock,

        stockQuantity:
          payload.stock_quantity,

        createdAt:
          editingProduct?.createdAt||
          new Date().toISOString(),
      };

      let updatedProducts;

      if(editingProduct){

        updatedProducts =
          products.map(
            (p)=>
              p.id===
              editingProduct.id
              ?newProduct
              :p
          );

      }else{

        updatedProducts = [
          ...products,
          newProduct
        ];
      }

      setProducts(
        updatedProducts
      );

      setIsModalOpen(
        false
      );

      setEditingProduct(
        null
      );

      resetProductForm();

      alert(
        editingProduct
          ?"Product updated"
          :"Product added"
          );

    }catch(err:any){

      console.error(err);

      alert(
        err.message||
        "Save product failed"
      );
    }
  };

  const resetProductForm =
  ()=>{

    setProductForm({

      name:"",

      category:"Smartphones",

      price:"",

      image:"",

      description:"",

      specs:"",

      stockQuantity:"",
    });
  };

  const handleEditProduct =
  (
    product:PartnerProduct
  )=>{

    setEditingProduct(
      product
    );

    setProductForm({

      name:
        product.name,

      category:
        product.category,

      price:
        product.price.toString(),

      image:
        product.image,

      description:
        product.description,

      specs:
        product.specs.join(
          ", "
        ),

      stockQuantity:
        product.stockQuantity.toString(),
    });

    setIsModalOpen(
      true
    );
  };

  const handleDeleteProduct =
  async(
    productId:string
  )=>{
    try{
      if(
        !confirm(
          "Are you sure you want to delete this product?"
        )
      ){
        return;
      }

      const response =
        await fetch(
          `https://payofpi.click/payment-backend/api-proxy/delete-product/${productId}`,
          {
            method:"DELETE"
          }
        );

      const data =
        await response.json();

      if(!data.success){
        throw new Error(
          data.error||
          "Delete failed"
        );
      }

      const updatedProducts =
        products.filter(
          (p)=>
            p.id!==productId
        );

      setProducts(
        updatedProducts
      );

      alert(
        "Product deleted"
      );

    }catch(err:any){
      console.error(err);

      alert(
        err.message||
        "Delete failed"
      );
    }
  };

  const handleLogout =
  async()=>{
    try{
      if(
        !confirm(
          "Are you sure you want to unregister as a partner?"
        )
      ){
        return;
      }

      setIsRegistered(
        false
      );

      setPartnerProfile(
        null
      );

      setProducts([]);

      alert(
        "Partner account removed"
      );

    }catch(err){
      console.error(err);
    }
  };

  if(isLoading){

  return(
    <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
      <p className="text-gray-500">
        Loading...
      </p>
    </div>
  );
}

// signup screen
if(
  !isRegistered &&
  isAuthenticated
){

  return(
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-blue-600">
            Partner Program
          </h1>
          <p className="text-sm text-gray-600">
            Become a seller
          </p>
        </div>

      </header>

      <main className="flex-1 px-4 py-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-blue-50 rounded-lg p-6 mb-6 text-center">
            <Store className="w-12 h-12 text-blue-600 mx-auto mb-4"/>
            <h2 className="text-xl font-bold mb-2">
              Start Selling Today
            </h2>
            <p className="text-gray-600 text-sm">
              Join our partner network and start selling products with Pi payments.
            </p>
          </div>

          <form
            onSubmit={handlePartnerSignup}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-2">
                Business Name *
              </label>
              <Input
                type="text"
                placeholder="Your business name"
                value={formData.businessName}
                onChange={(e)=>
                  setFormData({
                    ...formData,
                    businessName:e.target.value
                  })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Email *
              </label>
              <Input
                type="email"
                placeholder="business@example.com"
                value={formData.email}
                onChange={(e)=>
                  setFormData({
                    ...formData,
                    email:e.target.value
                  })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Phone *
              </label>
              <Input
                type="tel"
                placeholder="+84..."
                value={formData.phone}
                onChange={(e)=>
                  setFormData({
                    ...formData,
                    phone:e.target.value
                  })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Country *
              </label>
              <Input
                type="text"
                placeholder="Vietnam"
                value={formData.country}
                onChange={(e)=>
                  setFormData({
                    ...formData,
                    country:e.target.value
                  })
                }
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Address *
              </label>
              <Textarea
                placeholder="Business address"
                value={formData.address}
                onChange={(e)=>
                  setFormData({
                    ...formData,
                    address:e.target.value
                  })
                }
                rows={3}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
            >
              Complete Registration
            </Button>
          </form>
        </div>
        </main>
      <BottomNavigation/>
    </div>
  );
}

// dashboard
if(
  isRegistered &&
  partnerProfile
){

  return(
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-xl font-bold text-blue-600">
                {partnerProfile.name}
              </h1>
              <p className="text-sm text-gray-600">
                Partner Dashboard
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2"/>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 space-y-4">

        {/* stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Products
                </p>
                <p className="text-2xl font-bold">
                  {products.length}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-600"/>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  Status
                </p>
                <p className="text-lg font-bold capitalize">
                  {partnerProfile.status}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600"/>
            </div>
          </Card>
        </div>
        {/* add product */}
        <Dialog
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        >
          <DialogTrigger asChild>
            <Button
              onClick={()=>{
                resetProductForm();
                setEditingProduct(null);
              }}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2"/>
              Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProduct
                  ?"Edit Product"
                  :"Add New Product"}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleAddProduct}
              className="space-y-4"
            >
              <Input
                type="text"
                placeholder="Product name"
                value={productForm.name}
                onChange={(e)=>
                  setProductForm({
                    ...productForm,
                    name:e.target.value
                  })
                }
                required
              />
              <select
                value={productForm.category}
                onChange={(e)=>
                  setProductForm({
                    ...productForm,
                    category:e.target.value
                  })
                }
                className="w-full px-3 py-2 border rounded-lg"
              >
                {CATEGORIES.map((cat)=>(
                  <option
                    key={cat}
                    value={cat}
                  >
                    {cat}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                placeholder="Price"
                value={productForm.price}
                onChange={(e)=>
                  setProductForm({
                    ...productForm,
                    price:e.target.
                    value
                  })
                }
                required
              />
              <Input
                type="number"
                placeholder="Stock quantity"
                value={productForm.stockQuantity}
                onChange={(e)=>
                  setProductForm({
                    ...productForm,
                    stockQuantity:e.target.value
                  })
                }
                required
              />
              <Input
                type="text"
                placeholder="Image URL"
                value={productForm.image}
                onChange={(e)=>
                  setProductForm({
                    ...productForm,
                    image:e.target.value
                  })
                }
              />
              <Textarea
                placeholder="Description"
                value={productForm.description}
                onChange={(e)=>
                  setProductForm({
                    ...productForm,
                    description:e.target.value
                  })
                }
                rows={3}
              />
              <Textarea
                placeholder="Specs separated by commas"
                value={productForm.specs}
                onChange={(e)=>
                  setProductForm({
                    ...productForm,
                    specs:e.target.value
                  })
                }
                rows={3}
              />
              <Button
                type="submit"
                className="w-full"
              >
                {editingProduct
                  ?"Update Product"
                  :"Add Product"}

              </Button>
            </form>
          </DialogContent>
        </Dialog>

         {/* partner info */}
        <Card className="p-4 bg-gray-50">
          <h3 className="font-semibold mb-3">
            Partner Information
          </h3>
          <div className="space-y-2 text-sm">

            <div>
              <span className="text-gray-600">
                Username:
              </span>
              <span className="font-medium ml-2">
                {partnerProfile.username}
              </span>
            </div>

            <div>
              <span className="text-gray-600">
                Email:
              </span>
              <span className="font-medium ml-2">
                {partnerProfile.email}
              </span>
            </div>

            <div>
              <span className="text-gray-600">
                Phone:
              </span>
              <span className="font-medium ml-2">
                {partnerProfile.phone}
              </span>
            </div>

            <div>
              <span className="text-gray-600">
                Country:
              </span>
              <span className="font-medium ml-2">
                {partnerProfile.country}
              </span>
            </div>

            <div>
              <span className="text-gray-600">
                Address:
              </span>
              <span className="font-medium ml-2">
                {partnerProfile.address}
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <Badge>
                {partnerProfile.status}
              </Badge>
              <Badge variant="outline">
                KYC:
                {" "}
                {partnerProfile.kyc}
              </Badge>
            </div>
          </div>
        </Card>

        {/* products */}
        <div>
          <h2 className="text-lg font-semibold mb-3">
            My Products
          </h2>
          {products.length===0?(
            <Card className="p-6 text-center">
              <Package className="w-10 h-10 text-gray-300 mx-auto mb-3"/>
              <p className="text-gray-500">
                No products yet
              </p>
            </Card>
          ):(
            <div className="space-y-3">
              {products.map((product)=>(
                <Card
                  key={product.id}
                  className="p-3"
                >
                  <div className="flex gap-3">
                    <img
                      src={product.image}
                      className="w-20 h-20 rounded-lg object-cover bg-gray-100"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {product.category}
                          </p>
                        </div>

                        <Badge>
                          {product.stockQuantity>0
                            ?"In Stock"
                            :"Out"}
                        </Badge>
                      </div>

                      <p className="text-blue-600 font-bold mt-2">
                        Π {product.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={()=>
                        handleEditProduct(product)
                      }
                      className="flex-1"
                    >
                      <Edit2 className="w-3 h-3 mr-1"/>
                      Edit
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={()=>
                        handleDeleteProduct(product.id)
                      }
                      className="flex-1 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3 mr-1"/>
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <BottomNavigation/>
    </div>
  );
}

// not authenticated
return(
  <div className="min-h-screen bg-background pb-20 flex flex-col">
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="px-4 py-4">
        <h1 className="text-xl font-bold text-blue-600">
          Partner Program
        </h1>
      </div>
    </header>

    <main className="flex-1 px-4 py-6 flex flex-col items-center justify-center">
      <Card className="p-6 text-center max-w-md">
        <Store className="w-12 h-12 text-blue-600 mx-auto mb-4"/>
        <h2 className="text-lg font-bold mb-2">
          Join Partner Program
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          Please log in with Pi Network to become a partner.
        </p>
      </Card>
    </main>
    <BottomNavigation/>
  </div>
);
}
