import { LandingHeroBackdrop } from "@/components/layout/landing-hero-backdrop";
import { Hero } from "@/components/sections/hero";
import { ValueStrip } from "@/components/sections/value-strip";
import { HomeMarquee } from "@/components/sections/home-marquee";
import { Features } from "@/components/sections/features";
import { Pricing } from "@/components/sections/pricing";
import { TestimonialsWall } from "@/components/sections/testimonials-wall";
import { Faq } from "@/components/sections/faq";

export default function Home() {
  return (
    <div className="landing-grain landing-hero-canvas relative isolate">
      <LandingHeroBackdrop />
      <div className="relative z-1">
        <Hero />
        <ValueStrip />
        <HomeMarquee />
        <Features />
        <Pricing />
        <TestimonialsWall />
        <Faq />
      </div>
    </div>
  );
}
