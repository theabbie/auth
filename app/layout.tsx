import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/context/auth-context";

export const metadata: Metadata = {
  title: "AbbieAuth - OAuth 2.0 SSO Provider",
  description: "Comprehensive OAuth 2.0 authentication with 150+ profile fields. Secure, developer-friendly SSO solution for modern applications.",
  keywords: ["OAuth 2.0", "SSO", "authentication", "profile management", "JWT", "single sign-on"],
  authors: [{ name: "AbbieAuth" }],
  openGraph: {
    title: "AbbieAuth - OAuth 2.0 SSO Provider",
    description: "Comprehensive OAuth 2.0 authentication with 150+ profile fields. Secure, developer-friendly SSO solution for modern applications.",
    url: "https://abbieauth.vercel.app",
    siteName: "AbbieAuth",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AbbieAuth - OAuth 2.0 SSO Provider",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AbbieAuth - OAuth 2.0 SSO Provider",
    description: "Comprehensive OAuth 2.0 authentication with 150+ profile fields. Secure, developer-friendly SSO solution for modern applications.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  metadataBase: new URL("https://abbieauth.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
