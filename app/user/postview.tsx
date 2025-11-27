import React, { useState } from "react";
import Image from "next/image";
import { Heart, MessageCircle, Repeat, Share2, MoreHorizontal } from "lucide-react";
import Link from "next/link";

/**
 * PostView
 * - Replace /figma-assets/post-mockup.png with your actual image asset.
 * - Minimal, responsive Instagram-like post card using Tailwind utility classes.
 */
export default function PostView() {
  const [liked, setLiked] = useState(false);

  const handleLike = () => setLiked((s) => !s);

  return (
    // outer wrapper keeps centering behaviour; inner fixed-size box set to 706x758
    <div className="w-full flex justify-center py-8 px-4">
      <div
        // fixed dimensions requested
        style={{ width: 706, height: 758 }}
        className="mx-auto"
      >
        {/* Card: make it full height and use column flex so image can grow */}
        <div className="bg-[#fff6f3] rounded-xl shadow-md border border-[#f0e6e5] overflow-hidden h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0">
            <div className="w-11 h-11 relative rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              <Image
                src="/figma-assets/avatar.png"
                alt="avatar"
                fill
                style={{ objectFit: "cover" }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link href="#" className="font-semibold text-sm text-gray-900 truncate">
                  Mazen Mohamed
                </Link>
                <span className="text-xs text-gray-400">· 2d</span>
              </div>
            </div>

            <button className="bg-[#7b2030] text-white text-sm px-3 py-1 rounded-md font-medium hover:opacity-95">
              Follow
            </button>

            <button aria-label="more" className="ml-2 text-gray-400 hover:text-gray-600">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>

          {/* Caption */}
          <div className="px-4 pb-3 flex-shrink-0">
            <p className="text-sm text-gray-800 leading-relaxed">
              Pizza ipsum melted black crust tossed olives pineapple wing bbq buffalo meat black
              mayo mushrooms broccoli personal mayo spinach white mouth stuffed onions hand
            </p>
          </div>

          {/* Post image - set to grow and fill remaining space */}
          <div className="px-4 pb-4 flex-1">
            <div className="w-full rounded-lg overflow-hidden bg-gray-50 shadow-sm h-full">
              <div style={{ position: "relative", width: "100%", height: "100%" }}>
                <Image
                  src="/moshaf.svg" /* replace with your quran image */
                  alt="post"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Actions row */}
          <div className="px-4 pb-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex gap-6">
                <button onClick={handleLike} className="flex flex-col items-center text-center focus:outline-none">
                  <Heart className={`w-5 h-5 ${liked ? "text-red-500" : "text-gray-500"}`} />
                  <span className="text-xs mt-1 text-gray-600">Like</span>
                </button>

                <button className="flex flex-col items-center text-center text-gray-600 focus:outline-none">
                  <MessageCircle className="w-5 h-5 text-gray-500" />
                  <span className="text-xs mt-1 text-gray-600">Comment</span>
                </button>

                <button className="flex flex-col items-center text-center text-gray-600 focus:outline-none">
                  <Repeat className="w-5 h-5 text-gray-500" />
                  <span className="text-xs mt-1 text-gray-600">Repost</span>
                </button>

                <button className="flex flex-col items-center text-center text-gray-600 focus:outline-none">
                  <Share2 className="w-5 h-5 text-gray-500" />
                  <span className="text-xs mt-1 text-gray-600">Share</span>
                </button>
              </div>

              <div className="text-sm text-gray-400"> </div>
            </div>
          </div>

          {/* Footer spacer */}
          <div className="px-4 pb-4 text-xs text-gray-400 flex-shrink-0">
            {/* time / meta can go here */}
          </div>
        </div>
      </div>
    </div>
  );
}
