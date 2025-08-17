import { Search, Filter, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const integrationCategories = [
  {
    title: "Point of Sale",
    description: "Connect your POS systems",
    integrations: [
      {
        name: "Square",
        description: "Accept in-person and online payments with ease. Powerful software and hardware payment products.",
        logo: "🟦",
        category: "POS",
        featured: true
      },
      {
        name: "Clover",
        description: "A point-of-sale that offers comprehensive point-of-sale solutions with flexible payment options.",
        logo: "🍀",
        category: "POS"
      },
      {
        name: "Toast",
        description: "A restaurant management platform built for restaurant success.",
        logo: "🍞",
        category: "POS"
      }
    ]
  },
  {
    title: "Payroll",
    description: "Streamline your payroll processes",
    integrations: [
      {
        name: "ADP",
        description: "A web-based payroll solution designed for small businesses.",
        logo: "🏢",
        category: "Payroll",
        featured: true
      },
      {
        name: "Gusto",
        description: "Handle all your business payroll needs with ease.",
        logo: "💼",
        category: "Payroll"
      },
      {
        name: "QuickBooks",
        description: "Export payroll effortlessly with the world's largest accounting platform.",
        logo: "📊",
        category: "Payroll"
      }
    ]
  },
  {
    title: "Payroll Export",
    description: "Export your data seamlessly",
    integrations: [
      {
        name: "Paychex",
        description: "Automates all HR functions any size business.",
        logo: "💳",
        category: "Export"
      },
      {
        name: "Paycor",
        description: "HR solutions integrating recruiting, HR, payroll, time and attendance, benefits admin and more!",
        logo: "🏛️",
        category: "Export"
      },
      {
        name: "Paycom",
        description: "A part of HR software to manage the employment life cycle.",
        logo: "💰",
        category: "Export"
      }
    ]
  },
  {
    title: "Analytics",
    description: "Gain insights from your data",
    integrations: [
      {
        name: "MarginEdge",
        description: "Take back control of your restaurant's real-time reporting while eliminating back office paperwork.",
        logo: "📈",
        category: "Analytics"
      },
      {
        name: "5-Out",
        description: "Use machine learning to predict sales, budgeting and labor scheduling.",
        logo: "🎯",
        category: "Analytics"
      },
      {
        name: "Ingest",
        description: "Give your managers data sources to check metrics to team metrics.",
        logo: "📊",
        category: "Analytics"
      }
    ]
  },
  {
    title: "More Integrations",
    description: "Additional tools and services",
    integrations: [
      {
        name: "Bounce",
        description: "Putting the checkout process into your guests' hands.",
        logo: "🔄",
        category: "Tools"
      },
      {
        name: "OnCentive",
        description: "Simplifies the process of building and implementing gamification for restaurant teams.",
        logo: "🎮",
        category: "Tools"
      },
      {
        name: "Squink",
        description: "Optimize systems giving your employees less time in the back office.",
        logo: "⚡",
        category: "Tools"
      }
    ]
  }
]

export default function Integrations() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-6">
          <h1 className="text-xl font-semibold">Explore</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-1 max-w-md items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Find an integration"
                className="pl-9"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Integrations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Integrations</SelectItem>
                <SelectItem value="pos">Point of Sale</SelectItem>
                <SelectItem value="payroll">Payroll</SelectItem>
                <SelectItem value="analytics">Analytics</SelectItem>
                <SelectItem value="export">Export</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="icon">
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Integration Categories */}
        <div className="space-y-8">
          {integrationCategories.map((category) => (
            <div key={category.title}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">{category.title}</h2>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                <Button variant="ghost" size="sm">
                  See all
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {category.integrations.map((integration) => (
                  <Card key={integration.name} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">{integration.logo}</div>
                          <div>
                            <CardTitle className="text-base">{integration.name}</CardTitle>
                            {integration.featured && (
                              <Badge variant="secondary" className="mt-1">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm line-clamp-3">
                        {integration.description}
                      </CardDescription>
                      <div className="mt-4 flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {integration.category}
                        </Badge>
                        <Button size="sm" variant="outline">
                          {integration.featured ? "Explore add-on" : "Learn More"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Need a Custom Integration?</CardTitle>
              <CardDescription>
                WorkforceOS offers custom integration development for enterprise clients.
                Connect with our team to discuss your specific needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button>Contact Sales</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}