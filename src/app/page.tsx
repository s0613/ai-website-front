import Gallery from "@/features/hero/Gallery";
import HeroSection from "../features/hero/HeroSection";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-start bg-black">
      {/* HeroSection */}
      <HeroSection />
      <Gallery />
    </div>
  );
}
