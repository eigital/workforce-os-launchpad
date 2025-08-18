import { useState, useEffect } from "react";
import AppLayout from "@/components/layouts/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Calendar, Clock, Star, TrendingUp, DollarSign, Users, Cloud, AlertTriangle, CheckCircle, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { QuickEntryDialog } from "@/components/logbook/QuickEntryDialog";
import { EmailSummaryDialog } from "@/components/logbook/EmailSummaryDialog";

interface LogCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

interface LogEntry {
  id: string;
  title: string;
  content: string;
  category_id: string;
  priority: string;
  entry_date: string;
  shift_time?: string;
  created_at: string;
  created_by: string;
  category?: LogCategory;
}

interface DashboardMetrics {
  totalEntries: number;
  todayEntries: number;
  highPriorityEntries: number;
  activeCategories: number;
  salesAmount: number;
  laborPercentage: number;
  avgShiftScore: number;
  overtimeRisk: string;
  weatherCondition: string;
  weatherTemp: number;
}

interface BusinessMetrics {
  id: string;
  date: string;
  sales_amount: number;
  labor_percentage: number;
  avg_shift_score: number;
  overtime_risk_level: string;
  weather_condition: string;
  weather_temperature: number;
}

export default function LogBook() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<LogCategory[]>([]);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<DashboardMetrics>({
    totalEntries: 0,
    todayEntries: 0,
    highPriorityEntries: 0,
    activeCategories: 0,
    salesAmount: 0,
    laborPercentage: 0,
    avgShiftScore: 0,
    overtimeRisk: 'low',
    weatherCondition: '',
    weatherTemp: 0,
  });
  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics | null>(null);
  const [isEmailSummaryOpen, setIsEmailSummaryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false);
  const [quickEntryType, setQuickEntryType] = useState('');
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    category_id: '',
    priority: 'normal' as const,
    shift_time: ''
  });

  useEffect(() => {
    if (user) {
      loadCategories();
      loadEntries();
      loadMetrics();
    }
  }, [user]);

  const loadCategories = async () => {
    if (!user?.id) return;

    try {
      const { data: userCompanies } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!userCompanies?.company_id) return;

      const { data } = await supabase
        .from('log_categories')
        .select('*')
        .eq('company_id', userCompanies.company_id)
        .eq('is_active', true)
        .order('sort_order');

      if (data) setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadEntries = async () => {
    if (!user?.id) return;

    try {
      const { data: userCompanies } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!userCompanies?.company_id) return;

      const { data } = await supabase
        .from('log_entries')
        .select(`
          *,
          category:log_categories(id, name, description, color, icon)
        `)
        .eq('company_id', userCompanies.company_id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) setEntries(data as any);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const loadMetrics = async () => {
    if (!user?.id) return;

    try {
      const { data: userCompanies } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!userCompanies?.company_id) return;

      // Load basic metrics
      const { data: entries } = await supabase
        .from('log_entries')
        .select('*')
        .eq('company_id', userCompanies.company_id);

      const { data: categories } = await supabase
        .from('log_categories')
        .select('*')
        .eq('company_id', userCompanies.company_id)
        .eq('is_active', true);

      // Load business metrics for today
      const today = new Date().toISOString().split('T')[0];
      const { data: businessMetricsData } = await supabase
        .from('business_metrics')
        .select('*')
        .eq('company_id', userCompanies.company_id)
        .eq('date', today)
        .maybeSingle();

      const todayEntries = entries?.filter(entry => entry.entry_date === today) || [];
      const highPriorityEntries = entries?.filter(entry => entry.priority === 'high') || [];

      setBusinessMetrics(businessMetricsData);
      setDashboardMetrics({
        totalEntries: entries?.length || 0,
        todayEntries: todayEntries.length,
        highPriorityEntries: highPriorityEntries.length,
        activeCategories: categories?.length || 0,
        salesAmount: businessMetricsData?.sales_amount || 0,
        laborPercentage: businessMetricsData?.labor_percentage || 0,
        avgShiftScore: businessMetricsData?.avg_shift_score || 0,
        overtimeRisk: businessMetricsData?.overtime_risk_level || 'low',
        weatherCondition: businessMetricsData?.weather_condition || '',
        weatherTemp: businessMetricsData?.weather_temperature || 0,
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const handleCreateEntry = async () => {
    if (!user?.id || !newEntry.title || !newEntry.content || !newEntry.category_id) return;

    try {
      const { data: userCompanies } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!userCompanies?.company_id) return;

      const { error } = await supabase
        .from('log_entries')
        .insert({
          ...newEntry,
          company_id: userCompanies.company_id,
          created_by: user.id
        });

      if (!error) {
        setIsNewEntryOpen(false);
        setNewEntry({
          title: '',
          content: '',
          category_id: '',
          priority: 'normal',
          shift_time: ''
        });
        loadEntries();
        loadMetrics();
        toast.success('Entry created successfully');
      }
    } catch (error) {
      console.error('Error creating entry:', error);
      toast.error('Failed to create entry');
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesCategory = selectedCategory === 'all' || entry.category_id === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-primary text-primary-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <AppLayout title="Log Book" subtitle="Track daily operations and manage business logs">
      <div className="space-y-6">
        {/* Enhanced Business Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dashboardMetrics.salesAmount.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">Today's revenue</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Labor</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardMetrics.laborPercentage.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Of sales</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weather</CardTitle>
              <Cloud className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardMetrics.weatherTemp}°</div>
              <p className="text-xs text-muted-foreground">{dashboardMetrics.weatherCondition || 'Clear'}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Shift Score</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardMetrics.avgShiftScore.toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">Out of 5.0</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions and Weekly Overtime Risk */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Quick Log Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => {
                  setQuickEntryType('sales');
                  setIsQuickEntryOpen(true);
                }}
              >
                <DollarSign className="h-6 w-6" />
                <span className="text-sm">Daily Sales</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => {
                  setQuickEntryType('weather');
                  setIsQuickEntryOpen(true);
                }}
              >
                <Cloud className="h-6 w-6" />
                <span className="text-sm">Weather</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => {
                  setQuickEntryType('tasks');
                  setIsQuickEntryOpen(true);
                }}
              >
                <Star className="h-6 w-6" />
                <span className="text-sm">Task Summary</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2"
                onClick={() => {
                  setQuickEntryType('performance');
                  setIsQuickEntryOpen(true);
                }}
              >
                <Users className="h-6 w-6" />
                <span className="text-sm">Employee Performance</span>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className={cn(
                  "h-5 w-5",
                  dashboardMetrics.overtimeRisk === 'high' ? "text-red-500" :
                  dashboardMetrics.overtimeRisk === 'medium' ? "text-yellow-500" :
                  "text-green-500"
                )} />
                Weekly Overtime Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={cn(
                  "text-3xl font-bold mb-2",
                  dashboardMetrics.overtimeRisk === 'high' ? "text-red-500" :
                  dashboardMetrics.overtimeRisk === 'medium' ? "text-yellow-500" :
                  "text-green-500"
                )}>
                  {dashboardMetrics.overtimeRisk.toUpperCase()}
                </div>
                <p className="text-sm text-muted-foreground">Current risk level</p>
                <Button variant="link" className="mt-2 p-0 h-auto">
                  View Details →
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Email */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Summary Email
                </span>
                <Button onClick={() => setIsEmailSummaryOpen(true)}>
                  Send Summary
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-lg font-semibold">Last Sent</div>
                  <div className="text-sm text-muted-foreground">Yesterday 6:00 PM</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-lg font-semibold">Next Scheduled</div>
                  <div className="text-sm text-muted-foreground">Today 6:00 PM</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-lg font-semibold">Recipients</div>
                  <div className="text-sm text-muted-foreground">3 managers</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isNewEntryOpen} onOpenChange={setIsNewEntryOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Log Entry</DialogTitle>
                <DialogDescription>
                  Add a new entry to track daily operations
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Entry title"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={newEntry.category_id} onValueChange={(value) => setNewEntry(prev => ({ ...prev, category_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newEntry.priority} onValueChange={(value: any) => setNewEntry(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="shift_time">Shift Time (Optional)</Label>
                  <Input
                    id="shift_time"
                    type="time"
                    value={newEntry.shift_time}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, shift_time: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Entry content"
                    value={newEntry.content}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateEntry} disabled={!newEntry.title || !newEntry.content || !newEntry.category_id}>
                    Create Entry
                  </Button>
                  <Button variant="outline" onClick={() => setIsNewEntryOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <QuickEntryDialog
            isOpen={isQuickEntryOpen}
            onClose={() => setIsQuickEntryOpen(false)}
            entryType={quickEntryType}
            onSuccess={() => {
              loadEntries();
              loadMetrics();
            }}
          />

          <EmailSummaryDialog
            isOpen={isEmailSummaryOpen}
            onClose={() => setIsEmailSummaryOpen(false)}
            onSuccess={() => {
              // Refresh data if needed
            }}
          />
        </div>

        {/* Log Entries */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Entries</h3>
          {filteredEntries.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No entries found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory !== 'all' 
                    ? "Try adjusting your filters or search terms"
                    : "Start by creating your first log entry"
                  }
                </p>
                {!searchTerm && selectedCategory === 'all' && (
                  <Button onClick={() => setIsNewEntryOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Entry
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredEntries.map(entry => (
                <Card key={entry.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{entry.title}</CardTitle>
                        <CardDescription>
                          {entry.category?.name} • {new Date(entry.entry_date).toLocaleDateString()}
                          {entry.shift_time && ` • ${entry.shift_time}`}
                        </CardDescription>
                      </div>
                      <Badge className={getPriorityColor(entry.priority)}>
                        {entry.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{entry.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}