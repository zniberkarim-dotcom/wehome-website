import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/home/Hero";
import { FeaturedProperties } from "@/components/home/FeaturedProperties";
import { Services } from "@/components/home/Services";
import { PepiteDuMois } from "@/components/home/PepiteDuMois";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { CtaSection } from "@/components/home/CtaSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <FeaturedProperties />
        <Services />
        <PepiteDuMois />
        <WhyChooseUs />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
