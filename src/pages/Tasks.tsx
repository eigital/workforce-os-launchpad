import { Plus, MapPin, Users, UserCheck, Search, MoreVertical, Edit, Clock } from "lucide-react"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Tasks() {
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
                  <BreadcrumbPage>Task Templates</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <div className="flex-1 space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Task List Templates</h1>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create list
              </Button>
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <Select defaultValue="all-locations">
                <SelectTrigger className="w-48">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-locations">All locations</SelectItem>
                  <SelectItem value="main-office">Main Office</SelectItem>
                  <SelectItem value="downtown">Downtown Branch</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all-departments">
                <SelectTrigger className="w-48">
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-departments">All departments</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="front-of-house">Front of House</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all-roles">
                <SelectTrigger className="w-48">
                  <UserCheck className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-roles">All roles</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sample Task Template Card */}
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">SAMPLE Opening Checklist</CardTitle>
                    <CardDescription className="text-base">WorkforceOS Demo</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 pt-2">
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                    Active List
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Daily
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Hero Section */}
            <div className="grid lg:grid-cols-2 gap-8 mt-12">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold leading-tight">
                  Keep your team on track with WorkforceOS tasks
                </h2>
                <p className="text-lg text-muted-foreground">
                  Stay organized and improve team accountability by creating, assigning, and 
                  tracking custom task lists for different locations or roles within your 
                  restaurant.
                </p>
                <div className="flex gap-4">
                  <Button size="lg" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create list
                  </Button>
                  <Button variant="outline" size="lg">
                    Start scheduling
                  </Button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Hero Image Placeholder */}
                <div className="rounded-lg bg-gradient-to-br from-orange-100 to-red-100 p-8 min-h-[300px] flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p>Team collaboration workspace</p>
                  </div>
                </div>

                {/* Task Assignment Example */}
                <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/placeholder-avatar.jpg" />
                        <AvatarFallback>LS</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">Lindsey Saris</p>
                        <p className="text-sm text-muted-foreground">
                          You are logged to complete this task
                        </p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-background flex items-center justify-center">
                        <UserCheck className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}