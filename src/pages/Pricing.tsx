import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Check, Star, Zap, Shield, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AllInOneAuthModal from "@/components/auth/AllInOneAuthModal";

const Pricing = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  const handleOpenSignUp = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleOpenSignIn = () => {
    setAuthMode('signin');
    setIsAuthModalOpen(true);
  };

  const handleModeSwitch = () => {
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
  };
  const plans = [
    {
      name: "Starter",
      price: "$0",
      period: "per month",
      description: "Perfect for small teams getting started",
      popular: false,
      features: [
        "Up to 15 employees",
        "Basic scheduling",
        "Time clock",
        "Mobile app",
        "Email support",
        "Basic reporting"
      ],
      cta: "Start Free",
      highlight: "FREE FOREVER"
    },
    {
      name: "Professional", 
      price: "$4",
      period: "per employee/month",
      description: "Most popular for growing businesses",
      popular: true,
      features: [
        "Unlimited employees",
        "Advanced scheduling",
        "Time tracking & GPS",
        "Payroll integration",
        "Team messaging",
        "Labor cost forecasting",
        "Shift trades & requests",
        "Performance tracking"
      ],
      cta: "Start Free Trial",
      highlight: "MOST POPULAR"
    },
    {
      name: "Enterprise",
      price: "$6",
      period: "per employee/month", 
      description: "Advanced features for larger operations",
      popular: false,
      features: [
        "Everything in Professional",
        "Advanced analytics",
        "Custom integrations",
        "API access",
        "Dedicated support",
        "Compliance reporting",
        "Multi-location management",
        "Custom workflows"
      ],
      cta: "Contact Sales",
      highlight: "ENTERPRISE GRADE"
    },
    {
      name: "All-in-One",
      price: "$8",
      period: "per employee/month",
      description: "Complete workforce solution",
      popular: false,
      features: [
        "Everything in Enterprise",
        "Full payroll processing",
        "Benefits management",
        "HR compliance tools",
        "Advanced forecasting",
        "White-label options",
        "24/7 phone support",
        "Implementation specialist"
      ],
      cta: "Contact Sales", 
      highlight: "COMPLETE SOLUTION"
    }
  ];

  const addOns = [
    {
      name: "Advanced Payroll",
      price: "$2/employee/month",
      description: "Full payroll processing with tax filing, direct deposits, and compliance reporting.",
      badge: "HOT",
      color: "bg-red-500"
    },
    {
      name: "HR Compliance",
      price: "$1.50/employee/month", 
      description: "Stay compliant with labor laws, automated break tracking, and overtime alerts.",
      badge: "NEW",
      color: "bg-green-500"
    },
    {
      name: "Performance Analytics",
      price: "$1/employee/month",
      description: "Advanced workforce analytics, productivity insights, and forecasting tools.",
      badge: "POPULAR",
      color: "bg-primary"
    },
    {
      name: "API & Integrations",
      price: "$50/month",
      description: "Connect with 100+ tools including QuickBooks, Slack, and custom systems.",
      badge: "PRO",
      color: "bg-accent"
    },
    {
      name: "24/7 Phone Support",
      price: "$25/month",
      description: "Priority phone support with dedicated account managers and training.",
      badge: "PREMIUM",
      color: "bg-purple-600"
    },
    {
      name: "Multi-Location",
      price: "$3/location/month",
      description: "Manage multiple locations with centralized reporting and scheduling.",
      badge: "ENTERPRISE",
      color: "bg-blue-600"
    }
  ];

  const comparisonFeatures = [
    { feature: "Employees", starter: "Up to 15", professional: "Unlimited", enterprise: "Unlimited", allinone: "Unlimited" },
    { feature: "Basic Scheduling", starter: true, professional: true, enterprise: true, allinone: true },
    { feature: "Time Tracking", starter: true, professional: true, enterprise: true, allinone: true },
    { feature: "Mobile Apps", starter: true, professional: true, enterprise: true, allinone: true },
    { feature: "Basic Reporting", starter: true, professional: true, enterprise: true, allinone: true },
    { feature: "Advanced Scheduling", starter: false, professional: true, enterprise: true, allinone: true },
    { feature: "GPS Time Tracking", starter: false, professional: true, enterprise: true, allinone: true },
    { feature: "Payroll Integration", starter: false, professional: true, enterprise: true, allinone: true },
    { feature: "Team Messaging", starter: false, professional: true, enterprise: true, allinone: true },
    { feature: "Labor Cost Forecasting", starter: false, professional: true, enterprise: true, allinone: true },
    { feature: "Performance Tracking", starter: false, professional: true, enterprise: true, allinone: true },
    { feature: "Advanced Analytics", starter: false, professional: false, enterprise: true, allinone: true },
    { feature: "API Access", starter: false, professional: false, enterprise: true, allinone: true },
    { feature: "Multi-location", starter: false, professional: false, enterprise: true, allinone: true },
    { feature: "Dedicated Support", starter: false, professional: false, enterprise: true, allinone: true },
    { feature: "Full Payroll Processing", starter: false, professional: false, enterprise: false, allinone: true },
    { feature: "Benefits Management", starter: false, professional: false, enterprise: false, allinone: true },
    { feature: "HR Compliance Tools", starter: false, professional: false, enterprise: false, allinone: true }
  ];

  const faqs = [
    {
      question: "What's included in the free plan?",
      answer: "Our Starter plan is free forever for up to 15 employees and includes basic scheduling, time tracking, mobile apps, and email support."
    },
    {
      question: "Can I upgrade or downgrade anytime?",
      answer: "Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades take effect at your next billing cycle."
    },
    {
      question: "How does per-employee pricing work?",
      answer: "You only pay for active employees who are scheduled or clock in during the billing period. There's no charge for inactive employees."
    },
    {
      question: "Is there a setup fee or contract?",
      answer: "No setup fees and no long-term contracts. You can cancel anytime with 30 days notice. We believe our product should earn your business every month."
    },
    {
      question: "Do you offer volume discounts?",
      answer: "Yes! For teams with 100+ employees, we offer custom pricing and volume discounts. Contact our sales team for a personalized quote."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        user={user}
        onOpenSignUp={handleOpenSignUp}
        onOpenSignIn={handleOpenSignIn}
      />
      
      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-background via-feature to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full border border-primary/20 mb-6">
              <span className="text-sm font-medium text-primary">
                💰 14-day free trial on all plans
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find a Plan to{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Fuel Your Goals
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Choose the perfect workforce management solution for your business. Start free and scale as you grow.
            </p>
            
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>24/7 support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 bg-feature">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-2xl border transition-all duration-300 hover:shadow-elegant hover:-translate-y-1 ${
                  plan.popular 
                    ? 'border-primary bg-background shadow-primary' 
                    : 'border-primary/10 bg-background hover:border-primary/30'
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-hero text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      {plan.highlight}
                    </div>
                  </div>
                )}
                
                {/* Plan header */}
                <div className="text-center mb-8">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground text-sm">{plan.description}</p>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button 
                  variant={plan.popular ? "hero" : "outline"} 
                  className="w-full"
                  size="lg"
                  onClick={plan.cta.includes('Contact') ? undefined : handleOpenSignUp}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Add these tools to any plan to get more done
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Supercharge your workforce management with powerful add-ons designed to scale with your business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addOns.map((addon, index) => (
              <div
                key={index}
                className="p-6 bg-feature rounded-xl border border-primary/10 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold mb-1">{addon.name}</h3>
                    <div className="text-primary font-semibold">{addon.price}</div>
                  </div>
                  <div className={`${addon.color} text-white text-xs font-bold px-2 py-1 rounded`}>
                    {addon.badge}
                  </div>
                </div>
                <p className="text-muted-foreground text-sm mb-4">{addon.description}</p>
                <Button variant="outline" size="sm" className="w-full" onClick={handleOpenSignUp}>
                  Add to Plan
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-16 bg-feature">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Compare our plans</h2>
            <p className="text-muted-foreground">
              See exactly what's included in each plan to make the best choice for your business.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-background rounded-xl border border-primary/10">
              <thead>
                <tr className="border-b border-primary/10">
                  <th className="text-left p-4 font-semibold">Features</th>
                  <th className="text-center p-4 font-semibold">Starter</th>
                  <th className="text-center p-4 font-semibold bg-primary/5">Professional</th>
                  <th className="text-center p-4 font-semibold">Enterprise</th>
                  <th className="text-center p-4 font-semibold">All-in-One</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, index) => (
                  <tr key={index} className="border-b border-primary/10 hover:bg-primary/5">
                    <td className="p-4 font-medium">{row.feature}</td>
                    <td className="p-4 text-center">
                      {typeof row.starter === 'boolean' ? (
                        row.starter ? <Check className="h-4 w-4 text-primary mx-auto" /> : '—'
                      ) : (
                        row.starter
                      )}
                    </td>
                    <td className="p-4 text-center bg-primary/5">
                      {typeof row.professional === 'boolean' ? (
                        row.professional ? <Check className="h-4 w-4 text-primary mx-auto" /> : '—'
                      ) : (
                        row.professional
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.enterprise === 'boolean' ? (
                        row.enterprise ? <Check className="h-4 w-4 text-primary mx-auto" /> : '—'
                      ) : (
                        row.enterprise
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {typeof row.allinone === 'boolean' ? (
                        row.allinone ? <Check className="h-4 w-4 text-primary mx-auto" /> : '—'
                      ) : (
                        row.allinone
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="text-center mt-8">
            <Button variant="hero" size="lg" onClick={handleOpenSignUp}>
              Start Your Free Trial
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Questions? We've got time.</h2>
            <p className="text-muted-foreground">
              Can't find what you're looking for? Contact our sales team for personalized help.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="p-6 bg-feature rounded-xl border border-primary/10">
                <h3 className="font-semibold mb-3">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              GET 14 DAYS OF ALL-IN-ONE FOR FREE.
            </h2>
            <p className="text-xl mb-8 text-white/90">
              No credit card required.
            </p>
            <Button variant="accent" size="lg" className="text-black font-semibold" onClick={handleOpenSignUp}>
              Start Free Trial
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      <AllInOneAuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        mode={authMode}
        onModeSwitch={handleModeSwitch}
      />
    </div>
  );
};

export default Pricing;