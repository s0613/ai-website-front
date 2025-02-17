import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { AuthProvider } from '../context/AuthContext';
import './styles/globals.css';
import type { Metadata } from 'next';

// Set the base URL for metadata (used for resolving relative URLs)
export const metadataBase = new URL("https://yourdomain.com");

export const metadata: Metadata = {
  title: {
    default: "AI Image Site",
    template: "%s | AI Image Generator",
  },
  description: "Next.js로 만든 AI 이미지 생성 사이트",
  keywords: ["AI", "Image", "Generator", "Next.js", "SEO"],
  openGraph: {
    title: "AI Image Site",
    description: "Next.js로 만든 AI 이미지 생성 사이트",
    url: "https://yourdomain.com",
    siteName: "AI Image Site",
    images: [
      {
        url: "/images/og-image.jpg", // Open Graph preview image
        width: 1200,
        height: 630,
        alt: "AI Image Site Preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Image Site",
    description: "Next.js로 만든 AI 이미지 생성 사이트",
    images: ["/images/og-image.jpg"],
  },
  robots: "index, follow",
};

// Export the viewport configuration separately
export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-white text-gray-800">
        <AuthProvider>
          <Navbar />
          <div className="container mx-auto px-4 lg:px-8">{children}</div>
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}
