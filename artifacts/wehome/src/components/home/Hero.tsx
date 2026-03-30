import { useState } from "react";
import { Search, MapPin, Home as HomeIcon, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { PROPERTY_TYPES } from "@/lib/data";

export function Hero() {
  const [activeTab, setActiveTab] = useState("buy");

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-12 overflow-hidden">
      {/* Background Image / Gradient overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-bg.png`}
          alt="Modern Architecture" 
          className="w-full h-full object-cover object-center"
        />
        {/* Gradient overlay to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/40 to-background/90" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-3xl mb-12"
        >
          <span className="inline-block py-1.5 px-4 rounded-full bg-primary/10 text-primary font-semibold text-sm mb-6 border border-primary/20 shadow-sm backdrop-blur-md">
            The Hybrid Real Estate Ecosystem
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-[1.1] tracking-tight mb-6">
            Find your place <br/>in the world.
          </h1>
          <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto font-medium">
            We merge real estate expertise, smart marketing, and data-driven strategy to help you find or sell your home faster.
          </p>
        </motion.div>

        {/* Search Component */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-5xl bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 p-4 md:p-8"
        >
          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-border/50 pb-4">
            {["buy", "rent", "sell"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full text-sm font-semibold capitalize transition-all duration-200 ${
                  activeTab === tab 
                    ? "bg-primary text-white shadow-md" 
                    : "text-foreground/60 hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Location */}
            <div className="md:col-span-4 relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <MapPin size={20} />
              </div>
              <input 
                type="text" 
                placeholder="City, Neighborhood, or Address" 
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/50 border border-border/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-foreground placeholder:text-muted-foreground font-medium"
              />
            </div>

            {/* Property Type */}
            <div className="md:col-span-3 relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <HomeIcon size={20} />
              </div>
              <select className="w-full pl-12 pr-8 py-4 rounded-2xl bg-white/50 border border-border/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-foreground font-medium appearance-none">
                <option value="">Property Type</option>
                {PROPERTY_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="md:col-span-3 relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <DollarSign size={20} />
              </div>
              <select className="w-full pl-12 pr-8 py-4 rounded-2xl bg-white/50 border border-border/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-foreground font-medium appearance-none">
                <option value="">Any Price</option>
                <option value="0-500k">Under $500,000</option>
                <option value="500k-1m">$500,000 - $1M</option>
                <option value="1m-2m">$1M - $2M</option>
                <option value="2m+">$2M+</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-2">
              <button className="w-full h-full min-h-[56px] bg-primary text-primary-foreground rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
                <Search size={20} />
                <span>Search</span>
              </button>
            </div>
            
          </div>
        </motion.div>
      </div>
    </section>
  );
}
