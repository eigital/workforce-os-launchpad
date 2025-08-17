import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { UserPlus, Mail, X, Users, Briefcase } from 'lucide-react';

interface EnhancedTeamSetupStepProps {
  onNext: () => void;
}

interface TeamMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department: string;
  hourly_rate?: number;
}

interface Department {
  id: string;
  name: string;
}

interface Position {
  id: string;
  name: string;
  department_id: string;
  hourly_rate?: number;
}

export default function EnhancedTeamSetupStep({ onNext }: EnhancedTeamSetupStepProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [newMember, setNewMember] = useState({
    email: '',
    first_name: '',
    last_name: '',
    department: '',
    role: '',
    hourly_rate: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadDepartmentsAndPositions();
  }, [user]);

  const loadDepartmentsAndPositions = async () => {
    try {
      // Get user's company
      const { data: userCompanies } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user!.id)
        .single();

      if (!userCompanies) return;

      // Load departments
      const { data: deptData } = await supabase
        .from('departments')
        .select('id, name')
        .eq('company_id', userCompanies.company_id)
        .eq('is_active', true);

      if (deptData) {
        setDepartments(deptData);
      }

      // Load positions
      const { data: posData } = await supabase
        .from('positions')
        .select('id, name, department_id, hourly_rate')
        .eq('company_id', userCompanies.company_id)
        .eq('is_active', true);

      if (posData) {
        setPositions(posData);
      }
    } catch (error) {
      console.error('Error loading departments and positions:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const addTeamMember = () => {
    if (!newMember.email || !newMember.first_name || !newMember.last_name) {
      toast({
        title: 'Missing information',
        description: 'Please fill in email, first name, and last name.',
        variant: 'destructive',
      });
      return;
    }

    const selectedPosition = positions.find(p => p.id === newMember.role);
    const selectedDepartment = departments.find(d => d.id === newMember.department);

    const member: TeamMember = {
      id: Date.now().toString(),
      email: newMember.email,
      first_name: newMember.first_name,
      last_name: newMember.last_name,
      role: selectedPosition?.name || '',
      department: selectedDepartment?.name || '',
      hourly_rate: newMember.hourly_rate ? parseFloat(newMember.hourly_rate) : selectedPosition?.hourly_rate
    };

    setTeamMembers([...teamMembers, member]);
    setNewMember({
      email: '',
      first_name: '',
      last_name: '',
      department: '',
      role: '',
      hourly_rate: ''
    });
  };

  const removeTeamMember = (id: string) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  const handleDepartmentChange = (deptId: string) => {
    setNewMember(prev => ({
      ...prev,
      department: deptId,
      role: '', // Reset role when department changes
      hourly_rate: ''
    }));
  };

  const handleRoleChange = (roleId: string) => {
    const selectedPosition = positions.find(p => p.id === roleId);
    setNewMember(prev => ({
      ...prev,
      role: roleId,
      hourly_rate: selectedPosition?.hourly_rate?.toString() || ''
    }));
  };

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      // Get user's company
      const { data: userCompanies } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user!.id)
        .single();

      if (!userCompanies) {
        toast({
          title: 'Error',
          description: 'No company found. Please complete previous steps.',
          variant: 'destructive',
        });
        return;
      }

      // Create employees for each team member
      if (teamMembers.length > 0) {
        const employeeInserts = teamMembers.map(member => {
          const selectedPosition = positions.find(p => p.name === member.role);
          return {
            company_id: userCompanies.company_id,
            first_name: member.first_name,
            last_name: member.last_name,
            email: member.email,
            hourly_rate: member.hourly_rate || null,
            positions: selectedPosition ? [selectedPosition.id] : [],
            status: 'active'
          };
        });

        const { error: employeeError } = await supabase
          .from('employees')
          .insert(employeeInserts);

        if (employeeError) {
          console.error('Error creating employees:', employeeError);
          toast({
            title: 'Error',
            description: 'Failed to add team members.',
            variant: 'destructive',
          });
          return;
        }

        toast({
          title: 'Success',
          description: `Added ${teamMembers.length} team members successfully!`,
        });
      }

      // Save progress
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .upsert([{
          user_id: user!.id,
          step_name: 'team_setup',
          completed: true,
          data: { team_members_count: teamMembers.length }
        }]);

      if (progressError) {
        console.error('Error saving progress:', progressError);
      }

      onNext();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const availablePositions = newMember.department 
    ? positions.filter(p => p.department_id === newMember.department)
    : [];

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Team Setup</h2>
        <p className="text-muted-foreground">
          Add your team members with their roles and departments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Team Member Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add Team Member
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input
                  id="first-name"
                  value={newMember.first_name}
                  onChange={(e) => setNewMember(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input
                  id="last-name"
                  value={newMember.last_name}
                  onChange={(e) => setNewMember(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                placeholder="john@example.com"
              />
            </div>

            {departments.length > 0 && (
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={newMember.department} onValueChange={handleDepartmentChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {availablePositions.length > 0 && (
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={newMember.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePositions.map((pos) => (
                      <SelectItem key={pos.id} value={pos.id}>
                        {pos.name} {pos.hourly_rate && `($${pos.hourly_rate}/hr)`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="hourly-rate">Hourly Rate (optional)</Label>
              <Input
                id="hourly-rate"
                type="number"
                min="0"
                step="0.25"
                value={newMember.hourly_rate}
                onChange={(e) => setNewMember(prev => ({ ...prev, hourly_rate: e.target.value }))}
                placeholder="15.00"
              />
            </div>

            <Button 
              onClick={addTeamMember} 
              className="w-full"
              disabled={!newMember.email || !newMember.first_name || !newMember.last_name}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Team Member
            </Button>
          </CardContent>
        </Card>

        {/* Team Members List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Team Members ({teamMembers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teamMembers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No team members added yet</p>
                <p className="text-sm">Add team members to send them invitations</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium">
                          {member.first_name} {member.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {member.email}
                        </div>
                        <div className="flex gap-2 mt-1">
                          {member.department && (
                            <Badge variant="outline" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {member.department}
                            </Badge>
                          )}
                          {member.role && (
                            <Badge variant="outline" className="text-xs">
                              <Briefcase className="h-3 w-3 mr-1" />
                              {member.role}
                            </Badge>
                          )}
                          {member.hourly_rate && (
                            <Badge variant="outline" className="text-xs">
                              ${member.hourly_rate}/hr
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTeamMember(member.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={onNext}
          className="flex-1"
        >
          Skip for now
        </Button>
        <Button 
          onClick={handleContinue}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Adding...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}