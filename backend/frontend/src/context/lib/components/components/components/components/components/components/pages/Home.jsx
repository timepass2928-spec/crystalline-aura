import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import NavigationHeader from "@/components/NavigationHeader";
import HeroWelcome from "@/components/HeroWelcome";
import MarqueeRibbon from "@/components/MarqueeRibbon";
import ProductCard from "@/components/ProductCard";
import FooterDisclosure from "@/components/FooterDisclosure";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (activeCategory !== "All") params.category = activeCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      const { data } = await api.get("/products", { params });
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 200);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <NavigationHeader
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchOpen={searchOpen}
        onToggleSearch={setSearchOpen}
      />

      <main className="flex-1">
        <HeroWelcome />
        <MarqueeRibbon />

        <section
          id="collection-section"
          className="max-w-[1380px] mx-auto px-5 sm:px-8 py-16 sm:py-24"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 sm:mb-14">
            <div>
              <p className="text-[11px] tracking-[0.25em] uppercase text-aura-gold mb-2">
                The Curation
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-normal">
                {activeCategory === "All" ? "All Pieces" : activeCategory}
              </h2>
            </div>

            <p className="text-xs tracking-[0.18em] uppercase text-muted-foreground">
              {loading ? "Loading..." : `${products.length} ${products.length === 1 ? "Piece" : "Pieces"}`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {[...Array(8)].map((_, idx) => (
                <div
                  key={idx}
                  className="aspect-[3/4] bg-muted/60 animate-pulse border border-border/40"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-border">
              <p className="font-serif text-2xl text-foreground">
                No pieces match your selection
              </p>
              <p className="mt-2 text-xs tracking-[0.18em] uppercase text-muted-foreground">
                Try clearing your search or switching categories
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>

      <FooterDisclosure />
    </div>
  );
}
