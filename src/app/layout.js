import { Manjari } from "next/font/google";
import "./globals.css";

const manjari = Manjari({
  variable: "--font-manjari",
  weight: "400",
  subsets: ["latin"],
});


export const metadata = {
  title: "SmartGrowthmanager",
  description: "Bulk courier automation platform for every business.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${manjari.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
