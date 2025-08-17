import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Plus, Calendar, Upload, Send, Grid, List, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { format, addDays, startOfWeek, endOfWeek } from "date-fns"

interface Department {
  id: string
  name: string
  color: string
  positions: Position[]
}

interface Position {
  id: string
  name: string
  color: string
  department_id: string
}

interface Employee {
  id: string
  first_name: string
  last_name: string
  positions: string[]
}

interface Location {
  id: string
  name: string
}

export default function Schedule() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [viewMode, setViewMode] = useState<"Day" | "Week">("Week")
  const [selectedLocation, setSelectedLocation] = useState<string>("")
  const [selectedDepartment, setSelectedDepartment] = useState("All departments")
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [departments, setDepartments] = useState<Department[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [companyId, setCompanyId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [addEmployeeModal, setAddEmployeeModal] = useState(false)
  const [newEmployee, setNewEmployee] = useState({
    first_name: "",
    last_name: "",
    email: "",
    position_id: ""
  })

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Monday
  const daysOfWeek = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      // Get company ID
      const { data: userCompany } = await supabase
        .from('user_companies')
        .select('company_id')
        .eq('user_id', user.id)
        .single()

      if (!userCompany) return

      setCompanyId(userCompany.company_id)

      // Load locations
      const { data: locationsData } = await supabase
        .from('locations')
        .select('*')
        .eq('company_id', userCompany.company_id)
        .eq('is_active', true)

      setLocations(locationsData || [])
      if (locationsData && locationsData.length > 0) {
        setSelectedLocation(locationsData[0].id)
      }

      // Load departments and positions
      const { data: departmentsData } = await supabase
        .from('departments')
        .select(`
          *,
          positions (*)
        `)
        .eq('company_id', userCompany.company_id)
        .eq('is_active', true)
        .order('sort_order')

      // Transform data to include positions in departments
      const formattedDepartments: Department[] = departmentsData?.map(dept => ({
        id: dept.id,
        name: dept.name,
        color: dept.color || '#6B7280',
        positions: Array.isArray(dept.positions) ? dept.positions.map((pos: any) => ({
          id: pos.id,
          name: pos.name,
          color: pos.color || '#F3F4F6',
          department_id: pos.department_id
        })) : []
      })) || []

      setDepartments(formattedDepartments)

      // Load employees
      const { data: employeesData } = await supabase
        .from('employees')
        .select('*')
        .eq('company_id', userCompany.company_id)
        .eq('status', 'active')

      setEmployees(employeesData || [])

      // Create default departments if none exist
      if (!departmentsData || departmentsData.length === 0) {
        await createDefaultDepartments(userCompany.company_id)
      }

    } catch (error: any) {
      console.error('Error loading schedule data:', error)
      toast({
        title: "Error",
        description: "Failed to load schedule data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createDefaultDepartments = async (companyId: string) => {
    try {
      // Create Back of House department
      const { data: bohDept, error: bohError } = await supabase
        .from('departments')
        .insert({
          company_id: companyId,
          name: 'Back of House',
          color: '#374151',
          sort_order: 1
        })
        .select()
        .single()

      if (bohError) throw bohError

      // Create Front of House department
      const { data: fohDept, error: fohError } = await supabase
        .from('departments')
        .insert({
          company_id: companyId,
          name: 'Front of House',
          color: '#374151',
          sort_order: 2
        })
        .select()
        .single()

      if (fohError) throw fohError

      // Create positions for Back of House
      const bohPositions = [
        { name: 'Open Shifts', color: '#6B7280' },
        { name: 'Cook', color: '#FED7AA' },
        { name: 'Dishwasher', color: '#BFDBFE' },
        { name: 'Manager', color: '#BBF7D0' }
      ]

      for (const position of bohPositions) {
        await supabase
          .from('positions')
          .insert({
            company_id: companyId,
            department_id: bohDept.id,
            ...position
          })
      }

      // Create positions for Front of House
      const fohPositions = [
        { name: 'Open Shifts', color: '#6B7280' },
        { name: 'Server', color: '#FED7AA' },
        { name: 'Host', color: '#BFDBFE' },
        { name: 'Manager', color: '#FEF3C7' }
      ]

      for (const position of fohPositions) {
        await supabase
          .from('positions')
          .insert({
            company_id: companyId,
            department_id: fohDept.id,
            ...position
          })
      }

      // Reload data
      loadData()
    } catch (error: any) {
      console.error('Error creating default departments:', error)
    }
  }

  const addEmployee = async () => {
    if (!newEmployee.first_name || !newEmployee.last_name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase
        .from('employees')
        .insert({
          company_id: companyId,
          first_name: newEmployee.first_name,
          last_name: newEmployee.last_name,
          email: newEmployee.email,
          positions: newEmployee.position_id ? [newEmployee.position_id] : []
        })

      if (error) throw error

      toast({
        title: "Success",
        description: "Employee added successfully",
      })

      setAddEmployeeModal(false)
      setNewEmployee({ first_name: "", last_name: "", email: "", position_id: "" })
      loadData()
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to add employee",
        variant: "destructive",
      })
    }
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(newWeek.getDate() + (direction === 'next' ? 7 : -7))
    setCurrentWeek(newWeek)
  }

  const goToToday = () => {
    setCurrentWeek(new Date())
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-16 bg-muted rounded"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Date Navigation */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>{format(weekStart, 'MMM d, yyyy')}</span>
                <span className="text-muted-foreground">→</span>
                <span>{format(endOfWeek(currentWeek, { weekStartsOn: 1 }), 'MMM d, yyyy')}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigateWeek('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
            </div>

            {/* Location and Department Filters */}
            <div className="flex items-center gap-2">
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border shadow-lg z-50">
                  <SelectItem value="All departments">All departments</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import schedule
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
                <Dialog open={addEmployeeModal} onOpenChange={setAddEmployeeModal}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Plus className="h-4 w-4 mr-2" />
                      Add employees
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-background">
                    <DialogHeader>
                      <DialogTitle>Add New Employee</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="first_name">First Name</Label>
                          <Input
                            id="first_name"
                            value={newEmployee.first_name}
                            onChange={(e) => setNewEmployee({...newEmployee, first_name: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="last_name">Last Name</Label>
                          <Input
                            id="last_name"
                            value={newEmployee.last_name}
                            onChange={(e) => setNewEmployee({...newEmployee, last_name: e.target.value})}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newEmployee.email}
                          onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={addEmployee}>Add Employee</Button>
                        <Button variant="outline" onClick={() => setAddEmployeeModal(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {daysOfWeek.map((day) => (
                <div key={day.toISOString()} className="bg-background p-3 text-center">
                  <div className="font-medium">{format(day, 'E')}</div>
                  <div className="text-sm text-muted-foreground">{format(day, 'MMM d')}</div>
                </div>
              ))}
            </div>

            {/* Events Row */}
            <div className="grid grid-cols-8 gap-px bg-muted mb-2">
              <div className="bg-background p-3">
                <span className="text-sm font-medium">Events</span>
              </div>
              {daysOfWeek.map((day) => (
                <div key={day.toISOString()} className="bg-background p-3 min-h-[40px]">
                  {/* Events would go here */}
                </div>
              ))}
            </div>

            {/* Department Sections */}
            {departments
              .filter(dept => selectedDepartment === "All departments" || dept.id === selectedDepartment)
              .map((department) => (
              <div key={department.id} className="mb-6">
                {/* Department Header */}
                <div className="bg-gray-800 text-white p-2 mb-px">
                  <h3 className="font-medium">{department.name}</h3>
                </div>

                {/* Position Rows */}
                {department.positions.map((position) => (
                  <div key={position.id} className="grid grid-cols-8 gap-px bg-muted mb-px">
                    <div 
                      className="p-3 flex items-center justify-between"
                      style={{ backgroundColor: position.color }}
                    >
                      <span className="font-medium">{position.name}</span>
                    </div>
                    {daysOfWeek.map((day) => (
                      <div key={day.toISOString()} className="bg-background p-3 min-h-[60px] flex items-center">
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

            {departments.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No departments found</h3>
                <p className="text-muted-foreground mb-4">
                  Create departments and positions to start building your schedule.
                </p>
                <Button onClick={() => createDefaultDepartments(companyId)}>
                  Create Default Departments
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}