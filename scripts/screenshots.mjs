import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = "public/presentation";
mkdirSync(OUT, { recursive: true });

const tomorrow = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
})();

const browser = await chromium.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

async function shot(page, name, fullPage = false) {
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage });
  console.log("shot:", name);
}

// Landing page (desktop)
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForSelector("text=Railway booking for the common man");
  await shot(page, "landing-hero");
  await page.screenshot({ path: `${OUT}/landing-full.png`, fullPage: true });
  console.log("shot: landing-full");
  await ctx.close();
}

// Mobile app flows
const ctx = await browser.newContext({
  viewport: { width: 430, height: 932 },
  deviceScaleFactor: 2,
  hasTouch: true,
});
const page = await ctx.newPage();
page.setDefaultTimeout(25000);

// Home (logged out)
await page.goto(`${BASE}/home`, { waitUntil: "networkidle" });
await page.waitForSelector("text=Search trains");
await shot(page, "home-loggedout");

// Login
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.waitForSelector("text=Verify your number");
await shot(page, "login");
await page.getByRole("button", { name: /Use demo account/i }).click();
await page.waitForTimeout(400);
await page.getByRole("button", { name: /Verify & continue/i }).click();
await page.waitForURL(/\/home/, { timeout: 20000 });
await page.waitForTimeout(900);

// Booking step 1: route and date
await page.goto(`${BASE}/book`, { waitUntil: "networkidle" });
await page.waitForSelector("text=Search trains");
await shot(page, "book-route");

// Booking step 2: trains
await page.goto(`${BASE}/book?from=Mumbai&to=Goa&date=${tomorrow}&pax=2`, { waitUntil: "networkidle" });
await page.waitForSelector("text=Continue with", { timeout: 25000 });
await shot(page, "book-trains");

// Pick first available class, continue to passengers
const available = page.locator('button:has-text("left")');
if ((await available.count()) > 0) {
  await available.first().click();
} else {
  await page.locator('button:has-text("WL")').first().click();
}
await page.getByRole("button", { name: /Continue with/ }).click();
await page.waitForSelector("text=Saved passengers");
await shot(page, "book-passengers");

// Continue to payment
await page.getByRole("button", { name: /Continue to payment/ }).click();
await page.waitForSelector("text=Secure payment");
await shot(page, "book-payment");

// Demo payment (skips the Razorpay modal so the flow can be captured offline)
await page.getByRole("button", { name: /Skip gateway/ }).click();
await page.waitForSelector("text=View e-ticket", { timeout: 25000 });
await shot(page, "book-success");

const pnr = (await page.locator("text=/4\\d{9}/").first().innerText()).trim();
console.log("booked PNR:", pnr);

// E-ticket
await page.getByRole("link", { name: /View e-ticket/ }).click();
await page.waitForSelector("text=Boarding pass");
await shot(page, "ticket");

// Tickets list
await page.goto(`${BASE}/tickets`, { waitUntil: "networkidle" });
await page.waitForSelector("text=My tickets");
await shot(page, "tickets");

// Home with active ticket
await page.goto(`${BASE}/home`, { waitUntil: "networkidle" });
await page.waitForSelector("text=Active ticket");
await shot(page, "home");

// Chatbot flow
await page.goto(`${BASE}/chat`, { waitUntil: "networkidle" });
await page.waitForSelector("text=Tikit Assistant");
await shot(page, "chat-welcome");

const chatInput = page.getByPlaceholder(/Type a message/);
await chatInput.fill("Book Mumbai to Goa tomorrow");
await chatInput.press("Enter");
await page.waitForTimeout(1600);
await shot(page, "chat-trains");

await page.getByRole("button", { name: "Option 1", exact: true }).first().click();
await page.waitForTimeout(1600);
await shot(page, "chat-class");

const sleeper = page.getByRole("button", { name: /^Sleeper$/ });
if ((await sleeper.count()) > 0) {
  await sleeper.first().click();
  await page.waitForTimeout(1400);
}
await page.getByRole("button", { name: /Just me/ }).first().click();
await page.waitForTimeout(1500);
await shot(page, "chat-confirm");
await page.getByRole("button", { name: /Pay with UPI/ }).first().click();
await page.waitForTimeout(1800);
await shot(page, "chat-booked");

// IVR flow
await page.goto(`${BASE}/ivr`, { waitUntil: "networkidle" });
await page.waitForSelector("text=Tikit Helpline");
await shot(page, "ivr-dial");

await page.getByRole("button", { name: /Call 1800 123 4567/ }).click();
await page.waitForTimeout(1000);
await shot(page, "ivr-greeting");

for (const d of ["9", "8", "7", "6", "5", "4", "3", "2", "1", "0"]) {
  await page.getByRole("button", { name: d, exact: true }).click();
}
await page.getByRole("button", { name: /Send digits/ }).click();
await page.waitForTimeout(1000);
await shot(page, "ivr-menu");

await page.getByRole("button", { name: /1 · Book ticket/ }).click();
await page.waitForTimeout(900);
const ivrInput = page.getByPlaceholder(/Speak or type/);
await ivrInput.fill("Pune to Mumbai tomorrow");
await page.getByRole("button", { name: "Say", exact: true }).click();
await page.waitForTimeout(1100);
await shot(page, "ivr-trains");

const firstOption = page.getByRole("button", { name: /^1 · / });
if ((await firstOption.count()) > 0) {
  await firstOption.first().click();
  await page.waitForTimeout(1000);
}
const classOption = page.getByRole("button", { name: /^1 · / });
if ((await classOption.count()) > 0) {
  await classOption.first().click();
  await page.waitForTimeout(1000);
}
await shot(page, "ivr-count");

const twoPax = page.getByRole("button", { name: /^2 · 2 passengers/ });
if ((await twoPax.count()) > 0) {
  await twoPax.first().click();
  await page.waitForTimeout(1000);
}
await page.getByRole("button", { name: /1 · Confirm & pay/ }).click();
await page.waitForTimeout(900);
await page.getByRole("button", { name: /1 · Pay now/ }).click();
await page.waitForTimeout(1400);
await shot(page, "ivr-booked");

await ctx.close();
await browser.close();
console.log("All screenshots captured.");
