import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  ChevronLeft,
  ChevronRight,
  Calendar,
  HelpCircle,
  Users,
  Clock,
  AlertCircle,
  TrendingUp,
  Award,
  Target
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EngagementMetrics {
  satisfaction: {
    avgShiftScore: number;
    responses: number;
  };
  locationStats: {
    lates: number;
    noShows: number;
    shiftBids: number;
    droppedShifts: number;
    avgTenure: number;
  };
  employeeCount: number;
}

interface EmployeePerformance {
  mostReliable: any[];
  mostEager: any[];
  mostSickDays: any[];
  mostOftenLate: any[];
  mostDroppedShifts: any[];
  mostEngaged: any[];
  leastEngaged: any[];
}

export default function Engage() {
  const [metrics, setMetrics] = useState<EngagementMetrics>({
    satisfaction: { avgShiftScore: 0, responses: 0 },
    locationStats: { lates: 0, noShows: 0, shiftBids: 0, droppedShifts: 0, avgTenure: 0 },
    employeeCount: 0
  });
  const [performance, setPerformance] = useState<EmployeePerformance>({
    mostReliable: [],
    mostEager: [],
    mostSickDays: [],
    mostOftenLate: [],
    mostDroppedShifts: [],
    mostEngaged: [],
    leastEngaged: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [dateRange, setDateRange] = useState("week");
  const [demoDataEnabled, setDemoDataEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadEngagementData();
  }, [selectedLocation, dateRange]);

  const loadEngagementData = async () => {
    try {
      setLoading(true);
      
      // Load employees for basic metrics
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('status', 'active');

      if (employeesError) throw employeesError;

      // For now, we'll use placeholder data since engagement tracking isn't fully implemented
      setMetrics({
        satisfaction: {
          avgShiftScore: 0,
          responses: 0
        },
        locationStats: {
          lates: 0,
          noShows: 0,
          shiftBids: 0,
          droppedShifts: 0,
          avgTenure: 0
        },
        employeeCount: employees?.length || 0
      });

      setPerformance({
        mostReliable: [],
        mostEager: [],
        mostSickDays: [],
        mostOftenLate: [],
        mostDroppedShifts: [],
        mostEngaged: [],
        leastEngaged: []
      });

    } catch (error) {
      console.error('Error loading engagement data:', error);
      toast({
        title: "Error",
        description: "Failed to load engagement data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDateRange = () => {
    const today = new Date();
    if (dateRange === "week") {
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      return `${formatDate(weekAgo)} → ${formatDate(today)}`;
    } else {
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);
      return `${formatDate(monthAgo)} → ${formatDate(today)}`;
    }
  };

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">WorkforceOS</span>
              <span className="text-muted-foreground">/</span>
              <span>Team</span>
              <span className="text-muted-foreground">/</span>
              <span>Engage</span>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="text-center py-8">
              Loading engagement data...
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">WorkforceOS</span>
            <span className="text-muted-foreground">/</span>
            <span>Team</span>
            <span className="text-muted-foreground">/</span>
            <span>Engage</span>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Engage</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={demoDataEnabled}
                  onCheckedChange={setDemoDataEnabled}
                />
                <span className="text-sm">Try engage with demo data</span>
              </div>
              <Button variant="outline" size="sm">
                Give us feedback
              </Button>
            </div>
          </div>

          {/* Date Range and Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2 px-3 py-1 border rounded">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{getDateRange()}</span>
                </div>
                <Button variant="outline" size="sm">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant={dateRange === "week" ? "default" : "outline"} 
                size="sm"
                onClick={() => setDateRange("week")}
              >
                Week
              </Button>
              <Button 
                variant={dateRange === "month" ? "default" : "outline"} 
                size="sm"
                onClick={() => setDateRange("month")}
              >
                Month
              </Button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Satisfaction Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Satisfaction</CardTitle>
                  <Badge variant="secondary" className="text-xs">PRO TRIAL</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Avg. Shift Score</div>
                    <div className="text-2xl font-semibold">-- /5</div>
                    <div className="text-xs text-muted-foreground">— last week</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Responses</div>
                    <div className="text-2xl font-semibold">{metrics.satisfaction.responses}</div>
                    <div className="text-xs text-muted-foreground">— last week</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Performance Stats */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Location Performance Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Lates</div>
                    <div className="text-xl font-semibold">{metrics.locationStats.lates}</div>
                    <div className="text-xs text-muted-foreground">Same last week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">No Shows</div>
                    <div className="text-xl font-semibold">{metrics.locationStats.noShows}</div>
                    <div className="text-xs text-muted-foreground">Same last week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Shift Bids</div>
                    <div className="text-xl font-semibold">{metrics.locationStats.shiftBids}</div>
                    <div className="text-xs text-muted-foreground">Same last week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Dropped Shifts</div>
                    <div className="text-xl font-semibold">{metrics.locationStats.droppedShifts}</div>
                    <div className="text-xs text-muted-foreground">Same last week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-muted-foreground mb-1">Avg. Tenure</div>
                    <div className="text-xl font-semibold">
                      {metrics.locationStats.avgTenure > 0 ? `< ${metrics.locationStats.avgTenure}` : '< 1'}
                    </div>
                    <div className="text-xs text-muted-foreground">month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Performance Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Performance Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="lates" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="lates">Lates</TabsTrigger>
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  <TabsTrigger value="dropped">Dropped Shifts and Shift Bids</TabsTrigger>
                </TabsList>
                <TabsContent value="lates" className="mt-6">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No one has been late for their scheduled shift</h3>
                    <p className="text-muted-foreground text-center">
                      Employees with shifts flagged as "Late" will appear here.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="attendance" className="mt-6">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">Perfect attendance this period</h3>
                    <p className="text-muted-foreground text-center">
                      Attendance issues will be tracked and displayed here.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="dropped" className="mt-6">
                  <div className="flex flex-col items-center justify-center py-8">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <AlertCircle className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No dropped shifts this period</h3>
                    <p className="text-muted-foreground text-center">
                      Dropped shifts and shift bid activity will be shown here.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
              <div className="mt-4 text-sm text-muted-foreground">
                Total: {metrics.employeeCount} employees
              </div>
            </CardContent>
          </Card>

          {/* Performance Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { title: "Most Reliable", icon: Award, color: "bg-green-100" },
              { title: "Most Eager", icon: TrendingUp, color: "bg-blue-100" },
              { title: "Most Sick Days", icon: Users, color: "bg-orange-100" },
              { title: "Most Often Late", icon: Clock, color: "bg-red-100" },
              { title: "Most Dropped Shifts", icon: AlertCircle, color: "bg-purple-100" }
            ].map((category) => (
              <Card key={category.title}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-full ${category.color} flex items-center justify-center`}>
                      <category.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{category.title}</div>
                      <Button variant="ghost" size="sm" className="h-4 w-4 p-0">
                        <HelpCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-2"></div>
                    <div className="text-xs text-muted-foreground">No data available</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Engagement Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Most Engaged
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Target className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">You don't have any engaged employees right now</h3>
                  <p className="text-muted-foreground text-center text-sm">
                    As soon as we track more engagement from your employees, they will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Least Engaged
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">You don't have any disengaged employees</h3>
                  <p className="text-muted-foreground text-center text-sm">
                    Keep up the good work! If any of your employees become disengaged, they will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}