import { useState } from "react"
import { Check, Eye, Plus, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

const quickStartSteps = [
  {
    id: 1,
    title: "Create your account",
    completed: true,
    description: "",
    subSteps: []
  },
  {
    id: 2,
    title: "Explore Scheduling",
    completed: false,
    description: "",
    actionLink: "See it in action",
    subSteps: [
      {
        id: "2.1",
        title: "Add key team members to try 7shifts",
        description: "You know those employees who have no problem telling you like it is? They're the best for honest feedback. Invite them to try 7shifts so you can learn how to optimize the manager and employee experience.",
        action: "Add team members",
        icon: "👥",
        completed: false
      },
      {
        id: "2.2",
        title: "Create your first schedule",
        description: "",
        completed: false
      },
      {
        id: "2.3",
        title: "Share your schedule with your employees",
        description: "",
        completed: false
      }
    ]
  },
  {
    id: 3,
    title: "Explore Time Clocking",
    completed: false,
    description: "",
    actionLink: "See it in action",
    subSteps: []
  },
  {
    id: 4,
    title: "Explore Team Communication",
    completed: false,
    description: "",
    subSteps: []
  },
  {
    id: 5,
    title: "Explore the Mobile App",
    completed: false,
    description: "",
    subSteps: []
  },
  {
    id: 6,
    title: "Explore 7shifts Payroll",
    completed: false,
    description: "",
    actionLink: "See it in action",
    subSteps: []
  }
]

export default function QuickStart() {
  const [completedSteps, setCompletedSteps] = useState<string[]>(["1"])
  const completedCount = completedSteps.length
  const totalSteps = quickStartSteps.length

  const toggleStepCompletion = (stepId: string) => {
    setCompletedSteps(prev => 
      prev.includes(stepId) 
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Quick start guide</h1>
          <p className="text-muted-foreground">Let's see how easy scheduling can be.</p>
        </div>
        <Button variant="ghost" className="text-sm">
          Skip guide
        </Button>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-muted-foreground">{completedCount}/{totalSteps} complete</span>
        </div>
        <Progress value={(completedCount / totalSteps) * 100} className="h-2" />
      </div>

      {/* Steps */}
      <div className="space-y-6">
        {quickStartSteps.map((step) => {
          const isCompleted = completedSteps.includes(step.id.toString())
          const isExpanded = step.id === 2 // Expand the scheduling step by default
          
          return (
            <div key={step.id} className="relative">
              {/* Step Header */}
              <div className="flex items-start gap-4">
                {/* Step Number/Checkmark */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  isCompleted 
                    ? "bg-green-500 text-white" 
                    : "bg-muted text-muted-foreground"
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-medium">{step.title}</h3>
                    {step.actionLink && (
                      <Button variant="ghost" size="sm" className="text-sm h-auto p-1">
                        <Eye className="w-3 h-3 mr-1" />
                        {step.actionLink}
                      </Button>
                    )}
                  </div>

                  {/* Sub-steps */}
                  {isExpanded && step.subSteps.length > 0 && (
                    <div className="space-y-4 mt-4">
                      {step.subSteps.map((subStep) => (
                        <Card key={subStep.id} className="border-0 shadow-sm">
                          <CardContent className="p-6">
                            <div className="flex items-start gap-4">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                                {subStep.id.split('.')[1]}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium mb-2">{subStep.title}</h4>
                                {subStep.description && (
                                  <p className="text-sm text-muted-foreground mb-4">
                                    {subStep.description}
                                  </p>
                                )}
                                {subStep.action && (
                                  <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    {subStep.action}
                                  </Button>
                                )}
                              </div>
                              {subStep.icon && (
                                <div className="w-24 h-16 bg-gradient-to-r from-orange-400 to-pink-400 rounded-lg flex items-center justify-center text-2xl">
                                  {subStep.icon}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {/* Collapsed sub-steps indicator */}
                  {!isExpanded && step.subSteps.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {step.subSteps.map((subStep) => (
                        <div key={subStep.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-4 h-4 rounded border" />
                          <span>{subStep.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Connecting line */}
              {step.id < quickStartSteps.length && (
                <div className="absolute left-4 top-8 w-px h-6 bg-border" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}