import Hero from "@/components/sections/Hero";
import Ribbon from "@/components/sections/Ribbon";
import Menu from "@/components/sections/Menu";
import Spotlight from "@/components/sections/Spotlight";
import Builder from "@/components/sections/Builder";
import Filiera from "@/components/sections/Filiera";
import Locale from "@/components/sections/Locale";
import Reviews from "@/components/sections/Reviews";
import Dove from "@/components/sections/Dove";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="relative overflow-x-clip">
      <Hero />
      <Ribbon id="hero-rb" className="z-30 -mt-[72px] md:-mt-[128px]" />
      <Menu />
      <Spotlight />
      <Builder />
      <Filiera />
      <Locale />
      <Reviews />
      <Dove />
      <Footer />
    </main>
  );
}
