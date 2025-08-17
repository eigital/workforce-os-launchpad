import { Plus, CheckCircle, DollarSign, Calculator, Clock, Users, PiggyBank, TrendingUp, Phone } from "lucide-react"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function TipManagement() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    WorkforceOS
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Tip Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <div className="flex-1 p-6 space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-3xl font-bold">Simplify tip pooling for your restaurant</h1>
              <p className="text-lg text-muted-foreground max-w-3xl">
                Empower your management team and save time paying out tips with a customizable tool to 
                create, calculate, and track tip pools in your restaurant.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4">
              <p className="font-medium">Simplify your tip pooling process by:</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Automatically syncing tips from your POS</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Specifying who contributes tips, who receives tips and how they are divided</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>Save time in paying out tips to your employees</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                Create a tip pool
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Phone className="h-4 w-4" />
                Book a demo call
              </Button>
            </div>

            {/* Tip Pools Table */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <PiggyBank className="h-5 w-5" />
                    Tip Pools
                  </CardTitle>
                  <CardDescription>Manage your restaurant's tip distribution</CardDescription>
                </div>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create pool
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Date Range Selector */}
                  <div className="flex items-center gap-2 text-sm">
                    <span>Jun 2, 2024</span>
                    <span>→</span>
                    <span>Jun 9, 2024</span>
                  </div>

                  {/* Table */}
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pool Name</TableHead>
                        <TableHead className="text-right">Tips Contributed</TableHead>
                        <TableHead className="text-right">Tips Received</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Bartenders tip pool</TableCell>
                        <TableCell className="text-right">80.00</TableCell>
                        <TableCell className="text-right">74.25</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">BOH tip pool</TableCell>
                        <TableCell className="text-right">0.00</TableCell>
                        <TableCell className="text-right">40.75</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">FOH tip pool</TableCell>
                        <TableCell className="text-right">228.00</TableCell>
                        <TableCell className="text-right">139.25</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Benefits Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-12 w-12 bg-green-600 text-white rounded-lg flex items-center justify-center">
                      <Calculator className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Automated Calculations</h3>
                      <p className="text-sm text-muted-foreground">
                        Let WorkforceOS automatically calculate tip distributions based on your custom rules and employee hours.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-12 w-12 bg-blue-600 text-white rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Save Time</h3>
                      <p className="text-sm text-muted-foreground">
                        Reduce hours of manual calculations to minutes with automated tip pooling and distribution.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-12 w-12 bg-purple-600 text-white rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Fair Distribution</h3>
                      <p className="text-sm text-muted-foreground">
                        Ensure transparent and fair tip distribution across your team with customizable allocation rules.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-12 w-12 bg-orange-600 text-white rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Performance Insights</h3>
                      <p className="text-sm text-muted-foreground">
                        Track tip performance and identify trends to optimize your restaurant's service quality.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-12 w-12 bg-teal-600 text-white rounded-lg flex items-center justify-center">
                      <PiggyBank className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Multiple Pool Types</h3>
                      <p className="text-sm text-muted-foreground">
                        Create different pools for front-of-house, back-of-house, and management with flexible rules.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="h-12 w-12 bg-rose-600 text-white rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">POS Integration</h3>
                      <p className="text-sm text-muted-foreground">
                        Seamlessly sync tip data from your point-of-sale system for accurate and real-time calculations.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Getting Started Section */}
            <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              <CardContent className="p-8">
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-bold">Ready to streamline your tip management?</h2>
                  <p className="text-blue-100 max-w-2xl mx-auto">
                    Join thousands of restaurants using WorkforceOS to automate their tip pooling 
                    and create a more transparent, efficient workplace.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button variant="secondary" size="lg" className="gap-2">
                      <Plus className="h-4 w-4" />
                      Create your first tip pool
                    </Button>
                    <Button variant="outline" size="lg" className="gap-2 border-white text-white hover:bg-white hover:text-blue-600">
                      <Phone className="h-4 w-4" />
                      Schedule demo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}