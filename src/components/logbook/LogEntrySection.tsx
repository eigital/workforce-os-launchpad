import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Star, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface LogEntry {
  id: string;
  title: string;
  content: string;
  created_at: string;
  priority: string;
}

interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  status: string;
}

interface LogEntrySectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  categoryId: string;
  entries: LogEntry[];
  onRefresh: () => void;
  placeholder?: string;
  showRating?: boolean;
  showAmount?: boolean;
  showEmployeeSelect?: boolean;
}

export function LogEntrySection({ 
  title, 
  icon: Icon, 
  categoryId, 
  entries, 
  onRefresh,
  placeholder = "Add your log entry...",
  showRating = false,
  showAmount = false,
  showEmployeeSelect = false
}: LogEntrySectionProps) {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");

  // Load employees if needed
  useEffect(() => {
    if (showEmployeeSelect) {
      loadEmployees();
    }
  }, [showEmployeeSelect]);

  const loadEmployees = async () => {
    try {
      const { data: employeesData, error } = await supabase
        .from('employees')
        .select('id, first_name, last_name, status')
        .eq('status', 'active')
        .order('first_name');

      if (error) throw error;
      setEmployees(employeesData || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };
  const [content, setContent] = useState("");
  const [amount, setAmount] = useState("");
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddEntry = async () => {
    if (!user?.id || !content.trim()) return;

    setIsLoading(true);
    try {
      const { data: userCompanies } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user.id)
        .single();

      if (!userCompanies?.company_id) return;

      let entryTitle = title;
      let entryContent = content;

      // Add amount to content if specified
      if (showAmount && amount) {
        entryTitle = `${title} - $${amount}`;
        entryContent = `Amount: $${amount}\n${content}`;
      }

      // Add rating to content if specified
      if (showRating && rating > 0) {
        entryTitle = `${title} - ${rating}/5 stars`;
        entryContent = `Rating: ${rating}/5 stars\n${content}`;
      }

      // Add employee info if provided
      if (showEmployeeSelect && selectedEmployee) {
        const employee = employees.find(emp => emp.id === selectedEmployee);
        if (employee) {
          entryTitle += ` - ${employee.first_name} ${employee.last_name}`;
          entryContent = `Employee: ${employee.first_name} ${employee.last_name}\n${entryContent}`;
        }
      }

      const { error } = await supabase
        .from('log_entries')
        .insert({
          title: entryTitle,
          content: entryContent,
          category_id: categoryId,
          company_id: userCompanies.company_id,
          created_by: user.id,
          priority: 'normal'
        });

      if (!error) {
        setContent("");
        setAmount("");
        setRating(0);
        setSelectedEmployee("");
        onRefresh();
        toast.success(`${title} entry added successfully`);
      }
    } catch (error) {
      console.error('Error creating entry:', error);
      toast.error('Failed to create entry');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Entry Form */}
        <div className="space-y-3">
          {showAmount && (
            <div>
              <Label htmlFor="amount" className="text-sm">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1"
              />
            </div>
          )}
          
          {showRating && (
            <div>
              <Label className="text-sm">Rating</Label>
              <div className="flex gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`w-6 h-6 ${star <= rating ? 'text-yellow-400' : 'text-muted-foreground'}`}
                  >
                    <Star className={`w-4 h-4 ${star <= rating ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Employee Selection */}
          {showEmployeeSelect && (
            <div>
              <Label className="text-sm">Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.first_name} {employee.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <Textarea
            placeholder={placeholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          
          <Button 
            onClick={handleAddEntry}
            disabled={!content.trim() || isLoading}
            className="w-full"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>

        {/* Recent Entries */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Recent Entries</h4>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">No entries yet</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {entries.slice(0, 3).map((entry) => (
                <div key={entry.id} className="p-2 rounded-md bg-muted/50 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium truncate">{entry.title}</span>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(entry.created_at)}
                      </span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-xs overflow-hidden" style={{ 
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>{entry.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}