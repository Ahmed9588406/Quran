"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CreatePostCard from "@/app/user-profile/CreatePostCard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CreatePostPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState({
    avatar: "/icons/settings/profile.png",
    name: "User",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch current user info
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("http://apisoapp.twingroups.com/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentUser({
            avatar: data.avatar_url || data.avatar || "/icons/settings/profile.png",
            name: data.display_name || data.username || "User",
          });
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, [router]);

  const handlePostCreated = () => {
    // Redirect to feed or profile after post creation
    router.push("/user-profile");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create a Post</h1>
        
        <CreatePostCard
          currentUserAvatar={currentUser.avatar}
          currentUserName={currentUser.name}
          onPostCreated={handlePostCreated}
        />
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}
