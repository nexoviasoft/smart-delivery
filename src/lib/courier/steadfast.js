export async function sendToSteadfast({ config, delivery }) {
  const endpoint = `${config.baseUrl.replace(/\/$/, "")}/create_order`;
<<<<<<< HEAD
  const fallbackInvoice = `DLV-${String(delivery._id || "").slice(-8) || Date.now()}`;
  const invoice = delivery.invoice || delivery.orderCode || fallbackInvoice;

  const payload = {
    invoice,
=======

  const payload = {
>>>>>>> 790594a (update)
    recipient_name: delivery.customerName,
    recipient_phone: delivery.customerPhone,
    recipient_address: delivery.customerAddress,
    cod_amount: delivery.codAmount,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
<<<<<<< HEAD
      "Api-Key": config.apiKey,
      "Secret-Key": config.secretKey,
=======
      "X-API-KEY": config.apiKey,
      "X-SECRET-KEY": config.secretKey,
>>>>>>> 790594a (update)
    },
    body: JSON.stringify(payload),
  });

<<<<<<< HEAD
  const responseText = await response.text();
  let body = null;
  try {
    body = responseText ? JSON.parse(responseText) : {};
  } catch {
    body = { message: responseText || "Invalid JSON response from Steadfast" };
  }

=======
  const body = await response.json();
>>>>>>> 790594a (update)
  if (!response.ok) {
    throw new Error(body?.message || "Steadfast order create failed");
  }

<<<<<<< HEAD
  const trackingId = extractSteadfastTrackingCode(body);

  return { trackingId, raw: body };
}

function parseJsonSafely(rawText) {
  try {
    return rawText ? JSON.parse(rawText) : {};
  } catch {
    return { message: rawText || "Invalid JSON response from Steadfast" };
  }
}

export function extractSteadfastTrackingCode(payload) {
  return (
    payload?.consignment?.consignment_id ||
    payload?.consignment_id ||
    payload?.data?.consignment_id ||
    payload?.tracking_id ||
    payload?.consignment?.tracking_code ||
    payload?.consignment?.tracking_id ||
    payload?.consignment?.cid ||
    payload?.data?.tracking_id ||
    payload?.data?.cid ||
    null
  );
}

function buildTrackingCandidates(delivery) {
  const fromResponse = [
    delivery?.courierResponse?.consignment?.consignment_id,
    delivery?.courierResponse?.consignment_id,
    delivery?.courierResponse?.data?.consignment_id,
    delivery?.courierResponse?.tracking_id,
    delivery?.courierResponse?.consignment?.tracking_id,
    delivery?.courierResponse?.consignment?.cid,
    delivery?.courierResponse?.data?.tracking_id,
    delivery?.courierResponse?.data?.cid,
  ];

  const fromDelivery = [delivery?.trackingId, delivery?.invoice];
  const unique = [...fromDelivery, ...fromResponse]
    .map((value) => (value === undefined || value === null ? "" : String(value).trim()))
    .filter(Boolean);

  return [...new Set(unique)];
}

export async function trackSteadfastOrder({ config, delivery }) {
  const baseUrl = config.baseUrl.replace(/\/$/, "");
  const trackingCandidates = buildTrackingCandidates(delivery);

  if (!trackingCandidates.length) {
    throw new Error("No tracking code found for this delivery");
  }

  const endpoints = [];
  trackingCandidates.forEach((code) => {
    endpoints.push(`${baseUrl}/status_by_cid/${encodeURIComponent(code)}`);
    endpoints.push(`${baseUrl}/status_by_invoice/${encodeURIComponent(code)}`);
  });

  let lastError = null;
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Api-Key": config.apiKey,
          "Secret-Key": config.secretKey,
        },
      });

      const rawText = await response.text();
      const body = parseJsonSafely(rawText);

      if (!response.ok) {
        lastError = body?.message || `Tracking failed with status ${response.status}`;
        continue;
      }

      return {
        trackingCode: extractSteadfastTrackingCode(body) || trackingCandidates[0],
        raw: body,
      };
    } catch (error) {
      lastError = error?.message || "Tracking request failed";
    }
  }

  throw new Error(lastError || "Steadfast tracking failed");
}
=======
  const trackingId =
    body?.consignment_id || body?.data?.consignment_id || body?.tracking_id;

  return { trackingId, raw: body };
}
>>>>>>> 790594a (update)
