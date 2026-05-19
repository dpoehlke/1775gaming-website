import HeroSection from "./components/home/HeroSection";
import OmniverseSection from "./components/home/OmniverseSection";
import PillarsSection from "./components/home/PillarsSection";
import NewsletterSection from "./components/home/NewsletterSection";
import BlogPreviewSection from "./components/home/BlogPreviewSection";
import BetaBanner from "./components/home/BetaBanner";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <OmniverseSection />
      <PillarsSection />
      <NewsletterSection />
      <BlogPreviewSection />
      <BetaBanner />
    </>
  );
}
