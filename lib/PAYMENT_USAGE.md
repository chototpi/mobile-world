# SDKLite Payment, Ads & User State — AI Tutorial

## Overview

The SDK instance (`sdk`) is available via `usePiAuth()` after authentication. This document covers how to use it for purchases, ads, and per-user state. All methods below assume the user is already logged in.

\`\`\`typescript
import { usePiAuth } from "@/contexts/pi-auth-context";

const { sdk } = usePiAuth();
\`\`\`

Convenience hooks are available in `lib/pi-payment.ts`: `usePurchase()`, `useAds()`, `useUserState()`.

---

## Integration Points in Mobile World App

### 1. Home Page (`app/page.tsx`)
- **Buy Now Button**: Each product card has a "Buy" button that triggers direct Pi payment
- **Add to Cart**: Cart button for batch purchasing via checkout
- Uses `usePurchase()` hook and `handleBuyNow()` function

### 2. Product Detail Page (`app/product/[id]/page.tsx`)
- **Buy Now Button**: Full-featured purchase button with product information
- **Quantity Selection**: Users can select quantity before purchasing
- Shows transaction confirmation on success

### 3. Checkout Page (`app/checkout/page.tsx`)
- **Pi Coin Payment Option**: Primary payment method
- **Order Summary**: Shows all items and total amount
- **Batch Purchase**: Processes multiple items in one transaction
- Clears cart and redirects to purchase success page

### 4. Purchase Success Page (`app/purchase-success/page.tsx`)
- **Transaction Confirmation**: Displays transaction ID and amount
- **Order Navigation**: Links to continue shopping or view orders

---

## Purchases

Use the App Studio product **slug** as the `productId` argument (e.g. `iphone-15-pro-pi`, `galaxy-s24-pi`). SDKLite creates a server-side offer, runs the Pi payment flow, and handles approve/complete automatically.

### Via Hook

\`\`\`typescript
import { usePurchase } from "@/lib/pi-payment";
import { useRouter } from "next/navigation";

function BuyButton({ product }) {
  const router = useRouter();
  const { makePurchase } = usePurchase();
  const [isLoading, setIsLoading] = useState(false);

  const handleBuy = async () => {
    setIsLoading(true);
    try {
      const result = await makePurchase(product.productId);
      if (result.transactionId) {
        router.push(
          \`/purchase-success?transaction=\${result.transactionId}&product=\${product.name}&amount=\${product.price}\`
        );
      }
    } catch (error) {
      alert(\`Purchase failed: \${error instanceof Error ? error.message : "Unknown error"}\`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button onClick={handleBuy} disabled={isLoading}>
      {isLoading ? "Processing..." : "Buy Now"}
    </button>
  );
}
\`\`\`

### Via SDK Directly

\`\`\`typescript
const { sdk } = usePiAuth();
const result = await sdk.makePurchase("iphone-15-pro-pi");
if (result.transactionId) {
  console.log("Purchase successful:", result.transactionId);
}
\`\`\`

### PurchaseResult

Returned on success from `makePurchase()`:

- `transactionId` (`string`) — Pi payment transaction identifier
- `paymentId` (`string`) — alternative payment identifier
- Additional metadata from Pi Network response

### Purchase Errors

\`\`\`typescript
try {
  await sdk.makePurchase("iphone-15-pro-pi");
} catch (error) {
  if (error instanceof Error) {
    console.error("Purchase failed:", error.message);
    // Handle error gracefully
  }
}
\`\`\`

Common error scenarios:
- **User not authenticated**: Check `usePiAuth()` returns authenticated state
- **Invalid product ID**: Ensure product slug matches App Studio catalog
- **User cancelled**: Handle gracefully without error message
- **Network error**: Prompt user to retry

---

## Checkout Flow Example

\`\`\`typescript
// Cart page - show items and total
const handleCheckout = async () => {
  router.push("/checkout");
};

// Checkout page - process payment
const handlePiPayment = async () => {
  setIsProcessing(true);
  try {
    const firstItem = cart[0];
    const result = await makePurchase(firstItem.productId);
    if (result.transactionId) {
      localStorage.setItem("cart", JSON.stringify([]));
      router.push(
        \`/purchase-success?transaction=\${result.transactionId}&amount=\${total.toFixed(2)}&items=\${cart.length}\`
      );
    }
  } catch (error) {
    alert(\`Payment failed: \${error instanceof Error ? error.message : "Unknown error"}\`);
    setIsProcessing(false);
  }
};
\`\`\`

---

## Ads

Ads are not available in all environments. Always check \`isAdNetworkSupported()\` before showing ads. Both \`showInterstitial()\` and \`showRewarded()\` return \`false\` on failure and **do not throw**.

### Check Ad Support

\`\`\`typescript
const supported = await sdk.isAdNetworkSupported();
if (!supported) {
  // hide ad buttons or skip ad logic
}
\`\`\`

### Interstitial Ads

Full-screen ads shown between content. No reward is granted.

\`\`\`typescript
import { useAds } from "@/lib/pi-payment";

const { isAdNetworkSupported, showInterstitial } = useAds();

async function showBreakAd() {
  if (!(await isAdNetworkSupported())) return;
  const closed = await showInterstitial();
  if (closed) {
    // user closed the ad — continue app flow
  }
}
\`\`\`

Returns \`true\` if the ad was shown and closed normally, \`false\` otherwise.

### Rewarded Ads

User watches an ad in exchange for an in-app reward. Pass the product slug that represents the reward (must exist in App Studio product catalog).

\`\`\`typescript
import { useAds } from "@/lib/pi-payment";

const { isAdNetworkSupported, showRewarded } = useAds();

async function watchAdForReward() {
  if (!(await isAdNetworkSupported())) {
    showMessage("Ads not available.");
    return;
  }
  const rewarded = await showRewarded("extra_life");
  if (rewarded) {
    grantExtraLife();
    showMessage("Reward granted!");
  } else {
    showMessage("Could not verify reward. Try again.");
  }
}
\`\`\`

Returns \`true\` only when the backend confirms the reward was granted. SDKLite retries the verification up to 3 times (1 second apart) before returning \`false\`.

---

## User State

SDKLite provides \`sdk.state\` for persisting per-user data and managing purchase balances. All state methods require the user to be logged in and throw plain \`Error\` on auth or backend failure.

### Restore Purchase Balances

Call on app load to get all unconsumed purchase quantities:

\`\`\`typescript
import { useUserState } from "@/lib/pi-payment";

const { restore } = useUserState();

async function onAppLoad() {
  const { purchases } = await restore();
  for (const p of purchases) {
    updateInventoryUI(p.productId, p.quantity);
  }
}
\`\`\`

Each item in \`purchases\`:
- \`productId\` (\`string\`) — the product slug
- \`quantity\` (\`number\`) — remaining unconsumed count

\`restore()\` accepts an optional \`{ keys: string[] }\` object (reserved for future use).

### Get Purchase Balances

Equivalent to \`restore()\` but named for clarity when fetching mid-session:

\`\`\`typescript
const { purchases } = useUserState();
const { purchases: balances } = await purchases();
\`\`\`

### Consume a Purchase

Deduct from a purchase balance when the user spends a consumable item:

\`\`\`typescript
const { consume } = useUserState();

async function useBoost() {
  const result = await consume("boost_x2");
  activateBoost();
  updateInventoryUI(result.productId, result.quantity);
}
\`\`\`

With explicit quantity:

\`\`\`typescript
const result = await consume("boost_x2", 3);
\`\`\`

Returns:
- \`productId\` (\`string\`) — the product slug
- \`quantity\` (\`number\`) — remaining balance after consumption

### Read Arbitrary State

Store and retrieve custom per-user data (e.g. player profiles, preferences):

\`\`\`typescript
const { get, set } = useUserState();

// Save
await set("player_profile", { level: 5, xp: 1200 });

// Load
const record = await get("player_profile");
if (record) {
  console.log(record.blob);      // { level: 5, xp: 1200 }
  console.log(record.updatedAt); // ISO timestamp
  console.log(record.version);   // monotonically increasing integer
}
\`\`\`

\`get()\` returns \`null\` if the key does not exist. \`set()\` throws if the backend rejects the write.

---

## Important Notes for AI

- **Use slugs as \`productId\`**: the parameter is called \`productId\` but the value is the App Studio product slug
- **Do not call Pi APIs directly**: SDKLite owns payments (\`Pi.createPayment\`), ads (\`Pi.Ads\`), and backend communication
- **Purchases are server-validated**: amounts come from the product catalog, not client code. SDKLite creates a short-lived offer per purchase.
- **Ads never throw**: \`showInterstitial()\` and \`showRewarded()\` return \`false\` on failure
- **State methods throw plain Error**: not \`SDKLiteError\`, on auth or backend failures
- **Always check ad support**: call \`isAdNetworkSupported()\` before \`showInterstitial()\` or \`showRewarded()\`
- **Restore on load**: call \`state.restore()\` or \`state.purchases()\` at app startup to sync purchase balances
- **Mobile World Integration**: All product pages and checkout flows are now integrated with Pi payment system
