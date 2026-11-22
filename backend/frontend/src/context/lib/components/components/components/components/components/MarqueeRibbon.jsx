const ITEMS = [
  "Curated Silhouettes",
  "Fine Adornment",
  "Direct Amazon Fulfillment",
  "Timeless Craft",
  "Editorial Selection",
];

export default function MarqueeRibbon() {
  const repeated = [...ITEMS, ...ITEMS, ...ITEMS];

  return (
    <div
      aria-hidden="true"
      className="w-full overflow-hidden border-y border-border/60 bg-muted/40 py-3.5 select-none"
    >
      <div className="flex whitespace-nowrap gap-10 text-[11px] tracking-[0.26em] uppercase text-muted-foreground">
        {repeated.map((label, idx) => (
          <span key={idx} className="inline-flex items-center gap-10 shrink-0">
            <span>{label}</span>
            <span className="text-aura-gold">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
