import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InnoCare X — Operational Ownership. Cost Discipline. Sustainable Growth.",
  description:
    "InnoCare X is a UAE-based health insurance distribution platform enabling brokers, typing centres, and corporate partners to issue policies digitally.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800;900&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-body overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
