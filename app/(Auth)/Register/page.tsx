"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";

export default function Index() {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ fullName, email, password });
  };

  // color tokens matching the provided design
  const colors = {
    rightBg: "#eef3f9",        // right panel background (pale blue)
    heading: "#8b1830",        // maroon
    accent: "#c79a4f",         // gold
    inputBg: "#fff8f3",        // cream
    inputBorder: "#f0e6e6",
    buttonBg: "#8b1830",
    buttonText: "#ffffff",
    muted: "#6b6b6b",
    divider: "#111111",
    facebook: "#2d63a6",
    leftOverlay: "rgba(0,0,0,0.25)",
  };

  return (
    <div className="min-h-screen flex">
      {/* Left image column (hidden on small screens) */}
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
        <div className="w-full max-w-md px-8 py-16">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-64 h-44 relative mb-4">
              <Image
                src="/figma-assets/logo_wesal.png"
                alt="WESAL Logo"
                fill
                style={{ objectFit: "contain" }}
                draggable={false}
              />
            </div>
            <h2
                className="text-2xl font-semibold"
                style={{ color: colors.heading, alignSelf: "flex-start" }}
            >
                Create New Account
            </h2>
            <p
                className="text-sm mt-2"
                style={{ color: colors.accent, fontSize: 13, alignSelf: "flex-start" }}
            >
                Register to Continue
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-sm mb-2 font-bold" style={{ color: colors.muted }}>
                Full Name
              </label>
              <Input
                type="text"
                placeholder="Enter Your Name"
                value={fullName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
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

            <div>
              <label className="block text-sm mb-2 font-bold" style={{ color: colors.muted }}>
                Email
              </label>
              <Input
                type="email"
                placeholder="Email or phone number"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
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

            <div>
              <label className="block text-sm mb-2 font-bold" style={{ color: colors.muted }}>
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  className="w-full rounded-md"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: "#222",
                    height: 44,
                    paddingLeft: 12,
                    paddingRight: 44,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: colors.muted }}
                  aria-label="toggle password"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
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
              Register
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 font-bold" style={{ height: 0, borderTop: `1px solid ${colors.divider}`, opacity: 0.6 }} />
            <div className="mx-2 flex-shrink-0 " style={{ color: colors.divider }}>
              OR
            </div>
            <div className="flex-1 font-bold" style={{ height: 0, borderTop: `1px solid ${colors.divider}`, opacity: 0.6 }} />
          </div>

          {/* Social Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              className="w-full rounded-md flex items-center justify-center gap-3"
              style={{
                backgroundColor: "#ffffff",
                color: "#111",
                border: "1px solid #e6e6e6",
                height: 44,
              }}
            >
              <Image
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="google"
                className="h-5 w-5"
                width={20}
                height={20}
              />
              <span>Sign in with Google</span>
            </Button>

            <Button
              type="button"
              className="w-full rounded-md flex items-center justify-center gap-3"
              style={{
                backgroundColor: colors.facebook,
                color: "#fff",
                height: 44,
                border: "none",
              }}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Sign in with Facebook</span>
            </Button>
          </div>

          {/* Footer */}
          <p className="text-center text-sm mt-6" style={{ color: colors.muted }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: colors.accent, fontWeight: 600, textDecoration: "underline" }}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
