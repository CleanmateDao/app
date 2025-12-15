import { useNavigate } from 'react-router-dom';
import { Leaf, Sun, Moon, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/ThemeProvider';

export default function Header() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleGetStarted = () => {
    const isOnboarded = localStorage.getItem('onboardingComplete') === 'true';
    navigate(isOnboarded ? '/dashboard' : '/onboarding');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-foreground flex items-center justify-center">
              <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-background" />
            </div>
            <span className="text-lg sm:text-xl font-bold tracking-tight">CleanMate</span>
          </a>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="/#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How it Works</a>
            <a href="/#impact" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Impact</a>
            <a href="/#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Stories</a>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="rounded-full w-8 h-8 sm:w-10 sm:h-10"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button onClick={handleGetStarted} className="gap-2 text-sm sm:text-base px-3 sm:px-4">
              <Rocket className="w-4 h-4 hidden sm:block" />
              Launch App
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
