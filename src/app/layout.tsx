// app/layout.tsx
import "./styles/globals.css";
import Navbar from "@/components/common/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Image Site",
  // ...
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-white text-gray-800">
        <AuthProvider>
          <Navbar />
          <div className="">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
