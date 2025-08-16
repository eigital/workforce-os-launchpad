import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  email: string;
  role: 'manager' | 'employee';
}

interface TeamSetupStepProps {
  onNext: () => void;
}

export default function TeamSetupStep({ onNext }: TeamSetupStepProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'manager' | 'employee'>('employee');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addTeamMember = () => {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newEmail && emailRegex.test(newEmail) && !teamMembers.find(m => m.email === newEmail)) {
      setTeamMembers([...teamMembers, { email: newEmail, role: newRole }]);
      setNewEmail('');
    }
  };

  const removeTeamMember = (email: string) => {
    setTeamMembers(teamMembers.filter(m => m.email !== email));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Save team setup progress
      const { data: userData } = await supabase.auth.getUser();
      await supabase
        .from('onboarding_progress')
        .insert({
          user_id: userData.user?.id,
          step_name: 'team_setup',
          completed: true,
          data: { team_members: teamMembers } as any
        });

      // Here you would typically send invitations to team members
      // For now, we'll just save the data and continue

      onNext();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-muted-foreground">
          You can invite team members now or skip this step and add them later.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Team Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter team member's email"
                onKeyPress={(e) => e.key === 'Enter' && addTeamMember()}
              />
            </div>
            <div className="w-32">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'manager' | 'employee')}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
              </select>
            </div>
            <div className="self-end">
              <Button type="button" onClick={addTeamMember} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {teamMembers.length > 0 && (
            <div className="space-y-2">
              <Label>Team Members to Invite</Label>
              {teamMembers.map((member) => (
                <div
                  key={member.email}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{member.email}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {member.role}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTeamMember(member.email)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="outline" onClick={handleSkip} className="flex-1">
          Skip for Now
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
          {isLoading ? "Saving..." : teamMembers.length > 0 ? "Send Invitations" : "Continue"}
        </Button>
      </div>
    </div>
  );
}