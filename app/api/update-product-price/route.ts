import { NextRequest, NextResponse } from "next/server";

// Store product prices override in memory (in production, use a database)
const priceOverrides: Record<string, number> = {
  "6a05ac760bd4bc57156c9332": 9.0, // iPad Air
};

export async function POST(request: NextRequest) {
  try {
    const { productId, price } = await request.json();

    if (!productId || price === undefined) {
      return NextResponse.json(
        { error: "productId and price are required" },
        { status: 400 }
      );
    }

    priceOverrides[productId] = price;
    console.log(`[v0] Updated price for product ${productId} to ${price}`);

    return NextResponse.json(
      { success: true, productId, price },
      { status: 200 }
    );
  } catch (error) {
    console.error("[v0] Error updating product price:", error);
    return NextResponse.json(
      { error: "Failed to update price" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get("productId");

  if (!productId) {
    return NextResponse.json(priceOverrides, { status: 200 });
  }

  const overridePrice = priceOverrides[productId];
  return NextResponse.json(
    { productId, price: overridePrice || null },
    { status: 200 }
  );
}
