/**
 * RootLayout - Application Root Layout Component
 *
 * This file defines the root layout for the Next.js application, setting up
 * global styles, fonts, and metadata. It serves as the HTML shell for all pages.
 *
 * Key Responsibilities:
 * - Configure Google Fonts (Geist Sans and Geist Mono)
 * - Set application-wide metadata for SEO
 * - Apply global CSS variables for theming
 * - Provide the HTML structure for all pages
 *
 * Next.js App Router:
 * In the App Router, layout.tsx files create nested layouts that wrap page content.
 * This root layout wraps the entire application.
 *
 * Font Loading:
 * Uses next/font/google for optimized font loading with automatic CSS variable injection.
 */

import type { Metadata } from "next";
import "./globals.css";

/**
 * Application metadata for SEO and social sharing
 *
 * This metadata is used by search engines and social media platforms
 * when the page is shared or indexed.
 */
export const metadata: Metadata = {
  title: "houzz-for-all-with-ai",
  description: "A high-performance home design streaming application",
};

/**
 * RootLayout Component
 *
 * The top-level layout component that wraps all pages in the application.
 * Provides the HTML structure, font loading, and global styles.
 *
 * Font Variables:
 * Font CSS variables (--font-geist-sans, --font-geist-mono) are injected into
 * the body class and can be referenced in CSS via var(--font-geist-sans).
 *
 * @param props - Contains children (page content) to be rendered
 * @returns The HTML document structure with fonts and styles applied
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
