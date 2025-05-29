import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

let token = null;

export async function getAccessToken() {
  const auth = Buffer.from(`${process.env.KROGER_CLIENT_ID}:${process.env.KROGER_CLIENT_SECRET}`).toString("base64");

  try {
    const res = await fetch("https://api.kroger.com/v1/connect/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials&scope=product.compact"
    });

    const data = await res.json();
    token = data.access_token;

    return token;
  } catch (err) {
    console.error("Error fetching token:", err.message);
  }
}

export async function getLocationId(zip = "84040") {
  if (!token) await getAccessToken();

  const res = await fetch(`https://api.kroger.com/v1/locations?filter.zipCode.near=${zip}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json"
    }
  });

  const data = await res.json();
  return data.data?.[0]?.locationId || "01500438";
}

export async function searchProduct(term, locationId) {
  if (!token) await getAccessToken();

  const res = await fetch(`https://api.kroger.com/v1/products?filter.term=${encodeURIComponent(term)}&filter.limit=1&filter.locationId=${locationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json"
    }
  });

  const data = await res.json();
  return data.data?.[0] || null;
}