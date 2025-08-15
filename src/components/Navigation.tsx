import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Menu, X, ChevronDown, Calendar, Clock, DollarSign, Users, BarChart3, Smartphone } from "lucide-react";
import { useState } from "react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const products = [
    {
      name: "Workforce Scheduling",
      description: "AI-powered scheduling and shift management",
      icon: Calendar,
      href: "/products/scheduling"
    },
    {
      name: "Time Tracking",
      description: "Accurate time tracking with GPS verification",
      icon: Clock,
      href: "/products/time-tracking"
    },
    {
      name: "Payroll Management",
      description: "Automated payroll processing and compliance",
      icon: DollarSign,
      href: "/products/payroll"
    },
    {
      name: "Team Management",
      description: "Employee profiles and performance tracking",
      icon: Users,
      href: "/products/team"
    },
    {
      name: "Analytics & Reports",
      description: "Real-time insights and workforce analytics",
      icon: BarChart3,
      href: "/products/analytics"
    },
    {
      name: "Mobile Apps",
      description: "Native iOS and Android applications",
      icon: Smartphone,
      href: "/products/mobile"
    }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              workforceOS
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Products Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-foreground hover:text-primary transition-colors font-semibold">
                Products
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 bg-background border border-primary/20 shadow-elegant z-50 p-2">
                <div className="grid gap-1">
                  {products.map((product, index) => {
                    const IconComponent = product.icon;
                    return (
                      <DropdownMenuItem 
                        key={index} 
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary cursor-pointer data-[highlighted]:bg-secondary data-[highlighted]:text-foreground"
                      >
                        <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <IconComponent className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-foreground">{product.name}</div>
                          <div className="text-sm text-muted-foreground">{product.description}</div>
                        </div>
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <a href="#features" className="text-foreground hover:text-primary transition-colors font-semibold">
              Features
            </a>
            <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors font-semibold">
              How it Works
            </a>
            <a href="/pricing" className="text-foreground hover:text-primary transition-colors font-semibold">
              Pricing
            </a>
            <a href="#integrations" className="text-foreground hover:text-primary transition-colors font-semibold">
              Integrations
            </a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              Sign In
            </Button>
            <Button variant="hero" size="sm">
              Start Free Trial
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-background/95 backdrop-blur-md border border-primary/10 rounded-lg mt-2">
              {/* Mobile Products Menu */}
              <div className="border-b border-primary/10 pb-2 mb-2">
                <div className="px-3 py-2 text-foreground font-semibold">Products</div>
                {products.map((product, index) => {
                  const IconComponent = product.icon;
                  return (
                    <a
                      key={index}
                      href={product.href}
                      className="flex items-center gap-3 px-3 py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <IconComponent className="h-4 w-4" />
                      {product.name}
                    </a>
                  );
                })}
              </div>
              
              <a
                href="#features"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                How it Works
              </a>
              <a
                href="/pricing"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Pricing
              </a>
              <a
                href="#integrations"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors font-semibold"
                onClick={() => setIsMenuOpen(false)}
              >
                Integrations
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                <Button variant="ghost" className="w-full">
                  Sign In
                </Button>
                <Button variant="hero" className="w-full">
                  Start Free Trial
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;