import React from "react";
import UserProfileClient from "../UserProfileClient";

/**
 * Dynamic user profile page server component
 * Passes the user ID to the client component which handles data fetching
 * (Data fetching requires authentication tokens only available on client)
 * Requirements: 3.2, 3.3, 3.4, 4.3
 */
export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Pass userId to client component - client will handle data fetching with auth tokens
  // Requirements: 3.4, 4.3
  return <UserProfileClient userId={id} />;
}
