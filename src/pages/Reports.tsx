import { useState } from "react"
import { Search, Star, ChevronRight, Activity, Users, Clock, Calendar, Timer, CalendarX, UserCheck, Award, MessageSquare, Coins, Shield, Search as SearchIcon, CheckSquare, TrendingUp, BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import AppLayout from "@/components/layouts/AppLayout"

interface Report {
  name: string;
  description: string;
  icon: any;
  featured?: boolean;
  badge?: string;
}

interface ReportCategory {
  title: string;
  icon: any;
  reports: Report[];
}

const reportCategories: ReportCategory[] = [
  {
    title: "Performance Analytics",
    icon: TrendingUp,
    reports: [
      {
        name: "Business Overview",
        description: "Comprehensive dashboard with key performance indicators and insights into your workforce operations.",
        icon: BarChart3,
        featured: true
      },
      {
        name: "Performance Metrics", 
        description: "Track productivity metrics, efficiency ratings, and performance trends across your workforce.",
        icon: Activity
      }
    ]
  },
  {
    title: "Employee Management",
    icon: Users,
    reports: [
      {
        name: "Employee Health Check",
        description: "Monitor team wellness, satisfaction levels, and identify potential retention risks with actionable insights.",
        icon: Users
      },
      {
        name: "Employee Insights",
        description: "Detailed analytics on employee performance, engagement levels, and development opportunities.",
        icon: Users
      }
    ]
  },
  {
    title: "Time & Labor",
    icon: Clock,
    reports: [
      {
        name: "Worked Hours & Wages",
        description: "Comprehensive summary of actual hours worked and wage calculations from your WorkforceOS system.",
        icon: Clock
      },
      {
        name: "Scheduled Hours & Wages", 
        description: "Analysis of planned schedules versus actual execution with wage projections and variance tracking.",
        icon: Calendar
      },
      {
        name: "Weekly Overtime Analysis",
        description: "Monitor overtime patterns by tracking employee worked hours against scheduled shifts with trend analysis.",
        icon: Timer
      },
      {
        name: "Employee Timesheet",
        description: "Detailed timesheet reports for accurate payroll processing, record-keeping, and compliance purposes.",
        icon: Timer
      }
    ]
  },
  {
    title: "Attendance & Time Off",
    icon: CalendarX,
    reports: [
      {
        name: "Time Off Summary",
        description: "Complete breakdown of approved time off requests, balances, and usage patterns across your workforce.",
        icon: CalendarX
      },
      {
        name: "Schedule Variance",
        description: "Compare scheduled hours against actual worked hours to identify discrepancies and optimize planning.",
        icon: Calendar
      },
      {
        name: "Attendance Tracking",
        description: "Monitor employee attendance patterns, identify trends, and track adherence to scheduled shifts.",
        icon: UserCheck
      }
    ]
  },
  {
    title: "Compliance & Certifications",
    icon: Award,
    reports: [
      {
        name: "Certifications Manager",
        description: "Track, filter, and export employee certifications with expiry date monitoring and renewal alerts.",
        icon: Award
      },
      {
        name: "Labor Compliance",
        description: "Advanced compliance monitoring based on labor law requirements and regulatory standards.",
        icon: Shield,
        badge: "PRO"
      }
    ]
  },
  {
    title: "Feedback & Communication",
    icon: MessageSquare,
    reports: [
      {
        name: "Shift Feedback",
        description: "Analyze shift feedback responses for improved operations, team satisfaction, and process optimization.",
        icon: MessageSquare
      }
    ]
  },
  {
    title: "Financial & Tips",
    icon: Coins,
    reports: [
      {
        name: "Shift Pool Analytics",
        description: "Track shift pool utilization, employee pick-up rates, and optimize your flexible scheduling strategy.",
        icon: Coins
      },
      {
        name: "Tip Pool Management",
        description: "Comprehensive breakdown of tip pool distributions, employee earnings, and allocation transparency.",
        icon: Coins
      },
      {
        name: "Tip Payouts",
        description: "Detailed tracking of tip distributions to employees with date range analysis and payout history.",
        icon: Coins
      }
    ]
  },
  {
    title: "Operations & Audit",
    icon: SearchIcon,
    reports: [
      {
        name: "Punch Audit",
        description: "Review and track all time punch modifications with detailed audit trails for compliance and accuracy.",
        icon: SearchIcon
      },
      {
        name: "Task Completion",
        description: "Monitor task completion rates across locations, identify efficiency opportunities, and track performance.",
        icon: CheckSquare
      }
    ]
  }
]

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCategories = reportCategories.map(category => ({
    ...category,
    reports: category.reports.filter(report =>
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.reports.length > 0)

  return (
    <AppLayout title="Reports Overview" subtitle="Powerful insights and analytics for your WorkforceOS operations">
      <div className="bg-gradient-to-br from-background to-muted/20 min-h-full">
        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search for a report..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid gap-8">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">All Reports</h2>
            <p className="text-muted-foreground">
              Access comprehensive reporting across all aspects of your workforce management. 
              Generate insights, track performance, and make data-driven decisions.
            </p>
          </div>

          {/* Report Categories */}
          <div className="space-y-8">
            {filteredCategories.map((category) => (
              <div key={category.title} className="space-y-4">
                <div className="flex items-center gap-3">
                  <category.icon className="h-6 w-6 text-primary" />
                  <h3 className="text-xl font-semibold">{category.title}</h3>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {category.reports.map((report) => (
                    <Card key={report.name} className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-border/50 hover:border-primary/20">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <report.icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="flex items-center gap-2">
                              {report.featured && (
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              )}
                              {report.badge && (
                                <Badge variant="secondary" className="text-xs">
                                  {report.badge}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {report.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm leading-relaxed">
                          {report.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredCategories.length === 0 && (
            <div className="text-center py-12">
              <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No reports found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or browse all available reports above.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}