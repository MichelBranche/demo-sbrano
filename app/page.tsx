import Hero from "@/components/sections/Hero";
import Menu from "@/components/sections/Menu";
import Spotlight from "@/components/sections/Spotlight";
import Builder from "@/components/sections/Builder";
import Filiera from "@/components/sections/Filiera";
import Locale from "@/components/sections/Locale";
import Reviews from "@/components/sections/Reviews";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <main className="relative overflow-x-clip">
      <Hero />
      <Menu />
      <Spotlight />
      <Builder />
      <Filiera />
      <Locale />
      <Reviews />
      <Footer />
    </main>
  );
}
