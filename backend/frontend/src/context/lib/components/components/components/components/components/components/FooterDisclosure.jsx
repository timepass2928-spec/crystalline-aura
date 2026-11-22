import { Link } from "react-router-dom";
import { LogoMark, Wordmark } from "@/components/Logo";

export default function FooterDisclosure() {
  return (
    <footer className="border-t border-border/70 bg-muted/30 text-muted-foreground">
      <div className="max-w-[1380px] mx-auto px-5 sm:px-8 py-12 sm:py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div className="space-y-3 max-w-lg">
          <div className="flex items-center gap-3 text-foreground">
            <LogoMark className="w-6 h-6 text-aura-gold" />
            <Wordmark className="text-xs font-medium" />
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Affiliate Disclosure: As an Amazon Associate, Crystalline Aura may earn from qualifying purchases made through curated outbound links at no additional cost to you.
          </p>
        </div>

        <div className="flex items-center gap-6 text-[11px] tracking-[0.2em] uppercase">
          <span>© {new Date().getFullYear()} Crystalline Aura</span>
          <Link
            to="/admin"
            className="hover:text-foreground transition-colors underline underline-offset-4"
          >
            Curator
          </Link>
        </div>
      </div>
    </footer>
  );
}
