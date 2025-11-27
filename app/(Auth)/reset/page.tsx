"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPassword() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const canSubmit = newPassword.length > 0 && confirmPassword.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError(null);
    // call API to set new password (omitted)
    router.push("/login");
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

            <h1 className="text-2xl font-semibold" style={{ color: colors.heading }}>
              Enter Your New Password
            </h1>
            <p className="text-sm mt-2 text-center" style={{ color: colors.accent, fontSize: 13 }}>
              one step away from your new password
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm mb-2" style={{ color: colors.muted, fontWeight: 600 }}>
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  placeholder="Enter password"
                  value={newPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
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
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: colors.muted }}
                  aria-label="toggle new password"
                >
                  {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ color: colors.muted, fontWeight: 600 }}>
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Enter password"
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
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
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: colors.muted }}
                  aria-label="toggle confirm password"
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && <div className="text-sm" style={{ color: "crimson" }}>{error}</div>}

            <Button
              type="submit"
              className="w-full rounded-md"
              style={{
                backgroundColor: colors.buttonBg,
                color: colors.buttonText,
                height: 44,
                fontWeight: 700,
                opacity: canSubmit ? 1 : 0.6,
                cursor: canSubmit ? "pointer" : "not-allowed",
              }}
              disabled={!canSubmit}
            >
              Set New Password
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm mt-6" style={{ color: colors.muted }}>
            Remembered your password?{" "}
            <Link href="/login" style={{ color: colors.accent, fontWeight: 600, textDecoration: "underline" }}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
