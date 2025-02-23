// app/video/layout.tsx
"use client";

import Sidebar from "@/components/video/sidebar";

export default function VideoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      
      <main className="flex-1 flex justify-center items-center">
        <Sidebar />
        {children}
      </main>
    </div>
  );
}