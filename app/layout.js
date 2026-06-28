import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import CitizenNotifications from "./components/CitizenNotifications";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PeoplePost - Civic Issue Reporting Platform",
  description: "Report and track community issues. Connect citizens with local authorities for faster resolution.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CitizenNotifications />
        {children}
      </body>
    </html>
  );
}
