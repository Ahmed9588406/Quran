import type { Metadata } from "next";
import "./globals.css";
import { NotificationProvider } from "./components/NotificationProvider";

export const metadata: Metadata = {
  title: "Wesal",
  description: "Created by TwinTech IT Team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // add suppressHydrationWarning to allow small client-only mutations (dev tools/extensions)
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`antialiased`}>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}
