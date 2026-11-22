import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { LogoMark, Wordmark } from "@/components/Logo";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1617038220319-276d3f363806?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=80",
];

export default function HeroWelcome() {
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const scrollToCollection = () => {
    const el = document.getElementById("collection-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      aria-label="Welcome"
      className="relative min-h-[82vh] sm:min-h-[88vh] flex items-end overflow-hidden bg-stone-950 text-white"
    >
      {HERO_IMAGES.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
            i === slideIdx ? "opacity-55 scale-105" : "opacity-0 scale-100"
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/45 to-transparent" />

      <div className="relative z-10 max-w-[1380px] w-full mx-auto px-5 sm:px-8 pb-14 sm:pb-20 pt-28 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 text-aura-gold mb-5">
            <LogoMark className="w-7 h-7" />
            <Wordmark className="text-xs sm:text-sm" />
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-[68px] leading-[1.04] tracking-tight font-normal">
            Luminous silhouettes &amp; quiet adornment.
          </h1>
          <p className="mt-5 text-sm sm:text-base text-stone-200/90 max-w-xl leading-relaxed">
            A curated edit of refined apparel and fine jewellery pieces, handpicked for effortless presence.
          </p>
        </div>

        <button
          type="button"
          onClick={scrollToCollection}
          data-testid="hero-explore-btn"
          className="inline-flex items-center gap-3 self-start md:self-end px-6 py-3.5 border border-white/30 hover:border-aura-gold hover:text-aura-gold text-xs tracking-[0.22em] uppercase transition-colors"
        >
          <span>Explore Edit</span>
          <ArrowDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
}
