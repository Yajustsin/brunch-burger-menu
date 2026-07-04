import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brunch Burger | منو",
  description: "منوی آنلاین رستوران برانچ برگر",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className="h-full antialiased">
      <body className="min-h-full flex flex-col text-ink-900">
        {children}
      </body>
    </html>
  );
}
