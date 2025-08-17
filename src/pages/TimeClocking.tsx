import { Clock, Shield, DollarSign, CheckCircle, ArrowRight, Smartphone, Timer, FileText, Users, MapPin, Calendar } from "lucide-react"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function TimeClocking() {
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
                  <BreadcrumbPage>Time Clocking</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <div className="flex-1">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 px-6 py-16">
              <div className="max-w-4xl mx-auto text-center space-y-6">
                <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  <Clock className="h-4 w-4" />
                  Time Clocking
                </div>
                <h1 className="text-4xl font-bold text-gray-900">
                  Spend less on labor while making payroll easier
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                  Bring accurate time and attendance, scheduling, and payroll under one roof.
                </p>
                <Button size="lg" className="gap-2">
                  Get started with Time Clocking
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <p className="text-sm text-gray-500">Included free on your plan</p>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="px-6 py-12">
              <div className="max-w-6xl mx-auto">
                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-8">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                      <div>
                        <h3 className="text-2xl font-bold mb-4">Real-time workforce tracking</h3>
                        <p className="text-gray-600 mb-6">
                          Monitor who's clocked in, track hours accurately, and get real-time updates on labor costs.
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                            <span className="text-sm">John Smith - Kitchen Manager</span>
                            <Badge variant="secondary">On shift</Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm">Sarah Johnson - Server</span>
                            <Badge variant="outline">Break</Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                            <span className="text-sm">Mike Wilson - Host</span>
                            <Badge variant="secondary">On shift</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="text-center space-y-4">
                          <Clock className="h-12 w-12 text-blue-600 mx-auto" />
                          <h4 className="font-semibold">Quick Clock In/Out</h4>
                          <Button className="w-full">Clock In</Button>
                          <p className="text-xs text-gray-500">We've switched to 7shifts for Payroll</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Benefits Section */}
            <div className="px-6 py-12 bg-gray-50">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">A restaurant time clock solution that helps your team</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  <Card className="bg-red-50 border-red-200">
                    <CardContent className="p-6 text-center">
                      <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Shield className="h-6 w-6 text-red-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Prevent time theft</h3>
                      <p className="text-sm text-gray-600">
                        Ensure your staff punches in on time and on location with GPS tracking. Catch shifts that started early or shifts and missed shifts, so you can find the right coverage.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-6 text-center">
                      <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Avoid compliance fees</h3>
                      <p className="text-sm text-gray-600">
                        No matter where you are, your local labor laws are built in, so you've no concern about lack of compliance or pay more.
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-6 text-center">
                      <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-6 w-6 text-blue-600" />
                      </div>
                      <h3 className="font-semibold mb-2">Payroll is a breeze</h3>
                      <p className="text-sm text-gray-600">
                        When your clocking solution is in the same app as your schedule, ensuring we receive manual entry, registration cards are being exported.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>

            {/* How it Works */}
            <div className="px-6 py-12">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12">Here's how it works</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="bg-blue-100 rounded-lg p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Timer className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Track time punches</h3>
                    <p className="text-sm text-gray-600">
                      Connect where, when and how staff punches in and out for work.
                    </p>
                    <ArrowRight className="h-5 w-5 text-gray-400 mx-auto mt-4" />
                  </div>

                  <div className="text-center">
                    <div className="bg-green-100 rounded-lg p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Approve timesheets</h3>
                    <p className="text-sm text-gray-600">
                      Save time comparing time punches against scheduled hours.
                    </p>
                    <ArrowRight className="h-5 w-5 text-gray-400 mx-auto mt-4" />
                  </div>

                  <div className="text-center">
                    <div className="bg-purple-100 rounded-lg p-4 w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="h-8 w-8 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Send to payroll</h3>
                    <p className="text-sm text-gray-600">
                      Run accurate payroll in minutes, not hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Section */}
            <div className="px-6 py-12 bg-gradient-to-br from-purple-50 to-purple-100">
              <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                  <div className="bg-white p-8 rounded-lg shadow-lg">
                    <div className="text-center space-y-4">
                      <Smartphone className="h-16 w-16 text-purple-600 mx-auto" />
                      <h3 className="text-xl font-semibold">Mobile Time Clock</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Geo-fencing and Reality Punch</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Schedule enforcement</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>Manager punch alerts</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-3xl font-bold mb-6">
                      Turn any device into a time clock
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Staff can clock in/through their smartphone, a shared tablet, or 
                      your POS. Give us Android, they've got every option to clock in 
                      (and we can know when they don't!).
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 bg-black rounded-full"></div>
                        <span className="text-sm">Geo-fencing and Reality Punch</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 bg-black rounded-full"></div>
                        <span className="text-sm">Schedule enforcement</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 bg-black rounded-full"></div>
                        <span className="text-sm">Manager punch alerts</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="px-6 py-12">
              <div className="max-w-4xl mx-auto">
                <Card className="bg-gradient-to-r from-teal-50 to-teal-100 border-teal-200">
                  <CardContent className="p-8">
                    <div className="text-center">
                      <div className="bg-teal-600 text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                        <span className="font-bold">W</span>
                      </div>
                      <blockquote className="text-lg italic mb-4">
                        "We used to use three separate apps... now it's all in one place with WorkforceOS. 
                        It's helpful seeing total time piece and sales information I can also see 
                        who's clocked in at all night whenever someone forgets to clock out, I can 
                        catch it. We love WorkforceOS."
                      </blockquote>
                      <cite className="font-semibold">Madalynn Lambert</cite>
                      <p className="text-sm text-gray-600">Bahama Buck's - Austin/Central City</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Final CTA */}
            <div className="px-6 py-16 bg-gray-900 text-white">
              <div className="max-w-4xl mx-auto text-center space-y-6">
                <h2 className="text-3xl font-bold">
                  See for yourself how beneficial it is when your 
                  time clocking, scheduling, and payroll talk to 
                  each other.
                </h2>
                <Button size="lg" variant="outline" className="gap-2 text-gray-900">
                  Get started with Time Clocking
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <p className="text-sm text-gray-400">Included free on your plan</p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}