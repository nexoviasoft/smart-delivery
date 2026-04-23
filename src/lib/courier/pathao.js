async function getPathaoToken(config) {
  const endpoint = `${config.baseUrl.replace(/\/$/, "")}/issue-token`;

  const tokenRes = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: config.apiKey,
      client_secret: config.secretKey,
    }),
  });

  const tokenBody = await tokenRes.json();
  if (!tokenRes.ok) {
    throw new Error(tokenBody?.message || "Pathao token request failed");
  }

  return tokenBody?.access_token || tokenBody?.data?.access_token;
}

export async function sendToPathao({ config, delivery }) {
  const token = await getPathaoToken(config);
  if (!token) {
    throw new Error("Pathao token missing from response");
  }

  const endpoint = `${config.baseUrl.replace(/\/$/, "")}/orders`;
  const payload = {
    recipient_name: delivery.customerName,
    recipient_phone: delivery.customerPhone,
    recipient_address: delivery.customerAddress,
    amount_to_collect: delivery.codAmount,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.message || "Pathao create order failed");
  }

  const trackingId =
    body?.consignment_id || body?.tracking_id || body?.data?.tracking_id;

  return { trackingId, raw: body };
}
