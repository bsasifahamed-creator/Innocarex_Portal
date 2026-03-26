import Navbar from "@/components/Navbar";
import ScrollToTop from "@/components/ScrollToTop";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import HowWeWork from "@/components/sections/HowWeWork";
import Solutions from "@/components/sections/Solutions";
import Wellness from "@/components/sections/Wellness";
import Partners from "@/components/sections/Partners";
import Values from "@/components/sections/Values";
import WhyUs from "@/components/sections/WhyUs";
import Commitment from "@/components/sections/Commitment";
import Insights from "@/components/sections/Insights";
import FAQ from "@/components/sections/FAQ";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <About />
      <HowWeWork />
      <Solutions />
      <Wellness />
      <Partners />
      <Values />
      <WhyUs />
      <Commitment />
      <Insights />
      <FAQ />
      <Contact />
      <Footer />
      <ScrollToTop />
    </main>
  );
}
