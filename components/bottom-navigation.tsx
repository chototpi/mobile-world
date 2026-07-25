"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, User, MessageCircle, ShoppingCart } from "lucide-react";

export function BottomNavigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="flex items-center justify-around h-16">
        <Link
          href="/"
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            isActive("/")
              ? "text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Home className="w-6 h-6" />
          <span className="text-xs mt-1 font-medium">Home</span>
        </Link>

        <Link
          href="/chat-ai"
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            isActive("/chat-ai")
              ? "text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs mt-1 font-medium">ChatAI</span>
        </Link>

        <Link
          href="/cart"
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            isActive("/cart")
              ? "text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <div className="flex flex-col items-center justify-center">
            <ShoppingCart className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Cart</span>
          </div>
        </Link>

        <Link
          href="/account"
          className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
            isActive("/account")
              ? "text-blue-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <div className="flex flex-col items-center justify-center">
            <User className="w-6 h-6" />
            <span className="text-xs mt-1 font-medium">Account</span>            
          </div>
        </Link>
      </div>
    </nav>
  );
}
