import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { StatsBar } from "@/components/home/StatsBar";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Services } from "@/components/home/Services";
import { BeforeAfter } from "@/components/home/BeforeAfter";
import { PepiteDuMois } from "@/components/home/PepiteDuMois";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { CtaSection } from "@/components/home/CtaSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <StatsBar />
        <FeaturedProperties />
        <HowItWorks />
        <Services />
        <BeforeAfter />
        <PepiteDuMois />
        <WhyChooseUs />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
