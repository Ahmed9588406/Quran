"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    // send reset code logic here (omitted) then navigate to the login page
    router.push("/login");
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
              type="button"
              onClick={() => router.push("/verify")}
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
    </div>
  );
}
