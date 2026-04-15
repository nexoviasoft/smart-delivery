export async function sendToSteadfast({ config, delivery }) {
  const endpoint = `${config.baseUrl.replace(/\/$/, "")}/create_order`;

  const payload = {
    recipient_name: delivery.customerName,
    recipient_phone: delivery.customerPhone,
    recipient_address: delivery.customerAddress,
    cod_amount: delivery.codAmount,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": config.apiKey,
      "X-SECRET-KEY": config.secretKey,
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.message || "Steadfast order create failed");
  }

  const trackingId =
    body?.consignment_id || body?.data?.consignment_id || body?.tracking_id;

  return { trackingId, raw: body };
}
