import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "FocusFlow", description: "A calm home for focused work" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
