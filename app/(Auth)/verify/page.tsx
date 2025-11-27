"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VerifyCode() {
  const router = useRouter();
  const colors = {
    rightBg: "#eef3f9",
    heading: "#8b1830",
    accent: "#c79a4f",
    inputBg: "#f3f0f0",
    inputBorder: "#e6e6e6",
    buttonBg: "#8b1830",
    buttonText: "#ffffff",
    muted: "#9b9b9b",
    leftOverlay: "rgba(0,0,0,0.25)",
  };

  const length = 6;
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const allFilled = values.every((v) => v.trim() !== "");

  const handleChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(0, 1);
    if (!digit && val !== "") return;
    const next = [...values];
    next[idx] = digit;
    setValues(next);
    if (digit && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace" && !values[idx] && idx > 0) {
      const prev = inputsRef.current[idx - 1];
      prev?.focus();
      const next = [...values];
      next[idx - 1] = "";
      setValues(next);
    }
    if (e.key === "ArrowLeft" && idx > 0) {
      inputsRef.current[idx - 1]?.focus();
    }
    if (e.key === "ArrowRight" && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "");
    if (!paste) return;
    const next = Array(length).fill("");
    for (let i = 0; i < length; i++) next[i] = paste[i] ?? "";
    setValues(next);
    const focusIndex = Math.min(paste.length, length - 1);
    inputsRef.current[focusIndex]?.focus();
  };

  const handleVerify = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!allFilled) return;
    const code = values.join("");
    console.log("verify code:", code);
    // Replace destination route as needed (e.g. /reset-password)
    router.push("/reset");
  };

  return (
    <div className="min-h-screen flex">
      {/* Left image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/figma-assets/background.png"
          alt="left"
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

      {/* Right panel */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center"
        style={{ background: colors.rightBg }}
      >
        <div className="w-full max-w-md px-8 py-20">
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
              We Have Sent You A Code
            </h1>
            <p className="text-sm mt-2 text-center" style={{ color: colors.muted }}>
              one step away from your new password
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex items-center justify-center gap-3">
              {values.map((v, i) => (
                <input
                  key={i}
                  ref={(el) => { inputsRef.current[i] = el; }}
                  value={v}
                  inputMode="numeric"
                  onChange={(e) => handleChange(i, e.target.value)}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  onKeyDown={(e) => handleKeyDown(e as any, i)}
                  onPaste={handlePaste}
                  maxLength={1}
                  className="text-center rounded-md"
                  style={{
                    width: 44,
                    height: 44,
                    background: colors.inputBg,
                    border: `1px solid ${colors.inputBorder}`,
                    fontSize: 18,
                    color: "#222",
                    outline: "none",
                  }}
                />
              ))}
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
              disabled={!allFilled}
            >
              Verify
            </Button>

            <div className="text-center text-sm" style={{ color: colors.muted }}>
              <span>Didn&apos;t receive a code? </span>
              <button
                type="button"
                onClick={() => console.log("resend")}
                style={{ color: colors.accent, fontWeight: 600 }}
                className="ml-1"
              >
                Resend
              </button>
            </div>

            <p className="text-center text-sm mt-4" style={{ color: colors.muted }}>
              Remembered your password?{" "}
              <Link href="/login" style={{ color: colors.accent, fontWeight: 600 }}>
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
