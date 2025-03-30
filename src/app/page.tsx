import ImageGallery from "@/features/hero/Gallery";
import HeroSection from "../features/hero/HeroSection";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-start">
      {/* HeroSection */}
      <HeroSection />
      <ImageGallery />
    </div>
  );
}
