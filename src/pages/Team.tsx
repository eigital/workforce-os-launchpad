import React, { useState, useEffect } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/card";
import { 
  Search, 
  Plus, 
  MoreHorizontal, 
  MapPin, 
  Building2, 
  User, 
  Briefcase,
  UserCheck,
  Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole, isManager } from "@/hooks/useUserRole";

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone_number?: string;
  employee_id?: string;
  status: string;
  hire_date?: string;
  hourly_rate?: number;
  positions?: string[];
  metadata?: any;
  created_at: string;
  updated_at: string;
}

interface Department {
  id: string;
  name: string;
  color?: string;
  is_active: boolean;
}

interface Location {
  id: string;
  name: string;
  is_active: boolean;
}

export default function Team() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const { toast } = useToast();
  const { role: userRole } = useUserRole();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Check user role to determine data access level
      const { data: userRole, error: roleError } = await supabase
        .from('user_companies')
        .select('role')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      const isManagerRole = ['owner', 'admin', 'manager'].includes(userRole?.role || '');

      // Load employees with role-based column selection
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select(
          isManagerRole 
            ? '*' // Managers can see all data including PII
            : 'id, company_id, first_name, last_name, employee_id, status, hire_date, positions, created_at, updated_at, metadata' // Regular employees see only basic info
        )
        .order('created_at', { ascending: false });

      if (employeesError) throw employeesError;

      // Load departments
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (departmentsError) throw departmentsError;

      // Load locations
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (locationsError) throw locationsError;

      setEmployees(employeesData || []);
      setDepartments(departmentsData || []);
      setLocations(locationsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load team data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !searchTerm || 
      `${employee.first_name} ${employee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (isManager(userRole) && employee.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      employee.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || employee.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getEmployeeInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            <div className="text-center py-8">
              Loading team data...
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
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-4 p-4">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">View Employees</h1>
              <p className="text-muted-foreground">Manage your team members and their information</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <MoreHorizontal className="h-4 w-4 mr-2" />
                Bulk actions
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add employee
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search for an employee"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-4 flex-wrap">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-[180px]">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[180px]">
                  <Building2 className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All departments</SelectItem>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-[180px]">
                  <User className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px]">
                  <UserCheck className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Employee Count */}
          <div className="text-sm text-muted-foreground">
            Employee ({filteredEmployees.length})
          </div>

          {/* Employee Grid */}
          <div className="grid gap-4">
            {filteredEmployees.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No employees found</h3>
                  <p className="text-muted-foreground text-center">
                    {searchTerm ? "Try adjusting your search criteria" : "Get started by adding your first employee"}
                  </p>
                  {!searchTerm && (
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Add employee
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredEmployees.map((employee) => (
                <Card key={employee.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" alt={`${employee.first_name} ${employee.last_name}`} />
                          <AvatarFallback>
                            {getEmployeeInitials(employee.first_name, employee.last_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {employee.first_name.toLowerCase()} {employee.last_name.toLowerCase()}
                            </span>
                            {employee.metadata?.isOwner && (
                              <Badge variant="secondary" className="text-xs">
                                Account owner
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {employee.metadata?.role || 'Employee'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                          {employee.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}