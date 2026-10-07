"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BadgeCheckIcon,
  CheckIcon,
  Loader2Icon,
  LogOutIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { currentUser, login, logout } from "@/lib/mock";
import type { Lang, User } from "@/lib/types";

const LANGS: Array<{ code: Lang; label: string }> = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "mr", label: "मराठी" },
];

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/home";

  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState<Lang>("en");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setUser(currentUser());
  }, []);

  function sendOtp() {
    setError("");
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      setOtpSent(true);
      setBusy(false);
    }, 500);
  }

  function verify() {
    setError("");
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit OTP. Demo OTP: 123456");
      return;
    }
    setBusy(true);
    setTimeout(() => {
      const u = login(phone, name, lang);
      setUser(u);
      setBusy(false);
      router.replace(next);
    }, 600);
  }

  function demo() {
    setPhone("9876543210");
    setName("Dr. Abhay Patil");
    setOtpSent(true);
    setOtp("123456");
    setError("");
  }

  if (user) {
    return (
      <AppShell title="You're logged in" subtitle={user.phone} back="/home" showNav={false}>
        <Card className="text-center">
          <CardContent className="space-y-3">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-success-soft text-success">
              <CheckIcon className="size-6" strokeWidth={2.4} />
            </span>
            <div>
              <p className="text-lg font-bold">{user.name}</p>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <BadgeCheckIcon className="size-3.5 text-success" />
                IRCTC number {user.phone} · verified · {user.passengers.length} saved passenger
                {user.passengers.length === 1 ? "" : "s"}
              </p>
            </div>
            <div className="grid gap-2 pt-2">
              <Link href={next} className={buttonVariants({ className: "h-11 w-full rounded-xl text-sm" })}>
                Continue
              </Link>
              <Button
                variant="outline"
                className="h-11 w-full rounded-xl text-sm"
                onClick={() => {
                  logout();
                  setUser(null);
                  setOtpSent(false);
                  setOtp("");
                }}
              >
                <LogOutIcon />
                Sign out
              </Button>
            </div>
          </CardContent>
        </Card>
      </AppShell>
    );
  }

  return (
    <AppShell title="Log in" subtitle="Dummy OTP login · no password needed" back="/home" showNav={false}>
      <Card>
        <CardHeader>
          <CardTitle>Verify your number</CardTitle>
          <CardDescription>One-time verification with IRCTC unlocks saved passengers and call booking.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Language</Label>
            <div className="flex gap-2">
              {LANGS.map((l) => (
                <Button
                  key={l.code}
                  type="button"
                  size="sm"
                  variant={lang === l.code ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => setLang(l.code)}
                >
                  {l.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Mobile number linked with IRCTC</Label>
            <div className="flex items-center gap-2">
              <span className="flex h-9 items-center rounded-lg border border-input bg-muted/50 px-3 text-sm font-bold text-muted-foreground">
                +91
              </span>
              <Input
                id="phone"
                inputMode="numeric"
                maxLength={10}
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              />
            </div>
          </div>

          {otpSent ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="••••••"
                  className="tracking-[0.5em]"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                />
                <div className="flex items-center justify-between">
                  <Button type="button" variant="ghost" size="sm" className="text-primary" onClick={() => setOtp("123456")}>
                    <SparklesIcon />
                    Use demo OTP 123456
                  </Button>
                  <Button type="button" variant="link" size="sm" className="text-primary" onClick={sendOtp}>
                    Resend
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Your name (for new accounts)</Label>
                <Input
                  id="name"
                  placeholder="e.g. Dr. Abhay Patil"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </>
          ) : null}

          {error ? (
            <Alert variant="destructive">
              <TriangleAlertIcon />
              <AlertTitle>Check your details</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}

          <Button className="h-11 w-full rounded-xl text-sm" disabled={busy} onClick={otpSent ? verify : sendOtp}>
            {busy ? <Loader2Icon className="animate-spin" /> : null}
            {busy ? "Please wait…" : otpSent ? "Verify & continue" : "Send OTP"}
          </Button>

          <Button variant="outline" className="h-11 w-full rounded-xl text-sm" onClick={demo} type="button">
            <SparklesIcon />
            Use demo account
          </Button>

          <Separator />

          <div>
            <p className="flex items-center gap-2 text-sm font-bold">
              <ShieldCheckIcon className="size-4 text-success" />
              Why this login is different
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Your number is verified once with IRCTC. After that Tikit remembers your passengers, so booking is under 6
              taps and the same verified number lets our AI agent book for you over a phone call, even without
              internet.
            </p>
            <Badge variant="secondary" className="mt-3">
              Demo OTP · 123456
            </Badge>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
