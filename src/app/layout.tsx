import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "러너스하이 - 국내외 마라톤 대회 정보",
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
    title: "러너스하이",
    description: "국내외 마라톤 대회 정보",
    url: "https://runners-high.com",
    siteName: "러너스하이",
    locale: "ko_KR",
    type: "website",
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
        <link
          href="https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${notoSansKR.variable} font-display bg-background-light dark:bg-background-dark text-border-dark dark:text-background-light min-h-screen flex flex-col relative overflow-x-hidden antialiased`}
      >
        <ThemeProvider>
          <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0" />
          <div className="relative z-10 flex flex-col min-h-screen w-full">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
