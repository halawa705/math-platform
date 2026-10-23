import React from "react";
import "katex/dist/katex.min.css";
import "./globals.css";

export const metadata = {
  title: "أكاديمية الرياضيات المتخصصة | منصة النخبة الرياضية",
  description:
    "المنصة التعليمية المتخصصة في فروع الرياضيات البحتة والتطبيقية والرسوم الهندسية الدقيقة",
};

export default function RootPlatformLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&family=Cairo:wght@500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;600;700&family=Readex+Pro:wght@400;600;700&family=Tajawal:wght@400;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F8FAFC] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 antialiased selection:bg-teal-500/20 selection:text-teal-700 dark:selection:text-teal-300">
        {children}
      </body>
    </html>
  );
}
