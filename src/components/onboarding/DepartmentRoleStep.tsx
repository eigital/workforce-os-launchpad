import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Plus, X, Users, Briefcase } from 'lucide-react';

interface DepartmentRoleStepProps {
  onNext: () => void;
}

const SUGGESTED_DEPARTMENTS = [
  { name: 'Front of House', color: '#3B82F6' },
  { name: 'Kitchen', color: '#EF4444' },
  { name: 'Management', color: '#8B5CF6' },
  { name: 'Bar', color: '#F59E0B' },
  { name: 'Delivery', color: '#10B981' },
];

const SUGGESTED_ROLES = [
  { name: 'Server', department: 'Front of House', hourly_rate: 15.00 },
  { name: 'Host/Hostess', department: 'Front of House', hourly_rate: 14.00 },
  { name: 'Cook', department: 'Kitchen', hourly_rate: 18.00 },
  { name: 'Dishwasher', department: 'Kitchen', hourly_rate: 13.00 },
  { name: 'Bartender', department: 'Bar', hourly_rate: 16.00 },
  { name: 'Manager', department: 'Management', hourly_rate: 25.00 },
  { name: 'Delivery Driver', department: 'Delivery', hourly_rate: 12.00 },
];

interface Department {
  name: string;
  color: string;
}

interface Role {
  name: string;
  department: string;
  hourly_rate: number;
}

export default function DepartmentRoleStep({ onNext }: DepartmentRoleStepProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [newDepartment, setNewDepartment] = useState('');
  const [newRole, setNewRole] = useState({ name: '', department: '', hourly_rate: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const addSuggestedDepartment = (dept: Department) => {
    if (!departments.find(d => d.name === dept.name)) {
      setDepartments([...departments, dept]);
    }
  };

  const addSuggestedRole = (role: Role) => {
    if (!roles.find(r => r.name === role.name)) {
      setRoles([...roles, role]);
    }
  };

  const addCustomDepartment = () => {
    if (newDepartment.trim() && !departments.find(d => d.name === newDepartment)) {
      const colors = ['#3B82F6', '#EF4444', '#8B5CF6', '#F59E0B', '#10B981', '#F97316'];
      const color = colors[departments.length % colors.length];
      setDepartments([...departments, { name: newDepartment.trim(), color }]);
      setNewDepartment('');
    }
  };

  const addCustomRole = () => {
    if (newRole.name.trim() && newRole.department && !roles.find(r => r.name === newRole.name)) {
      setRoles([...roles, { ...newRole, name: newRole.name.trim() }]);
      setNewRole({ name: '', department: '', hourly_rate: 0 });
    }
  };

  const removeDepartment = (name: string) => {
    setDepartments(departments.filter(d => d.name !== name));
    setRoles(roles.filter(r => r.department !== name));
  };

  const removeRole = (name: string) => {
    setRoles(roles.filter(r => r.name !== name));
  };

  const handleContinue = async () => {
    if (departments.length === 0) {
      toast({
        title: 'Add departments',
        description: 'Please add at least one department to continue.',
        variant: 'destructive',
      });
      return;
    }

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

      // Create departments
      const departmentInserts = departments.map(dept => ({
        company_id: userCompanies.company_id,
        name: dept.name,
        color: dept.color,
        is_active: true
      }));

      const { data: createdDepartments, error: deptError } = await supabase
        .from('departments')
        .insert(departmentInserts)
        .select();

      if (deptError) {
        console.error('Error creating departments:', deptError);
        toast({
          title: 'Error',
          description: 'Failed to create departments.',
          variant: 'destructive',
        });
        return;
      }

      // Create roles/positions
      if (roles.length > 0 && createdDepartments) {
        const positionInserts = roles.map(role => {
          const department = createdDepartments.find(d => d.name === role.department);
          return {
            company_id: userCompanies.company_id,
            department_id: department?.id,
            name: role.name,
            hourly_rate: role.hourly_rate,
            is_active: true
          };
        });

        const { error: posError } = await supabase
          .from('positions')
          .insert(positionInserts);

        if (posError) {
          console.error('Error creating positions:', posError);
          // Don't fail the whole step for position errors
        }
      }

      // Save progress
      const { error: progressError } = await supabase
        .from('onboarding_progress')
        .upsert([{
          user_id: user!.id,
          step_name: 'departments_roles',
          completed: true,
          data: { 
            departments: departments.map(d => ({ name: d.name, color: d.color })), 
            roles: roles.map(r => ({ name: r.name, department: r.department, hourly_rate: r.hourly_rate }))
          }
        }]);

      if (progressError) {
        console.error('Error saving progress:', progressError);
      }

      toast({
        title: 'Success',
        description: `Created ${departments.length} departments and ${roles.length} roles.`,
      });

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

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Departments & Roles</h2>
        <p className="text-muted-foreground">
          Set up your organization structure with departments and job roles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Departments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Departments
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Suggested departments</Label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_DEPARTMENTS.map((dept) => (
                  <Button
                    key={dept.name}
                    variant="outline"
                    size="sm"
                    onClick={() => addSuggestedDepartment(dept)}
                    disabled={departments.find(d => d.name === dept.name) !== undefined}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {dept.name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-dept">Add custom department</Label>
              <div className="flex gap-2">
                <Input
                  id="custom-dept"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="Department name"
                  onKeyPress={(e) => e.key === 'Enter' && addCustomDepartment()}
                />
                <Button onClick={addCustomDepartment} disabled={!newDepartment.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Current departments</Label>
              <div className="flex flex-wrap gap-2">
                {departments.map((dept) => (
                  <Badge key={dept.name} variant="secondary" className="flex items-center gap-1">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: dept.color }}
                    />
                    {dept.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => removeDepartment(dept.name)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Job Roles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Suggested roles</Label>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_ROLES.filter(role => 
                  departments.find(d => d.name === role.department)
                ).map((role) => (
                  <Button
                    key={role.name}
                    variant="outline"
                    size="sm"
                    onClick={() => addSuggestedRole(role)}
                    disabled={roles.find(r => r.name === role.name) !== undefined}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    {role.name}
                  </Button>
                ))}
              </div>
            </div>

            {departments.length > 0 && (
              <div className="space-y-2">
                <Label>Add custom role</Label>
                <div className="space-y-2">
                  <Input
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    placeholder="Role name"
                  />
                  <select
                    className="w-full p-2 border rounded-md"
                    value={newRole.department}
                    onChange={(e) => setNewRole({ ...newRole, department: e.target.value })}
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept.name} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    min="0"
                    step="0.25"
                    value={newRole.hourly_rate || ''}
                    onChange={(e) => setNewRole({ ...newRole, hourly_rate: parseFloat(e.target.value) || 0 })}
                    placeholder="Hourly rate (optional)"
                  />
                  <Button 
                    onClick={addCustomRole} 
                    disabled={!newRole.name.trim() || !newRole.department}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Role
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Current roles</Label>
              <div className="space-y-1">
                {roles.map((role) => (
                  <div key={role.name} className="flex items-center justify-between p-2 border rounded">
                    <div>
                      <div className="font-medium">{role.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {role.department} {role.hourly_rate > 0 && `• $${role.hourly_rate}/hr`}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRole(role.name)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
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
          disabled={isLoading || departments.length === 0}
          className="flex-1"
        >
          {isLoading ? 'Creating...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
}