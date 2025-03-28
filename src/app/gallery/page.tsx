import HeroSection from "@/features/hero/HeroSection";
import ImageGrid from "@/features/gallery/SearchImage";

export default function HomePage() {
  return (
    <div className="flex flex-col md:flex-row max-w-7xl mx-auto p-4 gap-6">
      {/* Hero Section */}
      <HeroSection />

      {/* Main Content */}
      <main className="flex-grow">
        <ImageGrid />
      </main>
    </div>
  );
}
