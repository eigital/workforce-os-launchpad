import { Button } from "@/components/ui/button";
import { Play, ArrowRight, CheckCircle } from "lucide-react";
import dashboardHero from "@/assets/dashboard-hero.jpg";

interface HeroProps {
  onOpenSignUp?: () => void;
}

const Hero = ({ onOpenSignUp }: HeroProps) => {
  return (
    <section className="pt-20 pb-16 bg-gradient-to-br from-background via-feature to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <span className="text-sm font-medium text-primary">
                  🚀 Trusted by 50,000+ businesses
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                The Complete{" "}
                <span className="bg-gradient-hero bg-clip-text text-transparent">
                  Workforce
                </span>{" "}
                Management Platform
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Streamline scheduling, payroll, time tracking, and team management all in one powerful platform. Built for modern businesses.
              </p>
            </div>

            {/* Key Benefits */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-foreground">Save 8+ hours per week on scheduling</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-foreground">Reduce payroll errors by 98%</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary" />
                <span className="text-foreground">Increase team productivity by 35%</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="hero" size="lg" className="group" onClick={onOpenSignUp}>
                Start Free Trial
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button variant="outline" size="lg" className="group">
                <Play className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-6 pt-4 border-t border-primary/10">
              <div className="text-sm text-muted-foreground">
                ⭐ 4.9/5 from 12,000+ reviews
              </div>
              <div className="text-sm text-muted-foreground">
                🔒 Compliant to global security standards with end-to-end encryption
              </div>
            </div>
          </div>

          {/* Right Content - Dashboard Image */}
          <div className="relative">
            <div className="relative z-10 animate-float">
              <img
                src={dashboardHero}
                alt="workforceOS Dashboard Interface"
                className="w-full h-auto rounded-2xl shadow-elegant border border-primary/10"
              />
            </div>
            
            {/* Background decoration */}
            <div className="absolute -top-8 -right-8 w-72 h-72 bg-gradient-hero opacity-20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-gradient-accent opacity-15 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;