export interface RazorpayOrder {
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

export interface RazorpaySuccess {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description?: string;
  prefill?: { name?: string; contact?: string; email?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler: (response: RazorpaySuccess) => void;
  modal?: { ondismiss?: () => void; confirm_close?: boolean };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, handler: (payload: unknown) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export async function createRazorpayOrder(
  amountPaise: number,
  receipt: string,
  notes: Record<string, string>,
): Promise<RazorpayOrder> {
  const res = await fetch("/api/razorpay/order", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ amount: amountPaise, receipt, notes }),
  });
  const data = (await res.json()) as Partial<RazorpayOrder> & { error?: string };
  if (!res.ok || !data.orderId || !data.keyId) {
    throw new Error(data.error ?? "Could not create the payment order.");
  }
  return data as RazorpayOrder;
}

export async function verifyRazorpayPayment(payment: RazorpaySuccess): Promise<boolean> {
  const res = await fetch("/api/razorpay/verify", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      orderId: payment.razorpay_order_id,
      paymentId: payment.razorpay_payment_id,
      signature: payment.razorpay_signature,
    }),
  });
  const data = (await res.json()) as { verified?: boolean };
  return !!data.verified;
}

let scriptPromise: Promise<boolean> | null = null;

export function loadRazorpayCheckout(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(!!window.Razorpay);
    script.onerror = () => {
      scriptPromise = null;
      resolve(false);
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export function openRazorpay(options: RazorpayOptions): void {
  if (!window.Razorpay) throw new Error("Razorpay checkout did not load.");
  const instance = new window.Razorpay(options);
  instance.on("payment.failed", () => {
    options.modal?.ondismiss?.();
  });
  instance.open();
}
