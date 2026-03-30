import { Link } from "wouter";
import { Home } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-24 px-4">
        <div className="text-center max-w-md">
          <h1 className="text-9xl font-display font-bold text-primary mb-4">404</h1>
          <h2 className="text-3xl font-display font-bold text-foreground mb-6">Page Not Found</h2>
          <p className="text-muted-foreground text-lg mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <Home size={20} />
            Back to Homepage
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
