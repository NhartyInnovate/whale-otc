import Header from '@/components/Header';
import Hero from '@/components/Hero';
import MarketSection from '@/components/MarketSection';
import HowItWorks from '@/components/HowItWorks';
import TrustSection from '@/components/TrustSection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <HowItWorks />
      <MarketSection />
      <TrustSection />
      <Footer />
    </main>
  );
}
