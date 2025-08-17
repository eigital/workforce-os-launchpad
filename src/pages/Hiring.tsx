import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Users, 
  Plus, 
  FileText, 
  TrendingUp,
  Clock,
  CheckCircle,
  UserCheck,
  Building2,
  MapPin
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface JobPosting {
  id: string;
  title: string;
  description: string;
  location: string;
  department: string;
  status: 'active' | 'paused' | 'closed';
  applications_count: number;
  created_at: string;
  updated_at: string;
}

export default function Hiring() {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPostings: 0,
    activePostings: 0,
    totalApplications: 0,
    newApplications: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadHiringData();
  }, []);

  const loadHiringData = async () => {
    try {
      setLoading(true);
      
      // For now, we'll use placeholder data since job postings aren't fully implemented
      // In a real implementation, you would load from a job_postings table
      setJobPostings([]);
      setStats({
        totalPostings: 0,
        activePostings: 0,
        totalApplications: 0,
        newApplications: 0
      });

    } catch (error) {
      console.error('Error loading hiring data:', error);
      toast({
        title: "Error",
        description: "Failed to load hiring data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
              <span>Hiring</span>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="text-center py-8">
              Loading hiring data...
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
            <span>Hiring</span>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Main Hero Section */}
          <div className="text-center py-12">
            <Card className="max-w-4xl mx-auto border-none shadow-none bg-gradient-to-br from-background to-muted/30">
              <CardContent className="p-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  <div className="text-left">
                    <h1 className="text-3xl font-bold mb-4">Find the perfect candidate</h1>
                    <p className="text-muted-foreground text-lg mb-6">
                      Use WorkforceOS Hiring to create job postings and find the right candidates for your restaurant.
                    </p>
                    <p className="text-muted-foreground mb-8">
                      Get started by telling us what you're looking for.
                    </p>
                    <div className="flex items-center gap-4">
                      <Button size="lg" className="bg-primary hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        Add a job posting
                      </Button>
                      <Button variant="outline" size="lg">
                        Learn more
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Visual Elements */}
                    <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <UserCheck className="h-8 w-8" />
                          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <Users className="h-6 w-6" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 bg-white/30 rounded"></div>
                          <div className="h-2 bg-white/30 rounded w-3/4"></div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <FileText className="h-8 w-8" />
                          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                            <CheckCircle className="h-6 w-6" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 bg-white/30 rounded"></div>
                          <div className="h-2 bg-white/30 rounded w-2/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    {/* Bottom Images Placeholder */}
                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <Card className="bg-gradient-to-br from-orange-400 to-orange-500">
                        <CardContent className="p-4">
                          <div className="aspect-video bg-white/20 rounded-lg flex items-center justify-center">
                            <Building2 className="h-8 w-8 text-white" />
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-gradient-to-br from-purple-400 to-purple-500">
                        <CardContent className="p-4">
                          <div className="aspect-video bg-white/20 rounded-lg flex items-center justify-center">
                            <MapPin className="h-8 w-8 text-white" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Job Postings</p>
                    <p className="text-2xl font-bold">{stats.totalPostings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Active Postings</p>
                    <p className="text-2xl font-bold">{stats.activePostings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-purple-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                    <p className="text-2xl font-bold">{stats.totalApplications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-orange-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">New This Week</p>
                    <p className="text-2xl font-bold">{stats.newApplications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Job Postings Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Job Postings</CardTitle>
                  <CardDescription>
                    Manage your current job openings and applications
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Posting
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {jobPostings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No job postings yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first job posting to start attracting candidates.
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Job Posting
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobPostings.map((posting) => (
                    <Card key={posting.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{posting.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {posting.department} • {posting.location}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-lg font-semibold">{posting.applications_count}</div>
                              <div className="text-xs text-muted-foreground">Applications</div>
                            </div>
                            <Badge variant={posting.status === 'active' ? 'default' : 'secondary'}>
                              {posting.status}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hiring Process Guide */}
          <Card>
            <CardHeader>
              <CardTitle>Your Hiring Process</CardTitle>
              <CardDescription>
                Follow these steps to attract and hire the best candidates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-medium mb-2">1. Create Job Postings</h3>
                  <p className="text-sm text-muted-foreground">
                    Define your requirements and post openings to attract qualified candidates.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="font-medium mb-2">2. Review Applications</h3>
                  <p className="text-sm text-muted-foreground">
                    Screen candidates and manage applications through your hiring pipeline.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="font-medium mb-2">3. Hire & Onboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Make offers and seamlessly onboard new team members to your workforce.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}