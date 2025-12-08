/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      const sendingToastId = toast.info("Sending reset code...", { autoClose: false });

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const text = await res.text().catch(() => "");
      let json: any = null;
      try { json = text ? JSON.parse(text) : null; } catch { json = null; }

      toast.dismiss(sendingToastId);

      if (!res.ok) {
        const msg = json?.error ?? json?.message ?? text ?? "Failed to send reset code";
        toast.error(String(msg));
        return;
      }

      toast.success("Reset code sent. Check your email.");
      setTimeout(() => {
        router.push("/verify");
      }, 700);
    } catch (err) {
      console.error("Forgot password error:", err);
      toast.error("Network error. Please try again.");
    }
  };

  const colors = {
    rightBg: "#eef3f9",
    heading: "#8b1830",
    accent: "#c79a4f",
    inputBg: "#fff8f3",
    inputBorder: "#f0e6e6",
    buttonBg: "#8b1830",
    buttonText: "#ffffff",
    muted: "#6b6b6b",
    leftOverlay: "rgba(0,0,0,0.25)",
  };

  return (
    <div className="min-h-screen flex">
      {/* Left image column */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/figma-assets/background.png"
          alt="left background"
          fill
          className="object-cover"
          priority
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: colors.leftOverlay,
          }}
        />
      </div>

      {/* Right form column */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center"
        style={{ background: colors.rightBg }}
      >
        <div className="w-full max-w-md px-8 py-20">
          {/* Logo + Heading */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-64 h-44 relative mb-4">
              <Image
                src="/figma-assets/logo_wesal.png"
                alt="WESAL Logo"
                fill
                style={{ objectFit: "contain" }}
                draggable={false}
              />
            </div>

            <h1
              className="text-2xl font-semibold"
              style={{ color: colors.heading }}
            >
              Forget your Password?
            </h1>
            <p
              className="text-sm mt-2 text-center"
              style={{ color: colors.accent, fontSize: 13 }}
            >
              No worries! Let&apos;s make a new one
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSendCode} className="space-y-5">
            <div>
              <label
                className="block text-sm mb-2"
                style={{ color: colors.muted, fontWeight: 600 }}
              >
                Email
              </label>
              <Input
                type="email"
                placeholder="Enter Your Email Address"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                className="w-full rounded-md"
                style={{
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: "#222",
                  height: 44,
                  paddingLeft: 12,
                  paddingRight: 12,
                }}
              />
            </div>

            <Button
              type="submit"
              className="w-full rounded-md"
              style={{
                backgroundColor: colors.buttonBg,
                color: colors.buttonText,
                height: 44,
                fontWeight: 700,
              }}
            >
              Send Code
            </Button>
          </form>

          {/* Footer link */}
          <p
            className="text-center text-sm mt-6"
            style={{ color: colors.muted }}
          >
            Remembered your password?{" "}
            <Link
              href="/login"
              style={{ color: colors.accent, fontWeight: 600, textDecoration: "underline" }}
            >
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover draggable />
    </div>
  );
}
