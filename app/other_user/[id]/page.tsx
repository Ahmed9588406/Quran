import React from "react";
import OtherUserClient from "../OtherUserClient";

/**
 * Dynamic other user profile page
 * Passes the user ID to the client component which handles data fetching
 */
export default async function OtherUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return <OtherUserClient userId={id} />;
}
