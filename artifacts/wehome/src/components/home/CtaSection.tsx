import { motion } from "framer-motion";
import { ArrowRight, Home, Key } from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export function CtaSection() {
  const { t } = useTranslation();

  return (
    <section className="py-24 md:py-32 bg-background relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-card rounded-3xl p-10 md:p-16 border border-border shadow-xl shadow-black/5 text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-6">
              {t("cta_band.title")}
            </h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
              {t("cta_band.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/publier"
                className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary-hover text-primary-foreground rounded-[6px] font-bold text-lg flex items-center justify-center gap-3 shadow-md shadow-black/5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              >
                <Key size={22} />
                {t("cta_band.cta_sell")}
              </Link>

              <Link
                href="/acheter"
                className="w-full sm:w-auto px-8 py-4 bg-secondary text-secondary-foreground border border-border rounded-[6px] font-bold text-lg flex items-center justify-center gap-3 hover:bg-secondary/80 hover:-translate-y-1 transition-all duration-300"
              >
                <Home size={22} />
                {t("cta_band.cta_buy")}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
