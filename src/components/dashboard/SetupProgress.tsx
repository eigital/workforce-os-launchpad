import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface SetupStep {
  step_key: string
  step_name: string
  completed: boolean
  description?: string
  action_label?: string
  action_callback?: () => void
}

interface SetupProgressProps {
  companyId: string
}

const defaultSteps: SetupStep[] = [
  {
    step_key: 'add_locations',
    step_name: 'Add your restaurant locations',
    completed: false,
    description: 'Centralize all of your restaurant locations in WorkforceOS to ensure streamlined operations',
    action_label: 'Add locations'
  },
  {
    step_key: 'connect_pos',
    step_name: 'Connect your POS system',
    completed: false,
    description: 'Integrate your point-of-sale system for better sales and labor analytics',
    action_label: 'Connect POS'
  },
  {
    step_key: 'setup_payroll',
    step_name: 'Set up your payroll',
    completed: false,
    description: 'Configure payroll settings or connect with WorkforceOS Payroll',
    action_label: 'Setup Payroll'
  },
  {
    step_key: 'add_team_members',
    step_name: 'Add team members',
    completed: false,
    description: 'Invite managers and employees to start using WorkforceOS',
    action_label: 'Add Members'
  },
  {
    step_key: 'create_schedule',
    step_name: 'Create your first schedule',
    completed: false,
    description: 'Build and publish your first employee schedule',
    action_label: 'Create Schedule'
  }
]

export default function SetupProgress({ companyId }: SetupProgressProps) {
  const [steps, setSteps] = useState<SetupStep[]>(defaultSteps)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadSetupProgress()
  }, [companyId])

  const loadSetupProgress = async () => {
    try {
      const { data: progressData, error } = await supabase
        .from('setup_progress')
        .select('*')
        .eq('company_id', companyId)

      if (error) throw error

      // Update steps with progress from database
      const updatedSteps = defaultSteps.map(step => {
        const progress = progressData?.find(p => p.step_key === step.step_key)
        return {
          ...step,
          completed: progress?.completed || false
        }
      })

      setSteps(updatedSteps)
    } catch (error: any) {
      console.error('Error loading setup progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStepProgress = async (stepKey: string, completed: boolean) => {
    try {
      const step = steps.find(s => s.step_key === stepKey)
      if (!step) return

      const { error } = await supabase
        .from('setup_progress')
        .upsert({
          company_id: companyId,
          step_key: stepKey,
          step_name: step.step_name,
          completed,
          completed_at: completed ? new Date().toISOString() : null
        })

      if (error) throw error

      setSteps(prev => prev.map(s => 
        s.step_key === stepKey ? { ...s, completed } : s
      ))

      toast({
        title: completed ? "Step completed!" : "Step updated",
        description: `${step.step_name} has been ${completed ? 'completed' : 'updated'}.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive",
      })
    }
  }

  const completedCount = steps.filter(s => s.completed).length
  const progressPercentage = (completedCount / steps.length) * 100

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-2 bg-muted rounded"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Setup Progress</h3>
              <span className="text-sm text-muted-foreground">
                {completedCount}/{steps.length} completed
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={step.step_key} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {step.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                      <span className="text-xs font-medium">{index + 1}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-sm">{step.step_name}</h4>
                    {step.completed && (
                      <Badge variant="secondary" className="text-xs">
                        Completed
                      </Badge>
                    )}
                  </div>
                  
                  {step.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {step.description}
                    </p>
                  )}
                  
                  <div className="flex gap-2">
                    {!step.completed && step.action_label && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          if (step.action_callback) {
                            step.action_callback()
                          }
                          // For demo purposes, mark as completed
                          updateStepProgress(step.step_key, true)
                        }}
                      >
                        {step.action_label}
                      </Button>
                    )}
                    
                    {step.completed && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => updateStepProgress(step.step_key, false)}
                      >
                        Mark as incomplete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}