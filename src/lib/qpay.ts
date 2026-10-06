let cached: { token: string; expires: number } | null = null;
let pending: Promise<string> | null = null;
const base = process.env.QPAY_BASE_URL || "https://merchant-sandbox.qpay.mn";
export function paymentConfigured() {
  return !!(
    process.env.QPAY_CLIENT_ID &&
    process.env.QPAY_CLIENT_SECRET &&
    process.env.QPAY_INVOICE_CODE &&
    process.env.APP_URL &&
    process.env.QPAY_CALLBACK_SECRET
  );
}
async function accessToken(): Promise<string> {
  if (cached && cached.expires > Date.now()) return cached.token;
  if (pending) return pending;
  pending = (async () => {
    const response = await fetch(`${base}/v2/auth/token`, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.QPAY_CLIENT_ID}:${process.env.QPAY_CLIENT_SECRET}`,
          ).toString("base64"),
      },
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    if (!response.ok) throw new Error("QPay authentication failed");
    const data = await response.json();
    if (!data.access_token) throw new Error("Invalid QPay token");
    cached = {
      token: data.access_token,
      expires:
        Date.now() + Math.max(0, Number(data.expires_in || 300) - 60) * 1000,
    };
    return cached.token;
  })();
  try {
    return await pending;
  } finally {
    pending = null;
  }
}
export async function qpay(path: string, body: unknown) {
  if (!paymentConfigured()) throw new Error("QPay тохиргоо дутуу байна.");
  const response = await fetch(base + path, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + (await accessToken()),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("QPay request failed");
  return response.json();
}
