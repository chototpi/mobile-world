const API_BASE =
  "https://payofpi.click/payment-backend/api-proxy";

// get existing wallet
export async function getMuxedWallet() {

  const username =
    localStorage.getItem(
      "pi_username"
    );

  if (!username) {

    throw new Error(
      "Username not found"
    );
  }

  const response =
    await fetch(
      `${API_BASE}/get-wallet?username=${username}`
    );

  const data =
    await response.json();

  if (!data.success) {

    throw new Error(
      data.error ||
      "Get wallet failed"
    );
  }

  return data.wallet;
}

// create new wallet
export async function createMuxedAddress() {

  const uid =
    localStorage.getItem(
      "uid"
    );

  const username =
    localStorage.getItem(
      "pi_username"
    );

  if (!uid) {

    throw new Error(
      "UID not found"
    );
  }

  if (!username) {

    throw new Error(
      "Username not found"
    );
  }

  const response =
    await fetch(
      `${API_BASE}/create-muxed`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          uid,
          username,
        }),
      }
    );

  const data =
    await response.json();

  if (!data.success) {

    throw new Error(
      data.error ||
      "Create wallet failed"
    );
  }

  if (!data.muxed) {

    throw new Error(
      "No wallet returned"
    );
  }

  return data.muxed;
}
