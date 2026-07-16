import type { Metadata } from "next";
import "./styles.css";

export const metadata: Metadata = {
  title: "Saxmundham Rail Watch",
  description:
    "A scratch MVP for logging Saxmundham rail incidents and preparing structured complaint evidence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
