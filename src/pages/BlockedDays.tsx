import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Search, Calendar as CalendarIcon, Edit, Trash2, Ban } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function BlockedDays() {
  const [searchTerm, setSearchTerm] = useState("")
  const [showNewBlockedDayModal, setShowNewBlockedDayModal] = useState(false)
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [isRecurring, setIsRecurring] = useState(false)

  // Mock data - replace with actual data from Supabase
  const blockedDays = [
    {
      id: 1,
      title: "Christmas Holiday",
      description: "Company-wide holiday closure",
      startDate: "2024-12-25",
      endDate: "2024-12-25",
      location: "All Locations",
      department: "All Departments",
      isRecurring: true,
      createdBy: "HR Manager",
      createdAt: "2024-11-01T10:00:00Z"
    },
    {
      id: 2,
      title: "New Year's Day",
      description: "Company holiday",
      startDate: "2025-01-01",
      endDate: "2025-01-01",
      location: "All Locations",
      department: "All Departments",
      isRecurring: true,
      createdBy: "HR Manager",
      createdAt: "2024-11-01T10:00:00Z"
    },
    {
      id: 3,
      title: "Inventory Day",
      description: "Annual inventory count - no time off requests",
      startDate: "2024-12-31",
      endDate: "2024-12-31",
      location: "Warehouse",
      department: "Operations",
      isRecurring: false,
      createdBy: "Operations Manager",
      createdAt: "2024-11-15T14:30:00Z"
    },
    {
      id: 4,
      title: "Black Friday",
      description: "Peak sales period - limited time off",
      startDate: "2024-11-29",
      endDate: "2024-11-29",
      location: "All Retail Locations",
      department: "Sales",
      isRecurring: true,
      createdBy: "Retail Manager",
      createdAt: "2024-10-01T09:00:00Z"
    }
  ]

  const filteredBlockedDays = blockedDays.filter(day =>
    day.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    day.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    day.location.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmitBlockedDay = () => {
    console.log("Submitting new blocked day")
    // Implement blocked day creation logic
    setShowNewBlockedDayModal(false)
  }

  const handleEdit = (id: number) => {
    console.log("Editing blocked day:", id)
    // Implement edit logic
  }

  const handleDelete = (id: number) => {
    console.log("Deleting blocked day:", id)
    // Implement delete logic
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Blocked Days</h1>
          <p className="text-muted-foreground">Manage days when time off requests are restricted</p>
        </div>
        <Dialog open={showNewBlockedDayModal} onOpenChange={setShowNewBlockedDayModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Blocked Day
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add Blocked Day</DialogTitle>
              <DialogDescription>
                Create a new blocked day when time off requests should be restricted.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">Title</Label>
                <Input
                  id="title"
                  className="col-span-3"
                  placeholder="e.g., Christmas Holiday"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea 
                  id="description"
                  className="col-span-3"
                  placeholder="Brief description of why this day is blocked"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "col-span-3 justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "col-span-3 justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">Location</Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="main">Main Office</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="retail">Retail Locations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">Department</Label>
                <Select>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="sales">Sales</SelectItem>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="hr">Human Resources</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recurring" className="text-right">Recurring</Label>
                <div className="col-span-3 flex items-center space-x-2">
                  <Checkbox 
                    id="recurring" 
                    checked={isRecurring}
                    onCheckedChange={(checked) => setIsRecurring(checked === true)}
                  />
                  <Label htmlFor="recurring" className="text-sm">
                    This blocked day recurs annually
                  </Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSubmitBlockedDay}>Add Blocked Day</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search blocked days by title, description, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardContent>
      </Card>

      {/* Blocked Days Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5" />
            Blocked Days ({filteredBlockedDays.length})
          </CardTitle>
          <CardDescription>Days when time off requests are restricted or not allowed</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Recurring</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBlockedDays.map((blockedDay) => (
                <TableRow key={blockedDay.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{blockedDay.title}</div>
                      <div className="text-sm text-muted-foreground">{blockedDay.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {blockedDay.startDate === blockedDay.endDate ? (
                      format(new Date(blockedDay.startDate), "MMM d, yyyy")
                    ) : (
                      `${format(new Date(blockedDay.startDate), "MMM d")} - ${format(new Date(blockedDay.endDate), "MMM d, yyyy")}`
                    )}
                  </TableCell>
                  <TableCell>{blockedDay.location}</TableCell>
                  <TableCell>{blockedDay.department}</TableCell>
                  <TableCell>
                    {blockedDay.isRecurring ? (
                      <Badge variant="secondary">Annual</Badge>
                    ) : (
                      <Badge variant="outline">One-time</Badge>
                    )}
                  </TableCell>
                  <TableCell>{blockedDay.createdBy}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(blockedDay.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(blockedDay.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}