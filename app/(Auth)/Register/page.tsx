/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://apisoapp.twingroups.com";

export default function Index() {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!username.trim() || !email.trim() || !password || !fullName.trim()) {
			setError("Please fill in all fields.");
			toast.error("Please fill in all fields.");
			return;
		}

		setLoading(true);
		try {
			const res = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					username: username.trim(),
					email: email.trim(),
					password,
					full_name: fullName.trim(),
				}),
			});

			const text = await res.text().catch(() => "");
			let json: any = null;
			try { json = text ? JSON.parse(text) : null; } catch { json = null; }

			if (!res.ok) {
				const backendError = json?.error ?? json?.message ?? text ?? "Registration failed";
				if (backendError === "user_exists") {
					setError("User already exists. Try logging in.");
					toast.error("User already exists. Try logging in.");
				} else {
					setError(String(backendError));
					toast.error(String(backendError));
				}
				setLoading(false);
				return;
			}

			// Support shapes: { success, user_id, tokens: { access_token, refresh_token, user } }
			// or { data: { access_token, refresh_token, user } } etc.
			const root = json ?? {};
			const tokens = root.tokens ?? root.data ?? root;
			const access =
				tokens?.access_token ?? tokens?.token ?? tokens?.accessToken ?? root?.access_token ?? null;
			const refresh = tokens?.refresh_token ?? tokens?.refreshToken ?? root?.refresh_token ?? null;
			const user = tokens?.user ?? root?.user ?? null;
			const userId = root?.user_id ?? user?.id ?? null;

			// Normalize avatar if needed (existing BASE_URL variable available)
			if (user && typeof user.avatar_url === "string" && user.avatar_url.startsWith("/")) {
				user.avatar_url = `${BASE_URL}${user.avatar_url}`;
			}

			if (access) localStorage.setItem("access_token", access);
			if (refresh) localStorage.setItem("refresh_token", refresh);
			if (user) {
				// Ensure user object has ID for routing
				const userWithId = { ...user, id: userId || user.id };
				localStorage.setItem("user", JSON.stringify(userWithId));
			}

			toast.success("Registration successful");
			setLoading(false);

			// navigate to user's page (dynamic route)
			setTimeout(() => {
				const destId = userId ?? (user && (user as any).id) ?? null;
				if (destId) {
					router.push(`/user/${destId}`);
				} else {
					router.push("/user");
				}
			}, 700);
		} catch (err) {
			console.error("Register error:", err);
			setError("Network error. Please try again.");
			toast.error("Network error. Please try again.");
			setLoading(false);
		}
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
                Username
              </label>
              <Input
                type="text"
                placeholder="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                Full Name
              </label>
              <Input
                type="text"
                placeholder="Enter Your Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* error */}
            {error && <div className="text-sm text-red-600">{error}</div>}

            <Button
              type="submit"
              className="w-full rounded-md"
              style={{
                backgroundColor: colors.buttonBg,
                color: colors.buttonText,
                height: 44,
                fontWeight: 700,
              }}
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
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

      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
}
