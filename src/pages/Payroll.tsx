import { Calculator, Clock, DollarSign, FileText, Shield, Smartphone, Users, CheckCircle, Star, TrendingUp, Calendar, BarChart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function Payroll() {
  const features = [
    {
      icon: Calculator,
      title: "Automated Calculations",
      description: "Let WorkforceOS handle complex payroll calculations automatically with built-in tax compliance."
    },
    {
      icon: Clock,
      title: "Time Integration", 
      description: "Seamlessly sync with time tracking data to ensure accurate payroll processing every time."
    },
    {
      icon: FileText,
      title: "Tax Compliance",
      description: "Stay compliant with federal and state tax requirements with automated tax calculations and reporting."
    },
    {
      icon: Shield,
      title: "Secure Processing",
      description: "Bank-level security ensures your payroll data and employee information stays protected."
    }
  ]

  const benefits = [
    "Reduce payroll processing time by 75%",
    "Eliminate manual errors and calculations", 
    "Automatically sync with time tracking",
    "Generate tax reports instantly",
    "Direct deposit and payment flexibility",
    "Employee self-service portal",
    "Compliance with labor laws",
    "Real-time payroll analytics"
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Restaurant Manager", 
      company: "Downtown Bistro",
      content: "WorkforceOS Payroll has saved us hours every week. The automatic time sync means no more manual data entry.",
      rating: 5
    },
    {
      name: "Mike Rodriguez",
      role: "Owner",
      company: "Rodriguez Family Restaurant",
      content: "Finally, a payroll solution that understands restaurant operations. The tip integration is seamless.",
      rating: 5
    }
  ]

  const pricingFeatures = [
    "Unlimited pay runs",
    "Tax filing included", 
    "Direct deposit",
    "Employee self-service",
    "Time tracking integration",
    "Advanced reporting",
    "Priority support",
    "Custom integrations"
  ]

  const faqs = [
    {
      question: "How does WorkforceOS Payroll integrate with time tracking?",
      answer: "Our payroll system automatically syncs with your time tracking data, pulling in regular hours, overtime, and break information to ensure accurate pay calculations."
    },
    {
      question: "What tax compliance features are included?",
      answer: "WorkforceOS handles federal and state tax calculations, generates required tax reports, and helps ensure compliance with labor laws specific to your location."
    },
    {
      question: "Can employees access their pay information?",
      answer: "Yes, employees can view their paystubs, tax documents, and payroll history through our secure employee self-service portal."
    },
    {
      question: "How secure is my payroll data?",
      answer: "We use bank-level encryption and security measures to protect all payroll data. Your information is stored securely and backed up regularly."
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-7xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4">
            Trusted by Thousands of Restaurants
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            WorkforceOS Payroll
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Stop spending hours on payroll. Our automated system handles calculations, taxes, and compliance 
            so you can focus on running your restaurant.
          </p>
          
          {/* Feature Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12 max-w-6xl mx-auto">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardContent className="p-6 text-center">
                <div className="bg-green-500/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Easy Onboarding</h3>
                <p className="text-sm text-muted-foreground">Get your team set up in minutes, not hours</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardContent className="p-6 text-center">
                <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Smart Analytics</h3>
                <p className="text-sm text-muted-foreground">Real-time insights into labor costs</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardContent className="p-6 text-center">
                <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Mobile Access</h3>
                <p className="text-sm text-muted-foreground">Manage payroll from anywhere</p>
              </CardContent>
            </Card>
            
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardContent className="p-6 text-center">
                <div className="bg-orange-500/10 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold mb-2">Compliance Ready</h3>
                <p className="text-sm text-muted-foreground">Built-in tax and labor law compliance</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">A payroll solution that helps your team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Streamline your payroll process with features designed specifically for restaurant operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Checklist */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Features your restaurant actually needs</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to run payroll efficiently and compliantly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-background rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                <span className="text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-lg text-muted-foreground mb-12">
            No hidden fees. No setup costs. Just straightforward payroll pricing.
          </p>

          <div className="bg-gradient-to-br from-primary/5 to-secondary/5 p-8 rounded-2xl border">
            <div className="text-center mb-8">
              <div className="text-4xl font-bold text-primary mb-2">$6<span className="text-lg text-muted-foreground">/employee</span></div>
              <p className="text-muted-foreground">per month</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {pricingFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{feature}</span>
                </div>
              ))}
            </div>

            <Button size="lg" className="w-full md:w-auto">
              Start 14-Day Free Trial
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Hear from restaurants who've made the switch</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-border/50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Frequently asked questions</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about WorkforceOS Payroll
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-6 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to simplify your payroll process?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of restaurants who trust WorkforceOS for their payroll needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg">
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}