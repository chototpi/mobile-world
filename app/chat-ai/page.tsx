"use client";

"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Loader } from "lucide-react";
import Link from "next/link";
import { BottomNavigation } from "@/components/bottom-navigation";
import { PRODUCTS_ARRAY } from "@/lib/products";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "@/hooks/use-toast";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export default function ChatAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your Mobile World AI Assistant. How can I help you today? You can ask me about our products, pricing, shipping, or anything else!",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateAIResponse(input),
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setLoading(false);
    }, 800);
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    // Helper functions
    const searchProducts = (query: string): any[] => {
      return PRODUCTS_ARRAY.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query)
      );
    };

    const formatProductList = (products: any[], limit = 3): string => {
      if (products.length === 0) return "";
      const limited = products.slice(0, limit);
      return limited
        .map((p) => `${p.name} (Π ${p.price.toFixed(2)})`)
        .join(", ");
    };

    // Category-based queries
    if (input.includes("phone") || input.includes("iphone") || input.includes("samsung") || input.includes("smartphone")) {
      const phones = searchProducts("smartphones");
      if (phones.length > 0) {
        return `We have ${phones.length} great smartphones in stock! Popular options include: ${formatProductList(phones)}. All rated highly by our customers. Would you like to know more about any specific model?`;
      }
    }

    if (input.includes("laptop") || input.includes("computer") || input.includes("macbook")) {
      const laptops = searchProducts("laptops");
      if (laptops.length > 0) {
        return `We have ${laptops.length} excellent laptops available: ${formatProductList(laptops)}. Perfect for work and creativity. Would you like specs or pricing details?`;
      }
    }

    if (input.includes("tablet") || input.includes("ipad")) {
      const tablets = searchProducts("tablets");
      if (tablets.length > 0) {
        return `We offer ${tablets.length} premium tablets: ${formatProductList(tablets)}. Great for work and entertainment. Interested in any of these?`;
      }
    }

    if (input.includes("desktop") || input.includes("imac")) {
      const desktops = searchProducts("desktops");
      if (desktops.length > 0) {
        return `We have ${desktops.length} powerful desktops: ${formatProductList(desktops)}. Perfect for professional work and gaming. Want to learn more?`;
      }
    }

    if (input.includes("accessory") || input.includes("watch") || input.includes("headphone") || input.includes("keyboard") || input.includes("mouse")) {
      const accessories = searchProducts("accessories");
      if (accessories.length > 0) {
        return `We have ${accessories.length} quality accessories available: ${formatProductList(accessories)}. Everything from smartwatches to keyboards and headphones. What are you looking for?`;
      }
    }

    // Search for specific product by name
    const searchTerm = input.replace(/tell me about|what is|show me|find|search|get|product/gi, "").trim();
    if (searchTerm.length > 2) {
      const products = searchProducts(searchTerm);
      if (products.length > 0) {
        const product = products[0];
        return `Great! We have the ${product.name} in stock at Π ${product.price.toFixed(2)}. It features: ${product.specs.join(", ")}. Rating: ${product.rating}/5 from ${product.reviews} reviews. Would you like to add it to your cart?`;
      }
    }

    // Price and payment queries
    if (input.includes("price") || input.includes("cost") || input.includes("how much")) {
      const inStock = PRODUCTS_ARRAY.filter((p) => p.inStock).length;
      return `All our prices are displayed in Pi coin (Π). We have ${inStock} products in stock with competitive pricing. Browse our catalog or ask me about specific products you're interested in!`;
    }

    if (input.includes("pi") || input.includes("payment")) {
      return "We accept Pi coin for all purchases! It's fast, secure, and convenient. You can checkout with your Pi Network wallet at any time.";
    }

    // Category listing
    if (input.includes("category") || input.includes("categories")) {
      const categories = [...new Set(PRODUCTS_ARRAY.map((p) => p.category))];
      return `We have products in these categories: ${categories.join(", ")}. Ask me about any category you're interested in!`;
    }

    // Shipping and delivery
    if (input.includes("ship") || input.includes("delivery")) {
      return "We offer fast shipping options. Most orders are processed within 24 hours. Delivery times depend on your location. Ask me for more details!";
    }

    // General help
    if (input.includes("help") || input.includes("hello") || input.includes("hi")) {
      return "Hi there! I'm happy to help! You can ask me about our products, prices, shipping, or browse our catalog. We have Smartphones, Laptops, Tablets, Desktops, and Accessories. What would you like to know?";
    }

    // Default response
    return "Great question! I can help with product information, pricing, and orders. We have a wide selection of electronics available. Could you tell me more about what you're looking for, or ask about a specific product category?";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="flex items-center gap-4 px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-bold">ChatAI Assistant</h1>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 pb-24">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                message.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-100 text-gray-900 rounded-bl-none"
              }`}
            >
              <p className="text-sm">{message.text}</p>
              <span className="text-xs mt-1 opacity-70 block">
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 rounded-lg rounded-bl-none px-4 py-3 flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              <span className="text-sm">AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t px-4 py-3">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            type="text"
            placeholder="Ask me about products, prices..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={loading || !input.trim()}
            size="icon"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
      <BottomNavigation />
    </div>
  );
}
