import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFavorites } from "@/hooks/useFavorites";
import { cn } from "@/lib/utils";

type Variant = "floating" | "inline" | "ghost";
type Size = "sm" | "md" | "lg";

interface Props {
  propertyId: string;
  variant?: Variant;
  size?: Size;
  withLabel?: boolean;
  className?: string;
  /** Stop click propagation — useful when nested inside a card link. Default true. */
  stopPropagation?: boolean;
  /** Optional callback after toggle, receives the new state. */
  onToggle?: (isNowFavorite: boolean) => void;
}

const SIZE_MAP: Record<Size, { btn: string; icon: number }> = {
  sm: { btn: "w-8 h-8",  icon: 16 },
  md: { btn: "w-10 h-10", icon: 20 },
  lg: { btn: "w-12 h-12", icon: 22 },
};

export function FavoriteButton({
  propertyId,
  variant = "floating",
  size = "md",
  withLabel = false,
  className,
  stopPropagation = true,
  onToggle,
}: Props) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const liked = isFavorite(propertyId);
  const sizing = SIZE_MAP[size];

  const handleClick = (e: React.MouseEvent) => {
    if (stopPropagation) e.stopPropagation();
    toggleFavorite(propertyId);
    onToggle?.(!liked);
  };

  // Variant styles
  const baseBtn =
    "rounded-full flex items-center justify-center transition-all shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";
  const variantClass: Record<Variant, string> = {
    floating:
      "bg-white/90 backdrop-blur-sm shadow-sm hover:scale-110 hover:bg-white text-foreground",
    inline:
      "bg-secondary hover:bg-primary/10 text-foreground/70 hover:text-primary border border-border/60",
    ghost: "hover:bg-primary/5 text-foreground/70 hover:text-primary",
  };

  if (withLabel) {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={liked}
        aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm transition-all border",
          liked
            ? "bg-primary/10 border-primary/30 text-primary"
            : "bg-card border-border text-foreground/80 hover:bg-primary/5 hover:border-primary/30 hover:text-primary",
          className
        )}
      >
        <HeartIcon liked={liked} size={18} />
        <span>{liked ? "Sauvegardé" : "Sauvegarder"}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
      className={cn(baseBtn, sizing.btn, variantClass[variant], className)}
    >
      <HeartIcon liked={liked} size={sizing.icon} />
    </button>
  );
}

function HeartIcon({ liked, size }: { liked: boolean; size: number }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={liked ? "on" : "off"}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.6, opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="inline-flex"
      >
        <Heart
          size={size}
          className={liked ? "fill-primary text-primary" : "text-current"}
          strokeWidth={liked ? 2.2 : 2}
        />
      </motion.span>
    </AnimatePresence>
  );
}
