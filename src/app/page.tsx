import HeroSection from '@/components/HeroSection';
import TrustBadges from '@/components/TrustBadges';
import ProductGrid from '@/components/ProductGrid';
import { FadeIn } from '@/components/animations/FadeIn';

export default function Home() {
  return (
    <>
      <FadeIn delay={0.1}>
        <HeroSection />
      </FadeIn>
      <FadeIn delay={0.2}>
        <TrustBadges />
      </FadeIn>
      <FadeIn delay={0.2}>
        <ProductGrid />
      </FadeIn>
    </>
  );
}
