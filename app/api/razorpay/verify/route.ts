import { createHmac, timingSafeEqual } from "crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return Response.json({ verified: false, error: "Razorpay keys are not configured." }, { status: 500 });
  }

  let body: { orderId?: string; paymentId?: string; signature?: string } = {};
  try {
    body = await req.json();
  } catch {
    return Response.json({ verified: false, error: "Invalid request body." }, { status: 400 });
  }

  const { orderId, paymentId, signature } = body;
  if (!orderId || !paymentId || !signature) {
    return Response.json({ verified: false, error: "Missing payment fields." }, { status: 400 });
  }

  const expected = createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
  let verified = false;
  try {
    verified =
      signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    verified = false;
  }

  return Response.json({ verified, paymentId, orderId });
}
