"use client";

import { useState,useEffect } from "react";
import Link from "next/link";
import { ArrowLeft,Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BottomNavigation } from "@/components/bottom-navigation";
import { usePiAuth } from "@/contexts/pi-auth-context";

const API_URL=
  "https://payofpi.click/payment-backend/api-proxy/update-user";

const GET_USER_API=
  "https://payofpi.click/payment-backend/api-proxy/get-user";

const COUNTRIES=[
  "Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand",
  "Tunisia","Turkey","Uganda","Ukraine","United Arab Emirates","United Kingdom",
  "United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe"
];

const adminUsers = [
  "thaibinh1985",
  "hanni84dn",
  ];

export default function SettingsPage(){

  const { isAuthenticated, username }=
    usePiAuth();

  const isAdmin =
  adminUsers.includes(username||"");

  const [isLoading,setIsLoading]=
    useState(false);

  const [isSaved,setIsSaved]=
    useState(false);

  const [error,setError]=
    useState("");

  const [showForm,setShowForm]=
    useState(false);

  const [userInfo,setUserInfo]=
    useState<any>(null);

  const [formData,setFormData]=
    useState({
      fullName:"",
      phoneNumber:"",
      email:"",
      country:"",
      address:"",
    });

  // load user
  useEffect(()=>{

    async function loadUser(){

      try{

        const username=
          localStorage.getItem(
            "pi_username"
          );

        if(!username) return;

        const response=
          await fetch(
            `${GET_USER_API}?username=${username}`
          );

        const data=
          await response.json();

        if(
          data.success&&
          data.user
        ){

          setUserInfo(
            data.user
          );

          setFormData({
            fullName:
              data.user.full_name||"",

            phoneNumber:
              data.user.phone||"",

            email:
              data.user.email||"",

            country:
              data.user.country||"",

            address:
              data.user.shipping_address||"",
          });
        }

      }catch(err){

        console.error(err);
      }
    }

    loadUser();

  },[]);

  // input change
  const handleChange=(e:any)=>{

    const {name,value}=
      e.target;

    setFormData(prev=>({
      ...prev,
      [name]:value,
    }));
  };

  // submit
  const handleSubmit=async(
    e:React.FormEvent
  )=>{

    e.preventDefault();

    setIsLoading(true);
    setError("");
    setIsSaved(false);

    try{

      if(
        !formData.fullName||
        !formData.phoneNumber||
        !formData.email||
        !formData.country||
        !formData.address
      ){

        throw new Error(
          "Please fill in all fields"
        );
      }

      const emailRegex=
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if(
        !emailRegex.test(
          formData.email
        )
      ){

        throw new Error(
          "Invalid email address"
        );
      }

      const uid=
        localStorage.getItem(
          "uid"
        );

      const username=
        localStorage.getItem(
          "pi_username"
        );

      if(!uid||!username){

        throw new Error(
          "User not logged in"
        );
      }

      const response=
        await fetch(
          API_URL,
          {
            method:"POST",

            headers:{
              "Content-Type":
                "application/json",
            },

            body:JSON.stringify({
              uid,
              username,
              full_name:
                formData.fullName,

              phone:
                formData.phoneNumber,

              email:
                formData.email,

              country:
                formData.country,

              shipping_address:
                formData.address,
            }),
          }
        );
        const data=
        await response.json();

      if(!data.success){

        throw new Error(
          data.error||
          "Save failed"
        );
      }

      setUserInfo({
        uid,
        username,
        full_name:
          formData.fullName,
        phone:
          formData.phoneNumber,
        email:
          formData.email,
        country:
          formData.country,
        shipping_address:
          formData.address,
      });

      localStorage.setItem(
        "userSettings",
        JSON.stringify(formData)
      );

      setShowForm(false);

      setIsSaved(true);

      setTimeout(()=>{

        setIsSaved(false);

      },3000);

    }catch(err:any){

      setError(
        err.message||
        "Save failed"
      );

    }finally{

      setIsLoading(false);
    }
  };

  return(
    <div className="min-h-screen bg-background pb-20 flex flex-col">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">

        <div className="px-4 py-4 flex items-center gap-3">

          <Link href="/">
            <Button
              variant="ghost"
              size="icon"
            >
              <ArrowLeft className="w-5 h-5"/>
            </Button>
          </Link>

          <h1 className="text-xl font-bold text-black-600">
            Account Information
          </h1>

        </div>

      </header>

      {/* Main */}
      <main className="px-4 py-6 flex-1">

        {/* User Info */}
        {userInfo&&(
          <Card className="p-6 mb-4">

            <h2 className="text-lg font-bold mb-4">
              User Information
            </h2>

            <div className="space-y-3 text-sm">

              <div>
                <span className="font-semibold">
                  Full Name:
                </span>

                <p className="text-gray-600">
                  {userInfo.full_name||"-"}
                </p>
              </div>

              <div>
                <span className="font-semibold">
                  Phone:
                </span>

                <p className="text-gray-600">
                  {userInfo.phone||"-"}
                </p>
              </div>

              <div>
                <span className="font-semibold">
                  Email:
                </span>

                <p className="text-gray-600 break-all">
                  {userInfo.email||"-"}
                </p>
              </div>

              <div>
                <span className="font-semibold">
                  Country:
                </span>

                <p className="text-gray-600">
                  {userInfo.country||"-"}
                </p>
              </div>

              <div>
                <span className="font-semibold">
                  Address:
                </span>

                <p className="text-gray-600">
                  {userInfo.shipping_address||"-"}
                </p>
              </div>

            </div>        
            
            <div>
            <Button
              className="w-full mt-5"
              onClick={()=>
                setShowForm(!showForm)
              }
            >
              Update Information
            </Button>
            
            {isAdmin&&(
            <Button className="w-full mt-5" asChild>
            <Link href="/manager">
              Application Management
            </Link>
            </Button>
            )}
            </div>
          </Card>
        )}

        {/* Form */}
        {(!userInfo||showForm)&&(
          <Card className="p-6">

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              <div>
                <label className="block text-sm font-medium mb-2">
                  Full Name *
                </label>

                <Input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Phone Number *
                </label>

                <Input
                  type="tel"
                  name="phoneNumber"
                  placeholder="Enter your phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Email *
                </label>

                <Input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Country *
                </label>

                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                >

                  <option value="">
                    Select country
                  </option>

                  {COUNTRIES.map(country=>(
                    <option
                      key={country}
                      value={country}
                    >
                      {country}
                    </option>
                  ))}

                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Delivery Address *
                </label>

                <textarea
                  name="address"
                  placeholder="Enter your address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background resize-none"
                />
              </div>

              {error&&(
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {isSaved&&(
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
                  Saved successfully!
                </div>
              )}

              <Button
                type="submit"
                disabled={
                  isLoading||
                  !isAuthenticated
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >

                {isLoading?(
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                    Saving...
                  </>
                ):(
                  "Save Information"
                )}

              </Button>

            </form>

          </Card>
        )}

      </main>

      <BottomNavigation/>

    </div>
  );
}
