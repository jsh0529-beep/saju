import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "하준이의 칸지 퀘스트",
  description: "하루 세 글자, 일본어로 이어지는 한자 모험. 기초 한자 60자와 듣기, 기억 게임, 맞춤 복습.",
  manifest: "/site.webmanifest",
  appleWebApp: { capable: true, title: "칸지 퀘스트", statusBarStyle: "default" },
  applicationName: "칸지 퀘스트",
  icons: {
    icon: [{ url: "/icon-v2.svg", type: "image/svg+xml" }, { url: "/favicon-32.png", sizes: "32x32", type: "image/png" }],
    shortcut: "/favicon-32.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head><meta name="theme-color" content="#205949"/></head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
