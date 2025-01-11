import ImageGallery from '@/components/gallery/ImageGallery';
import HeroSection from '../components/hero/HeroSection';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-start">
      {/* HeroSection */}
      <HeroSection />
      <ImageGallery />

    </div>
  );
}
