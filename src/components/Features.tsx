import { Calendar, Clock, DollarSign, Users, BarChart3, Smartphone } from "lucide-react";
import { Glass3D } from "@/components/3d/Glass3D";

const Features = () => {
  const features = [
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "AI-powered scheduling that considers availability, skills, and labor laws. Drag-and-drop simplicity with powerful automation.",
      color: "text-primary"
    },
    {
      icon: Clock,
      title: "Time Tracking",
      description: "Accurate time tracking with geolocation, photo verification, and break management. Prevent time theft and ensure compliance.",
      color: "text-accent"
    },
    {
      icon: DollarSign,
      title: "Payroll Integration",
      description: "Seamless payroll processing with automatic calculations, tax compliance, and direct deposit. Reduce payroll errors to zero.",
      color: "text-primary"
    },
    {
      icon: Users,
      title: "Team Management",
      description: "Centralized employee profiles, performance tracking, and communication tools. Build stronger, more connected teams.",
      color: "text-accent"
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description: "Real-time insights into labor costs, productivity metrics, and scheduling efficiency. Make data-driven decisions.",
      color: "text-primary"
    },
    {
      icon: Smartphone,
      title: "Mobile First",
      description: "Native mobile apps for iOS and Android. Manage your workforce from anywhere, anytime with full functionality.",
      color: "text-accent"
    }
  ];

  return (
    <section id="features" className="py-20 bg-feature">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-6">
            <span className="text-sm font-medium text-primary">
              ✨ Everything you need
            </span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Powerful Features for{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Modern Workforces
            </span>
          </h2>
          
          <p className="text-xl text-muted-foreground">
            From scheduling to payroll, we've got every aspect of workforce management covered with enterprise-grade tools.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            const depth = index % 3 === 0 ? 'close' : index % 3 === 1 ? 'medium' : 'far';
            return (
              <Glass3D
                key={index}
                depth={depth}
                hoverEffect={true}
                className="group p-8"
              >
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-hero rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                </div>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Glass3D>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6">
            Want to see all features in action?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center px-6 py-3 bg-gradient-hero text-white font-semibold rounded-lg hover:shadow-glow hover:scale-105 transition-all duration-300">
              Schedule a Demo
            </button>
            <button className="inline-flex items-center px-6 py-3 border border-primary/20 bg-background/80 backdrop-blur-sm text-primary rounded-lg hover:bg-primary/10 hover:border-primary/40 transition-all duration-300">
              View Full Feature List
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;