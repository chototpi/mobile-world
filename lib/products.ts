export interface Product {

  id:string;

  name:string;

  category:string;

  price:number;

  image:string;

  description:string;

  longDescription?:string;

  specs:string[];

  rating?:number;

  reviews?:number;

  inStock:boolean;

  stockQuantity:number;

  status:
    |"active"
    |"hidden"
    |"out_of_stock";

  piProductId:string;
}

// ========================
// GET ALL PRODUCTS
// ========================

export async function getProducts(){

  try{

    const response =
      await fetch(
        "https://payofpi.click/payment-backend/api-proxy/products",
        {
          cache:"no-store"
        }
      );

    const data =
      await response.json();

    if(!data.success){

      return [];
    }

    return data.products||[];

  }catch(err){

    console.error(err);

    return [];
  }
}

// ========================
// GET PRODUCT BY ID
// ========================

export async function getProductById(
  id:string
){

  try{

    const response =
      await fetch(
        `https://payofpi.click/payment-backend/api-proxy/product/${id}`,
        {
          cache:"no-store"
        }
      );

    const data =
      await response.json();

    if(!data.success){

      return null;
    }

    return data.product;

  }catch(err){

    console.error(err);

    return null;
  }
}

// ========================
// SAMPLE PRODUCTS NOTE
// ========================
export const PRODUCT_NOTE = {
  PRODUCT_6a155c18c7847cbdb6b249ae: "6a155c18c7847cbdb6b249ae", //Donate
  PRODUCT_6a155debfa3b1ee2c324ed84: "6a155debfa3b1ee2c324ed84", //iphone 16 Pro Max
  PRODUCT_6a15623a2a04055026684475: "6a15623a2a04055026684475", //iPhone 17
  PRODUCT_6a1562d7bef6902fb7a4f177: "6a1562d7bef6902fb7a4f177", //Google Pixel 9 Pro
  PRODUCT_6a1562eb64271ad3b943857d: "6a1562eb64271ad3b943857d", //Google Pixel 9 Pro
  PRODUCT_6a15638f94ca185d23a62a04: "6a15638f94ca185d23a62a04", //iPhone 17 Pro Max
  PRODUCT_6a15642d470c2b9ca0fc4deb: "6a15642d470c2b9ca0fc4deb", //iPhone 17 256GB
  PRODUCT_6a156477a966576aa502003d: "6a156477a966576aa502003d", //Xiaomi 14 Ultra
  PRODUCT_6a156549f8aeaa6dae394631: "6a156549f8aeaa6dae394631", //iPhone 17 AIR
  PRODUCT_6a15671f1932de32dbd88aa4: "6a15671f1932de32dbd88aa4", //Samsung Galaxy S25
  PRODUCT_6a1567c5c55180f9408826f7: "6a1567c5c55180f9408826f7", //iPhone 15 Pro
  PRODUCT_6a1568524d25643a22e898c3: "6a1568524d25643a22e898c3", //iPhone 16 Pro
  PRODUCT_6a156a19b5557a0ed34c90e9: "6a156a19b5557a0ed34c90e9", //iPad AIR
  PRODUCT_6a156af017a981c65e8e01de: "6a156af017a981c65e8e01de", //Alienwave Aurora R16
  PRODUCT_6a156b9be783efa3d3a05418: "6a156b9be783efa3d3a05418", //Macbook Pro 14
  PRODUCT_6a156c11a0ef177b9b0142ca: "6a156c11a0ef177b9b0142ca", //Dell XPS 15
  PRODUCT_6a156cbe72f2e95790115824: "6a156cbe72f2e95790115824", //HP Omen 45L
  PRODUCT_6a156d32d31634642c3b3c8c: "6a156d32d31634642c3b3c8c", //HP Spectre x360
  PRODUCT_6a156e51fabbd094654b09a6: "6a156e51fabbd094654b09a6", //iMac M3
  PRODUCT_6a156ec1f19df818878f57ff: "6a156ec1f19df818878f57ff", //Lenovo Legion 9i
  PRODUCT_6a15751300197fdf40465e08: "6a15751300197fdf40465e08", //Logitech MX Master 3S
  PRODUCT_6a1575fb14bf0f43c8a54cb7: "6a1575fb14bf0f43c8a54cb7", //Macbook Pro 13
  PRODUCT_6a1576abe254f50dbcb92f6a: "6a1576abe254f50dbcb92f6a", //Sony WH-1000XM5
  PRODUCT_6a1577c2979704aacc7e846d: "6a1577c2979704aacc7e846d", //Mac Mini M2
  PRODUCT_6a1581a67c78e92f52c1c161: "6a1581a67c78e92f52c1c161", //Donate
  PRODUCT_6a19059c62f7427ab22d3a30: "6a19059c62f7427ab22d3a30", //Anker 737 Power Bank
} as const;

