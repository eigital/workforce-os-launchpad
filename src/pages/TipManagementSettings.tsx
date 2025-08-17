import { Settings, Save, RotateCcw, DollarSign, Calculator, Users, Clock } from "lucide-react"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function TipManagementSettings() {
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
                  <BreadcrumbLink href="/tip-management">
                    Tip Management
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Settings</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <div className="flex-1 p-6 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Settings className="h-8 w-8" />
                  Tip Management Settings
                </h1>
                <p className="text-muted-foreground mt-2">
                  Configure your restaurant's tip pooling preferences and calculation methods.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset to Defaults
                </Button>
                <Button className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </div>

            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Configure basic tip management preferences for your restaurant.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-sync">Auto-sync with POS</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically import tip data from your point-of-sale system
                    </p>
                  </div>
                  <Switch id="auto-sync" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="daily-auto-calc">Daily auto-calculation</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically calculate and distribute tips at the end of each day
                    </p>
                  </div>
                  <Switch id="daily-auto-calc" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="notifications">Email notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send email alerts when tip calculations are completed
                    </p>
                  </div>
                  <Switch id="notifications" defaultChecked />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="default-period">Default calculation period</Label>
                    <Select defaultValue="daily">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="biweekly">Bi-weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select defaultValue="usd">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="usd">USD ($)</SelectItem>
                        <SelectItem value="cad">CAD ($)</SelectItem>
                        <SelectItem value="eur">EUR (€)</SelectItem>
                        <SelectItem value="gbp">GBP (£)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calculation Rules */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calculation Rules
                </CardTitle>
                <CardDescription>
                  Set default calculation methods and distribution rules.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="default-method">Default calculation method</Label>
                    <Select defaultValue="hours_worked">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hours_worked">Hours Worked</SelectItem>
                        <SelectItem value="equal_split">Equal Split</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="points">Points System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minimum-hours">Minimum hours for tip eligibility</Label>
                    <Input 
                      id="minimum-hours" 
                      type="number" 
                      placeholder="4.0" 
                      defaultValue="4.0"
                      step="0.5"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="overtime-bonus">Include overtime bonus</Label>
                    <p className="text-sm text-muted-foreground">
                      Give additional tip share for overtime hours worked
                    </p>
                  </div>
                  <Switch id="overtime-bonus" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calculation-notes">Calculation notes template</Label>
                  <Textarea 
                    id="calculation-notes" 
                    placeholder="Enter default notes that will be included with tip calculations..."
                    defaultValue="Tips calculated based on hours worked during the period."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pool Defaults */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Pool Defaults
                </CardTitle>
                <CardDescription>
                  Configure default settings for new tip pools.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-include-new">Auto-include new employees</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically add new employees to applicable tip pools
                    </p>
                  </div>
                  <Switch id="auto-include-new" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="require-approval">Require manager approval</Label>
                    <p className="text-sm text-muted-foreground">
                      All tip distributions must be approved by a manager before payout
                    </p>
                  </div>
                  <Switch id="require-approval" defaultChecked />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-pools">Maximum pools per employee</Label>
                    <Input 
                      id="max-pools" 
                      type="number" 
                      placeholder="3" 
                      defaultValue="3"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payout-delay">Payout delay (hours)</Label>
                    <Input 
                      id="payout-delay" 
                      type="number" 
                      placeholder="24" 
                      defaultValue="24"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance & Reporting */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Compliance & Reporting
                </CardTitle>
                <CardDescription>
                  Configure compliance settings and reporting preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="audit-trail">Maintain audit trail</Label>
                    <p className="text-sm text-muted-foreground">
                      Keep detailed logs of all tip calculations and modifications
                    </p>
                  </div>
                  <Switch id="audit-trail" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="export-reports">Auto-export monthly reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically generate and email monthly tip reports
                    </p>
                  </div>
                  <Switch id="export-reports" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retention-period">Data retention period (months)</Label>
                  <Select defaultValue="24">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12 months</SelectItem>
                      <SelectItem value="24">24 months</SelectItem>
                      <SelectItem value="36">36 months</SelectItem>
                      <SelectItem value="60">60 months</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}