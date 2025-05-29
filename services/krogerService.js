import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

let token = null;

export async function getAccessToken() {
  const auth = Buffer.from(`${process.env.KROGER_CLIENT_ID}:${process.env.KROGER_CLIENT_SECRET}`).toString("base64");

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
}

export async function searchProduct(term) {
  if (!token) await getAccessToken();

  const res = await fetch(`https://api.kroger.com/v1/products?filter.term=${encodeURIComponent(term)}&filter.limit=1&filter.locationId=01500438`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json"
    }
  });

  const data = await res.json();
  return data.data?.[0] || null;
}
