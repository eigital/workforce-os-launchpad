import React, { useState, useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, TrendingUp, AlertTriangle, Users, DollarSign } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface OvertimeData {
  week: string;
  totalHours: number;
  overtimeHours: number;
  regularHours: number;
  employeeCount: number;
  overtimeCost: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface EmployeeOvertime {
  id: string;
  name: string;
  totalOvertimeHours: number;
  weeklyAverage: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export default function OvertimeAnalysis() {
  const [timeRange, setTimeRange] = useState("last-4-weeks");
  const [overtimeData, setOvertimeData] = useState<OvertimeData[]>([]);
  const [employeeData, setEmployeeData] = useState<EmployeeOvertime[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalOvertimeCost, setTotalOvertimeCost] = useState(0);
  const [averageWeeklyOvertime, setAverageWeeklyOvertime] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadOvertimeAnalytics();
    }
  }, [user, timeRange]);

  const loadOvertimeAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get user's company
      const { data: userCompanies, error: companyError } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user?.id)
        .single();

      if (companyError) throw companyError;

      // Calculate date range
      const weeksBack = timeRange === "last-4-weeks" ? 4 : timeRange === "last-8-weeks" ? 8 : 12;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - (weeksBack * 7));

      // Load business metrics for overtime data
      const { data: metricsData, error: metricsError } = await supabase
        .from('business_metrics')
        .select('*')
        .eq('company_id', userCompanies.company_id)
        .gte('date', startDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (metricsError) throw metricsError;

      // Process overtime data by week
      const weeklyData = processWeeklyOvertimeData(metricsData || []);
      setOvertimeData(weeklyData);

      // Calculate summary stats
      const totalCost = weeklyData.reduce((sum, week) => sum + week.overtimeCost, 0);
      const avgWeeklyOT = weeklyData.reduce((sum, week) => sum + week.overtimeHours, 0) / weeklyData.length;
      
      setTotalOvertimeCost(totalCost);
      setAverageWeeklyOvertime(avgWeeklyOT);

      // Generate mock employee data (would be real data from employees table)
      setEmployeeData(generateMockEmployeeData());

    } catch (error) {
      console.error('Error loading overtime analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const processWeeklyOvertimeData = (metrics: any[]): OvertimeData[] => {
    const weeklyMap = new Map();

    metrics.forEach(metric => {
      const date = new Date(metric.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Get Sunday of that week
      
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyMap.has(weekKey)) {
        weeklyMap.set(weekKey, {
          week: `Week of ${weekStart.toLocaleDateString()}`,
          totalHours: 0,
          overtimeHours: 0,
          regularHours: 0,
          employeeCount: 0,
          overtimeCost: 0,
          riskLevel: 'low' as const
        });
      }

      const week = weeklyMap.get(weekKey);
      week.totalHours += metric.total_hours_worked || 0;
      week.overtimeHours += metric.overtime_hours || 0;
      week.regularHours = week.totalHours - week.overtimeHours;
      week.overtimeCost += (metric.overtime_hours || 0) * 22.50; // Assume $15 base + 1.5x overtime
      
      // Determine risk level based on overtime percentage
      const overtimePercentage = week.totalHours > 0 ? (week.overtimeHours / week.totalHours) * 100 : 0;
      if (overtimePercentage > 25) {
        week.riskLevel = 'high';
      } else if (overtimePercentage > 15) {
        week.riskLevel = 'medium';
      }
    });

    return Array.from(weeklyMap.values()).slice(-parseInt(timeRange.split('-')[1]));
  };

  const generateMockEmployeeData = (): EmployeeOvertime[] => {
    return [
      { id: '1', name: 'John Smith', totalOvertimeHours: 24, weeklyAverage: 6, riskLevel: 'high' },
      { id: '2', name: 'Sarah Johnson', totalOvertimeHours: 18, weeklyAverage: 4.5, riskLevel: 'medium' },
      { id: '3', name: 'Mike Davis', totalOvertimeHours: 12, weeklyAverage: 3, riskLevel: 'low' },
      { id: '4', name: 'Emily Wilson', totalOvertimeHours: 20, weeklyAverage: 5, riskLevel: 'medium' },
      { id: '5', name: 'David Brown', totalOvertimeHours: 8, weeklyAverage: 2, riskLevel: 'low' },
    ];
  };

  const getRiskBadgeColor = (level: string) => {
    switch (level) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <AppLayout title="Overtime Analysis" subtitle="Weekly overtime risk analysis and employee insights">
        <div className="text-center py-8">Loading overtime analysis...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Overtime Analysis" subtitle="Weekly overtime risk analysis and employee insights">
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border z-50">
                <SelectItem value="last-4-weeks">Last 4 Weeks</SelectItem>
                <SelectItem value="last-8-weeks">Last 8 Weeks</SelectItem>
                <SelectItem value="last-12-weeks">Last 12 Weeks</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline">
            Export Report
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Avg Weekly Overtime</p>
                  <p className="text-2xl font-bold">{averageWeeklyOvertime.toFixed(1)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Total Overtime Cost</p>
                  <p className="text-2xl font-bold">${totalOvertimeCost.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">High Risk Employees</p>
                  <p className="text-2xl font-bold">{employeeData.filter(emp => emp.riskLevel === 'high').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">Trend</p>
                  <p className="text-2xl font-bold text-green-600">↓ 12%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Overtime Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Weekly Overtime Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={overtimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="week" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.split('Week of ')[1]?.split('/')[0] + '/' + value.split('Week of ')[1]?.split('/')[1] || value}
                  />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="overtimeHours" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="regularHours" stroke="hsl(var(--muted-foreground))" strokeWidth={1} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Employee Overtime Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Overtime Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={employeeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => value.split(' ')[0]}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="totalOvertimeHours" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Employee Risk Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employee Overtime Risk Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {employeeData.map((employee) => (
                <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {employee.totalOvertimeHours}h total • {employee.weeklyAverage}h avg/week
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getRiskBadgeColor(employee.riskLevel)}>
                      {employee.riskLevel.charAt(0).toUpperCase() + employee.riskLevel.slice(1)} Risk
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}