import React from "react";
import OtherUserClient from "../OtherUserClient";

/**
 * Server Component - Dynamic Other User Page
 * Handles params and passes userId to client component
 */
export default async function Page({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  return <OtherUserClient userId={userId} />;
}
