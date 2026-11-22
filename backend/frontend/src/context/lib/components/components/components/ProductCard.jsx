import { ArrowUpRight } from "lucide-react";

const API_BASE = (process.env.REACT_APP_BACKEND_URL || "").trim().replace(/\/+$/, "");

export function resolveImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("/api/")) return `${API_BASE}${url}`;
  return url;
}

export default function ProductCard({ product }) {
  const imgSrc = resolveImageUrl(product.image_url);

  return (
    <article
      className="group flex flex-col bg-card border border-border/60 hover:border-aura-gold/70 transition-colors duration-300"
      data-testid={`product-card-${product.id}`}
    >
      <a
        href={product.amazon_url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative aspect-[3/4] w-full overflow-hidden bg-muted block"
      >
        <img
          src={imgSrc}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-700 ease-out"
        />
      </a>

      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.22em] uppercase text-aura-gold mb-1.5">
            {product.category}
          </p>
          <h3 className="font-serif text-lg sm:text-xl leading-snug text-foreground line-clamp-2">
            {product.name}
          </h3>
        </div>

        <a
          href={product.amazon_url}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={`buy-amazon-${product.id}`}
          className="inline-flex items-center justify-between w-full pt-3 border-t border-border/60 text-xs tracking-[0.18em] uppercase text-foreground hover:text-aura-gold transition-colors"
        >
          <span>View on Amazon</span>
          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </div>
    </article>
  );
}
