import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - Wesal",
  description: "Admin dashboard for managing live streams and mosques",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
