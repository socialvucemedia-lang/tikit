export const runtime = "nodejs";

export async function POST(req: Request) {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return Response.json({ error: "Razorpay keys are not configured on the server." }, { status: 500 });
  }

  let body: { amount?: number; receipt?: string; notes?: Record<string, string> } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const amount = Math.round(Number(body.amount));
  if (!Number.isFinite(amount) || amount < 100) {
    return Response.json({ error: "Amount must be at least ₹1 (100 paise)." }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: (body.receipt ?? `tikit_${Date.now()}`).slice(0, 40),
        notes: body.notes ?? {},
      }),
      cache: "no-store",
    });
    const data = (await res.json()) as {
      id?: string;
      amount?: number;
      currency?: string;
      error?: { description?: string };
    };
    if (!res.ok || !data.id) {
      return Response.json(
        { error: data?.error?.description ?? "Razorpay order creation failed." },
        { status: 502 },
      );
    }
    return Response.json({ orderId: data.id, amount: data.amount, currency: data.currency ?? "INR", keyId });
  } catch {
    return Response.json({ error: "Could not reach Razorpay. Check your connection." }, { status: 502 });
  }
}