// ========================
// SAMPLE PRODUCTS FOR AI CHAT
// ========================

export const PRODUCTS_ARRAY: Product[] = [
  {
    id: "1",
    name: "iPhone 15 Pro",
    category: "smartphones",
    price: 999,
    image: "/placeholder.svg",
    description: "Latest iPhone with advanced camera system",
    specs: ["6.1\" display", "A17 Pro chip", "48MP camera", "Titanium design"],
    rating: 5,
    reviews: 1250,
    inStock: true,
    stockQuantity: 50,
    status: "active",
    piProductId: "iphone-15-pro"
  },
  {
    id: "2",
    name: "Samsung Galaxy S24",
    category: "smartphones",
    price: 899,
    image: "/placeholder.svg",
    description: "Flagship Samsung smartphone",
    specs: ["6.2\" display", "Snapdragon 8 Gen 3", "50MP camera", "120Hz refresh"],
    rating: 4.8,
    reviews: 980,
    inStock: true,
    stockQuantity: 45,
    status: "active",
    piProductId: "galaxy-s24"
  },
  {
    id: "3",
    name: "MacBook Pro 16",
    category: "laptops",
    price: 2499,
    image: "/placeholder.svg",
    description: "Powerful laptop for professionals",
    specs: ["M3 Max chip", "16GB RAM", "512GB SSD", "16\" Liquid Retina XDR"],
    rating: 4.9,
    reviews: 750,
    inStock: true,
    stockQuantity: 30,
    status: "active",
    piProductId: "macbook-pro-16"
  },
  {
    id: "4",
    name: "iPad Pro 12.9",
    category: "tablets",
    price: 1199,
    image: "/placeholder.svg",
    description: "Premium tablet for work and creativity",
    specs: ["12.9\" display", "M2 chip", "8GB RAM", "128GB storage"],
    rating: 4.7,
    reviews: 520,
    inStock: true,
    stockQuantity: 25,
    status: "active",
    piProductId: "ipad-pro-129"
  },
  {
    id: "5",
    name: "Dell XPS Desktop",
    category: "desktops",
    price: 1799,
    image: "/placeholder.svg",
    description: "High-performance desktop computer",
    specs: ["Intel i7 processor", "32GB RAM", "1TB SSD", "RTX 4070 GPU"],
    rating: 4.6,
    reviews: 380,
    inStock: true,
    stockQuantity: 20,
    status: "active",
    piProductId: "dell-xps-desktop"
  },
  {
    id: "6",
    name: "Apple Watch Series 9",
    category: "accessories",
    price: 399,
    image: "/placeholder.svg",
    description: "Advanced smartwatch for health and fitness",
    specs: ["Retina display", "Always-On", "ECG app", "50m water resistant"],
    rating: 4.5,
    reviews: 1100,
    inStock: true,
    stockQuantity: 60,
    status: "active",
    piProductId: "apple-watch-s9"
  },
  {
    id: "7",
    name: "Sony WH-1000XM5",
    category: "accessories",
    price: 379,
    image: "/placeholder.svg",
    description: "Premium noise-cancelling headphones",
    specs: ["Active noise cancellation", "40-hour battery", "LDAC", "Touch controls"],
    rating: 4.8,
    reviews: 2200,
    inStock: true,
    stockQuantity: 40,
    status: "active",
    piProductId: "sony-wh1000xm5"
  },
  {
    id: "8",
    name: "Logitech MX Master 3S",
    category: "accessories",
    price: 99,
    image: "/placeholder.svg",
    description: "Advanced wireless mouse",
    specs: ["8K DPI", "Customizable buttons", "Quiet clicks", "USB-C charging"],
    rating: 4.7,
    reviews: 890,
    inStock: true,
    stockQuantity: 70,
    status: "active",
    piProductId: "logitech-mxm3s"
  },
  {
    id: "9",
    name: "Lenovo ThinkPad X1",
    category: "laptops",
    price: 1299,
    image: "/placeholder.svg",
    description: "Business laptop for professionals",
    specs: ["14\" display", "Intel Core i7", "16GB RAM", "512GB SSD"],
    rating: 4.6,
    reviews: 640,
    inStock: true,
    stockQuantity: 35,
    status: "active",
    piProductId: "lenovo-x1"
  },
  {
    id: "10",
    name: "Samsung Galaxy Tab S9",
    category: "tablets",
    price: 849,
    image: "/placeholder.svg",
    description: "Android tablet with premium display",
    specs: ["11\" display", "Snapdragon 8 Gen 2", "8GB RAM", "120Hz AMOLED"],
    rating: 4.5,
    reviews: 450,
    inStock: true,
    stockQuantity: 28,
    status: "active",
    piProductId: "galaxy-tab-s9"
  }
];
