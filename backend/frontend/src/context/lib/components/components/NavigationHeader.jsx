import { Search, X } from "lucide-react";
import { LogoMark, Wordmark } from "@/components/Logo";

const CATEGORIES = ["All", "Clothes", "Jewellery"];

export default function NavigationHeader({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  searchOpen,
  onToggleSearch,
}) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-md border-b border-border/60">
      <div className="max-w-[1380px] mx-auto px-5 sm:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-4">
        {/* Brand */}
        <button
          type="button"
          onClick={() => {
            onSelectCategory("All");
            onSearchChange("");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-3 text-foreground hover:opacity-80 transition-opacity shrink-0"
          data-testid="brand-logo-btn"
        >
          <LogoMark className="w-7 h-7 sm:w-8 sm:h-8 text-aura-gold" />
          <Wordmark className="text-xs sm:text-sm font-medium hidden xs:inline" />
        </button>

        {/* Category Pills */}
        <nav
          aria-label="Categories"
          className="flex items-center gap-1 sm:gap-2"
        >
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  onSelectCategory(cat);
                  scrollToSection("collection-section");
                }}
                data-testid={`category-pill-${cat.toLowerCase()}`}
                className={`px-3.5 sm:px-4 py-1.5 text-[11px] sm:text-xs tracking-[0.18em] uppercase transition-colors border ${
                  active
                    ? "bg-foreground text-background border-foreground"
                    : "bg-transparent text-muted-foreground border-transparent hover:text-foreground hover:border-border"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </nav>

        {/* Search Trigger */}
        <div className="flex items-center gap-2 shrink-0">
          {searchOpen ? (
            <div className="flex items-center border-b border-foreground pb-1 w-36 sm:w-56">
              <Search className="w-3.5 h-3.5 text-muted-foreground mr-2 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search pieces..."
                autoFocus
                data-testid="header-search-input"
                className="w-full bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => {
                  onSearchChange("");
                  onToggleSearch(false);
                }}
                data-testid="close-search-btn"
                className="text-muted-foreground hover:text-foreground ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              aria-label="Open search"
              onClick={() => onToggleSearch(true)}
              data-testid="open-search-btn"
              className="p-2 text-foreground hover:text-aura-gold transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
