import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Calendar, BarChart } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      step: "01",
      icon: Users,
      title: "Add Your Team",
      description: "Quickly import employee information and set up roles, departments, and permissions in minutes.",
      highlight: "2-minute setup"
    },
    {
      step: "02", 
      icon: Calendar,
      title: "Create Schedules",
      description: "Use our AI-powered scheduling engine to create optimized schedules that consider availability, skills, and labor costs.",
      highlight: "AI-optimized"
    },
    {
      step: "03",
      icon: BarChart,
      title: "Track & Optimize",
      description: "Monitor performance, track time, process payroll, and use insights to continuously improve your workforce efficiency.",
      highlight: "Real-time insights"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-accent/10 rounded-full border border-accent/20 mb-6">
            <span className="text-sm font-medium text-accent-foreground">
              🎯 Simple process
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get Started in{" "}
            <span className="bg-gradient-accent bg-clip-text text-transparent">
              3 Easy Steps
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground">
            From setup to success in under 10 minutes. No complex configuration, no lengthy training required.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting lines for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-accent to-primary opacity-20 transform -translate-y-1/2 z-0"></div>
          
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12 relative z-10">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div key={index} className="text-center group">
                  {/* Step indicator */}
                  <div className="relative mb-8">
                    <div className="mx-auto w-20 h-20 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-xl shadow-elegant group-hover:scale-110 transition-transform duration-300">
                      {step.step}
                    </div>
                    
                    {/* Highlight badge */}
                    <div className="absolute -top-2 -right-6 bg-accent text-accent-foreground text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap">
                      {step.highlight}
                    </div>
                  </div>

                  {/* Icon */}
                  <div className="mb-6 flex justify-center">
                    <div className="w-16 h-16 bg-feature rounded-2xl flex items-center justify-center border border-primary/10 group-hover:border-primary/30 transition-colors duration-300">
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-4 text-foreground group-hover:text-primary transition-colors">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                    {step.description}
                  </p>

                  {/* Arrow for desktop */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                      <ArrowRight className="h-6 w-6 text-primary/40" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16 p-8 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-2xl border border-primary/10">
          <h3 className="text-2xl font-semibold mb-4">
            Ready to transform your workforce management?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Join thousands of businesses already saving time and money with workforceOS.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" className="group">
              Start Your Free Trial
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg">
              Book a Consultation
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;