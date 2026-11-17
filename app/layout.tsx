import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { HospitalProvider } from "@/context/HospitalProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { APP_NAME } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "A complete hospital management workspace for patients, staff, appointments, records, wards, laboratory, pharmacy, and billing.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-sans">
        <ToastProvider>
          <HospitalProvider>{children}</HospitalProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
