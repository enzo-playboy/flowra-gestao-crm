import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { ThemeProvider } from "@/providers/theme-provider";
import { NotificationProvider } from "@/components/notifications/notification-provider";
import { GlobalSearch } from "@/components/search/global-search";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flowra CRM",
  description: "CRM minimalista com dark mode para gestao de leads e projetos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased transition-colors duration-500">
        <ThemeProvider>
          <NotificationProvider>
            <LayoutWrapper>{children}</LayoutWrapper>
            <GlobalSearch />
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
