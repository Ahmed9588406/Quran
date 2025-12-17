"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Khateb Studio Redirect Page
 * Redirects users to their appropriate studio page based on role
 * Route: /khateb_Studio
 */
export default function KhateebStudioRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const redirect = () => {
      try {
        const userStr = localStorage.getItem("user");
        const userId = localStorage.getItem("user_id");

        // No user data - redirect to login
        if (!userStr || !userId) {
          router.replace("/login");
          return;
        }

        const user = JSON.parse(userStr);
        const userRole = user.role?.toLowerCase();

        // Check if user is a preacher
        if (userRole === "preacher") {
          // Redirect to dynamic preacher studio
          router.replace(`/khateb_Studio/${userId}`);
        } else {
          // Non-preacher - redirect to user page
          router.replace(`/user/${userId}`);
        }
      } catch (error) {
        console.error("Redirect error:", error);
        router.replace("/login");
      }
    };

    redirect();
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-[#8A1538] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#8A1538] font-medium">Redirecting to Studio...</p>
      </div>
    </div>
  );
}
