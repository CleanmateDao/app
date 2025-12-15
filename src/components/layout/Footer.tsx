import { Leaf, Heart, Award } from 'lucide-react';

// X (Twitter) icon component
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

// Instagram icon component
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export default function Footer() {
  return (
    <footer className="py-12 lg:py-16 border-t border-border bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-8 lg:mb-12">
          <div className="sm:col-span-2">
            <a href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
                <Leaf className="w-5 h-5 text-background" />
              </div>
              <span className="text-xl font-bold">CleanMate</span>
            </a>
            <p className="text-muted-foreground max-w-sm mb-6">
              Empowering communities across Africa to organize cleanups, build networks, and earn rewards for environmental impact.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="w-4 h-4 text-foreground" />
              <span>Built with love for the planet</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground/80">Platform</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li><a href="/#features" className="hover:text-foreground transition-colors">Features</a></li>
              <li><a href="/#how-it-works" className="hover:text-foreground transition-colors">How It Works</a></li>
              <li><a href="/#impact" className="hover:text-foreground transition-colors">Our Impact</a></li>
              <li><a href="/#testimonials" className="hover:text-foreground transition-colors">Stories</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-foreground/80">Support</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li><a href="/help" className="hover:text-foreground transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Community</a></li>
              <li><a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 lg:pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center sm:text-left">
            © 2024 CleanMate. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <a 
                href="https://x.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
              >
                <XIcon className="w-4 h-4" />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-foreground" />
              <span className="text-sm text-muted-foreground">Powered by VeChain & B3TR</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
