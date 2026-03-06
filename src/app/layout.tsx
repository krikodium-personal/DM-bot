import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Kriko Automations - Instagram DM Bot",
  description: "Automate your Instagram DMs and scale your business effortlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="ambient-light"></div>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
