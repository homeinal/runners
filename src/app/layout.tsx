import type { Metadata } from "next";
import { Noto_Sans_KR, Spline_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { SessionProvider } from "@/components/layout/SessionProvider";
import Script from "next/script";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

const splineSans = Spline_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-spline-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://maedal.com"),
  title: "매달 - 국내외 마라톤 대회 정보",
  description:
    "마라톤, 하프마라톤, 러닝 대회 일정을 한눈에. 접수 중인 대회를 지금 확인하세요.",
  keywords: [
    "마라톤",
    "러닝",
    "대회",
    "레이스",
    "달리기",
    "하프마라톤",
    "풀마라톤",
  ],
  openGraph: {
    title: "매달",
    description: "국내외 마라톤 대회 정보",
    url: "https://maedal.com",
    siteName: "매달",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/OG_image.png",
        width: 945,
        height: 630,
        alt: "Maedal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/OG_image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: "https://maedal.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') ||
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.add(theme);
              })();
            `,
          }}
        />
        <meta
          name="google-adsense-account"
          content="ca-pub-3411274862132015"
        />
      </head>
      <body
        className={`${notoSansKR.variable} ${splineSans.variable} font-display bg-background-light dark:bg-background-dark text-border-dark dark:text-background-light min-h-screen flex flex-col relative overflow-x-hidden antialiased`}
      >
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3411274862132015"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
        <SessionProvider>
          <ThemeProvider>
            <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0" />
            <div className="relative z-10 flex flex-col min-h-screen w-full">
              {children}
            </div>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
