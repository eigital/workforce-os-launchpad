import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Users, 
  Calendar, 
  Clock, 
  Settings, 
  LogOut, 
  Bell, 
  TrendingUp, 
  DollarSign, 
  MapPin, 
  Plus,
  ChevronRight,
  X,
  Check,
  Eye,
  Download,
  Smartphone,
  BarChart3,
  CreditCard,
  Briefcase
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserRole, isManager } from '@/hooks/useUserRole';
import EmailVerificationBanner from '@/components/dashboard/EmailVerificationBanner';
import AppLayout from '@/components/layouts/AppLayout';
import { SecurityAuditPanel } from '@/components/security/SecurityAuditPanel';


export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { role: userRole } = useUserRole();
  const [profile, setProfile] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [showQuickStart, setShowQuickStart] = useState(true);
  const [setupProgress, setSetupProgress] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth/signin');
      return;
    }

    if (user) {
      loadUserData();
    }
  }, [user, loading, navigate]);

  const loadUserData = async () => {
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profileData && !profileData.onboarding_completed) {
        navigate('/onboarding');
        return;
      }

      setProfile(profileData);

      // Load company
      const { data: userCompany } = await supabase
        .from('user_companies')
        .select('company_id, companies(*)')
        .eq('user_id', user?.id)
        .single();

      if (userCompany?.companies) {
        setCompany(userCompany.companies);
        // Load additional company data after setting company
        loadCompanyData(userCompany.companies.id);
      }
    } catch (error: any) {
      console.error('Error loading user data:', error);
    }
  };

  const loadCompanyData = async (companyId: string) => {
    try {
      // Load setup progress
      const { data: setupData } = await supabase
        .from('setup_progress')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at');

      setSetupProgress(setupData || []);

      // Load locations
      const { data: locationsData } = await supabase
        .from('locations')
        .select('*')
        .eq('company_id', companyId)
        .eq('is_active', true);

      setLocations(locationsData || []);

      // Load pending requests
      const { data: requestsData } = await supabase
        .from('pending_requests')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false })
        .limit(5);

      setPendingRequests(requestsData || []);

      // Load recent activity
      const { data: activityData } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(5);

      setActivityLogs(activityData || []);
    } catch (error: any) {
      console.error('Error loading company data:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AppLayout 
      title={`Welcome back, ${profile?.first_name || 'there'}!`}
      subtitle={company?.name}
    >
      <div>
            <EmailVerificationBanner />
            
            <div className="flex gap-6">
              {/* Main Content */}
              <div className="flex-1 space-y-6">
                {/* Here's what's happening */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl font-bold">Here's what's happening</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="sales-labor" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="sales-labor">Sales vs. Labor</TabsTrigger>
                        <TabsTrigger value="whos-working">Who's working?</TabsTrigger>
                        <TabsTrigger value="location-overview">Location Overview</TabsTrigger>
                        <TabsTrigger value="engage">Engage</TabsTrigger>
                      </TabsList>
                      <TabsContent value="sales-labor" className="mt-6 space-y-6">
                        <div className="flex items-start gap-4 p-6 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1">
                            <Bell className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 mb-2">See WorkforceOS in action!</h3>
                            <p className="text-sm text-gray-600 mb-4">
                              Not sure if WorkforceOS is the right fit for you? We've got options so you can see exactly how it works, all your terms.
                            </p>
                            <div className="flex flex-wrap gap-3">
                              <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50">
                                <Eye className="h-4 w-4 mr-2" />
                                Watch an overview
                              </Button>
                              <Button variant="outline" size="sm" className="bg-white hover:bg-gray-50">
                                <Calendar className="h-4 w-4 mr-2" />
                                Book a 1-on-1 consultation
                              </Button>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="flex-shrink-0">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Have other questions? Give us a call at <span className="font-medium text-blue-600">1-888-979-5877</span>
                        </div>
                      </TabsContent>
                      <TabsContent value="whos-working" className="mt-6">
                        <div className="text-center py-12">
                          <Users className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                          <p className="text-muted-foreground font-medium">No employees are currently working</p>
                          <p className="text-sm text-muted-foreground mt-2">Employee activity will appear here when shifts are active</p>
                        </div>
                      </TabsContent>
                      <TabsContent value="location-overview" className="mt-6">
                        <div className="text-center py-12">
                          <MapPin className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                          <p className="text-muted-foreground font-medium">Location overview</p>
                          <p className="text-sm text-muted-foreground mt-2">Performance metrics across all locations will appear here</p>
                        </div>
                      </TabsContent>
                      <TabsContent value="engage" className="mt-6">
                        <div className="text-center py-12">
                          <TrendingUp className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                          <p className="text-muted-foreground font-medium">Employee engagement insights</p>
                          <p className="text-sm text-muted-foreground mt-2">Team performance and engagement data will appear here</p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* Setup Tasks */}
                <div className="space-y-4">
                  <Card className="border-orange-200 bg-orange-50/50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-orange-500 rounded-full text-white text-sm font-semibold flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-2">Add more of your locations to WorkforceOS</h3>
                          <p className="text-sm text-gray-600">
                            Centralize all your restaurant locations in WorkforceOS to ensure streamlined operations across your business.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full border-2 border-blue-600 flex items-center justify-center">
                          <Smartphone className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">Connect your POS</h3>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full border-2 border-blue-600 flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-4">Set up your payroll</h3>
                          <div className="flex flex-wrap gap-3">
                            <Button variant="outline" size="sm">
                              Connect third-party payroll
                            </Button>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              Explore WorkforceOS Payroll
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Payroll Promotion */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4">
                          <BarChart3 className="h-8 w-8 text-blue-600" />
                          <div>
                            <h3 className="font-semibold">Reduce time loss, no-shows, and compliance risks</h3>
                            <p className="text-sm text-muted-foreground">
                              Increase productivity insights from your sales, budget, actual labor and costs get better payroll and HR from us and simplify your.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            Set up WorkforceOS
                          </Button>
                          <Button variant="outline">
                            More information
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Switching to 7shifts Payroll */}
                <Card>
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          Switching to WorkforceOS Payroll is easier than you think—we set it up for you
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Our payroll experts handle your transition to WorkforceOS while you focus on your restaurant. Compliant onboarding, timesheets, and payroll that give you back time to grow your business while saving money on payroll and taxes each payroll.
                        </p>
                        <div className="flex gap-2">
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            Check out WorkforceOS Payroll
                          </Button>
                          <Button variant="outline" size="sm">
                            Talk to a payroll expert
                          </Button>
                        </div>
                      </div>
                      <div className="w-48 h-32 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-12 w-12 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Explore 7shifts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Explore WorkforceOS</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Get the most out of your plan with these popular features
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-4">
                        <div className="flex justify-center mb-3">
                          <Users className="h-8 w-8 text-blue-600" />
                        </div>
                        <h4 className="font-medium mb-2">Onboard your entire team</h4>
                        <p className="text-xs text-muted-foreground mb-3">
                          Invite your managers and employees to your WorkforceOS account to manage your team.
                        </p>
                      </div>
                      <div className="text-center p-4">
                        <div className="flex justify-center mb-3">
                          <Clock className="h-8 w-8 text-green-600" />
                        </div>
                        <h4 className="font-medium mb-2">Time Clocking</h4>
                        <p className="text-xs text-muted-foreground mb-3">
                          Approve and edit timecards for faster payroll. Manage compliance and reporting.
                        </p>
                      </div>
                      <div className="text-center p-4">
                        <div className="flex justify-center mb-3">
                          <Settings className="h-8 w-8 text-purple-600" />
                        </div>
                        <h4 className="font-medium mb-2">Set up your PTO policies</h4>
                        <p className="text-xs text-muted-foreground mb-3">
                          You can manage time off and track hours against your PTO policies.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Audit Panel - Only for Managers */}
                {isManager(userRole) && (
                  <SecurityAuditPanel />
                )}

                {/* Bottom Stats */}
                <div className="grid grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <Clock className="h-8 w-8 text-gray-600" />
                      </div>
                      <CardTitle>Pending Requests</CardTitle>
                      <p className="text-sm text-muted-foreground">No pending requests</p>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-xs text-muted-foreground mb-4">
                        When your employees submit time off requests, changes to their availability, or want to pick up shifts you can manage them here.
                      </p>
                      {pendingRequests.length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {pendingRequests.slice(0, 3).map((request) => (
                            <div key={request.id} className="text-sm border-l-2 border-primary pl-2">
                              <p className="font-medium">{request.title}</p>
                              <p className="text-xs text-muted-foreground">{request.request_type}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground mb-4">
                          When your employees submit time off requests, changes to their availability, or want to pick up shifts you can manage them here.
                        </p>
                      )}
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline" size="sm">View time off</Button>
                        <Button variant="outline" size="sm">View availability</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <BarChart3 className="h-8 w-8 text-gray-600" />
                      </div>
                      <CardTitle>Activity Log</CardTitle>
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    </CardHeader>
                    <CardContent className="text-center">
                      {activityLogs.length > 0 ? (
                        <div className="space-y-2 mb-4">
                          {activityLogs.slice(0, 3).map((log) => (
                            <div key={log.id} className="text-sm border-l-2 border-green-500 pl-2">
                              <p className="font-medium">{log.description}</p>
                              <p className="text-xs text-muted-foreground">{log.activity_type}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground mb-4">
                          Add employees to your account where they have done something on their tablet like clock in and out.
                        </p>
                      )}
                      <Button variant="outline" size="sm">View activity log</Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Quick Start Sidebar */}
              {showQuickStart && (
                <div className="w-80 space-y-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <CardTitle className="text-sm">Quick start guide</CardTitle>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowQuickStart(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-sm font-medium">Create your account</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">2</div>
                            <div className="flex-1 flex items-center justify-between">
                              <span className="text-sm font-medium">Explore Scheduling</span>
                              <Button variant="ghost" size="sm" className="h-auto p-1 text-xs">
                                <Eye className="w-3 h-3 mr-1" />
                                See it in action
                              </Button>
                            </div>
                          </div>
                          
                          <Card className="ml-8 p-3 bg-blue-50">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xs">1</div>
                              <div className="flex-1">
                                <h4 className="text-sm font-medium mb-1">Add key team members to try WorkforceOS</h4>
                                <p className="text-xs text-muted-foreground mb-3">
                                  You know those employees who will tell it like it is? They're the best for honest feedback. Invite them to try WorkforceOS so you can learn the manager and employee experience.
                                </p>
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add team members
                                </Button>
                              </div>
                            </div>
                          </Card>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-muted rounded-full flex items-center justify-center text-xs">3</div>
                          <span className="text-sm">Create your first schedule</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-muted rounded-full flex items-center justify-center text-xs">4</div>
                          <span className="text-sm">Share your schedule with your employees</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-muted rounded-full flex items-center justify-center text-xs">3</div>
                          <div className="flex-1 flex items-center justify-between">
                            <span className="text-sm">Explore Time Clocking</span>
                            <Button variant="ghost" size="sm" className="h-auto p-1 text-xs">
                              <Eye className="w-3 h-3 mr-1" />
                              See it in action
                            </Button>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-muted rounded-full flex items-center justify-center text-xs">4</div>
                          <span className="text-sm">Explore Team Communication</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-muted rounded-full flex items-center justify-center text-xs">5</div>
                          <span className="text-sm">Explore the Mobile App</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 border-2 border-muted rounded-full flex items-center justify-center text-xs">6</div>
                          <div className="flex-1 flex items-center justify-between">
                            <span className="text-sm">Explore WorkforceOS Payroll</span>
                            <Button variant="ghost" size="sm" className="h-auto p-1 text-xs">
                              <Eye className="w-3 h-3 mr-1" />
                              See it in action
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
    </AppLayout>
  );
}