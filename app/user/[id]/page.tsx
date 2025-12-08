import React from "react";
import UserPageClient from "../UserPageClient";

/**
 * Dynamic User Page - Server Component
 * Passes the user ID to the client component which handles data fetching
 * (Data fetching requires authentication tokens only available on client)
 * Requirements: 3.1, 3.4, 4.3
 */
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Pass userId to client component - client will handle data fetching with auth tokens
  // Requirements: 3.4, 4.3
  return <UserPageClient userId={id} />;
}
