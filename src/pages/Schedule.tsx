import { useState } from "react"
import { ChevronLeft, ChevronRight, Plus, Calendar, Upload, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const departments = [
  {
    name: "Back of House",
    positions: [
      { name: "Open Shifts", color: "bg-gray-600" },
      { name: "Cook", color: "bg-orange-200" },
      { name: "Dishwasher", color: "bg-blue-200" },
      { name: "Manager", color: "bg-green-200" }
    ]
  },
  {
    name: "Front of House", 
    positions: [
      { name: "Open Shifts", color: "bg-gray-600" },
      { name: "Server", color: "bg-orange-200" },
      { name: "Host", color: "bg-blue-200" },
      { name: "Manager", color: "bg-yellow-200" }
    ]
  }
]

const daysOfWeek = [
  { day: "Mon", date: "Aug 11" },
  { day: "Tue", date: "Aug 12" },
  { day: "Wed", date: "Aug 13" },
  { day: "Thu", date: "Aug 14" },
  { day: "Fri", date: "Aug 15" },
  { day: "Sat", date: "Aug 16" },
  { day: "Sun", date: "Aug 17" }
]

export default function Schedule() {
  const [viewMode, setViewMode] = useState<"Day" | "Week">("Week")
  const [selectedLocation, setSelectedLocation] = useState("Jason's Deli")
  const [selectedDepartment, setSelectedDepartment] = useState("All departments")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>Aug 11, 2025</span>
                <span className="text-muted-foreground">→</span>
                <span>Aug 17, 2025</span>
              </div>
              <Button variant="ghost" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                Today
              </Button>
            </div>

            {/* Location and Department Filters */}
            <div className="flex items-center gap-2">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Jason's Deli">Jason's Deli</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All departments">All departments</SelectItem>
                  <SelectItem value="Back of House">Back of House</SelectItem>
                  <SelectItem value="Front of House">Front of House</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import first schedule
            </Button>
            <Button variant="outline" size="sm">
              <Send className="h-4 w-4 mr-2" />
              Publish schedule
            </Button>
            
            {/* View Mode Toggle */}
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === "Day" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("Day")}
                className="text-xs"
              >
                Day
              </Button>
              <Button
                variant={viewMode === "Week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("Week")}
                className="text-xs"
              >
                Week
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="p-4">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Header Row */}
            <div className="grid grid-cols-8 gap-px bg-muted mb-px">
              <div className="bg-background p-3">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Add employees
                </Button>
              </div>
              {daysOfWeek.map((day) => (
                <div key={day.day} className="bg-background p-3 text-center">
                  <div className="font-medium">{day.day}</div>
                  <div className="text-sm text-muted-foreground">{day.date}</div>
                </div>
              ))}
            </div>

            {/* Events Row */}
            <div className="grid grid-cols-8 gap-px bg-muted mb-2">
              <div className="bg-background p-3">
                <span className="text-sm font-medium">Events</span>
              </div>
              {daysOfWeek.map((day) => (
                <div key={day.day} className="bg-background p-3 min-h-[40px]">
                  {/* Events would go here */}
                </div>
              ))}
            </div>

            {/* Department Sections */}
            {departments.map((department) => (
              <div key={department.name} className="mb-6">
                {/* Department Header */}
                <div className="bg-gray-800 text-white p-2 mb-px">
                  <h3 className="font-medium">{department.name}</h3>
                </div>

                {/* Position Rows */}
                {department.positions.map((position) => (
                  <div key={position.name} className="grid grid-cols-8 gap-px bg-muted mb-px">
                    <div className={`${position.color} p-3 flex items-center justify-between`}>
                      <span className="font-medium">{position.name}</span>
                    </div>
                    {daysOfWeek.map((day) => (
                      <div key={day.day} className="bg-background p-3 min-h-[60px] flex items-center">
                        {position.name !== "Open Shifts" && (
                          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
                            <Avatar className="w-6 h-6 mr-2">
                              <AvatarFallback className="text-xs bg-muted">
                                <Plus className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                            Add employee
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}