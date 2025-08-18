import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, Download } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns"
import AppLayout from "@/components/layouts/AppLayout"

export default function TimeOffCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewType, setViewType] = useState("month")
  const [filterType, setFilterType] = useState("all")

  // Mock data - replace with actual data from Supabase
  const timeOffEvents = [
    {
      id: 1,
      employee: "John Smith",
      type: "Vacation",
      startDate: new Date(2024, 11, 23), // December 23, 2024
      endDate: new Date(2024, 11, 27),   // December 27, 2024
      status: "approved",
      color: "bg-blue-100 text-blue-800"
    },
    {
      id: 2,
      employee: "Sarah Johnson",
      type: "Sick",
      startDate: new Date(2024, 11, 15), // December 15, 2024
      endDate: new Date(2024, 11, 15),
      status: "approved",
      color: "bg-red-100 text-red-800"
    },
    {
      id: 3,
      employee: "Mike Chen",
      type: "Personal",
      startDate: new Date(2024, 11, 20), // December 20, 2024
      endDate: new Date(2024, 11, 20),
      status: "approved",
      color: "bg-green-100 text-green-800"
    },
    {
      id: 4,
      employee: "Lisa Wong",
      type: "Vacation",
      startDate: new Date(2025, 0, 2), // January 2, 2025
      endDate: new Date(2025, 0, 5),   // January 5, 2025
      status: "pending",
      color: "bg-yellow-100 text-yellow-800"
    }
  ]

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const getEventsForDay = (day: Date) => {
    return timeOffEvents.filter(event => {
      const eventStart = new Date(event.startDate)
      const eventEnd = new Date(event.endDate)
      return day >= eventStart && day <= eventEnd
    })
  }

  const filteredEvents = timeOffEvents.filter(event => {
    if (filterType === "all") return true
    return event.type.toLowerCase() === filterType.toLowerCase()
  })

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    )
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "vacation": return "bg-blue-100 text-blue-800"
      case "sick": return "bg-red-100 text-red-800"
      case "personal": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const upcomingEvents = filteredEvents
    .filter(event => new Date(event.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5)

  return (
    <AppLayout title="Time Off Calendar" subtitle="View approved and pending time off requests">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Time Off Calendar</h1>
            <p className="text-muted-foreground">View approved and pending time off requests</p>
          </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Calendar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar View */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-semibold">
                      {format(currentDate, "MMMM yyyy")}
                    </h2>
                    <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="vacation">Vacation</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center font-medium text-muted-foreground text-sm">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map(day => {
                  const dayEvents = getEventsForDay(day).filter(event => 
                    filterType === "all" || event.type.toLowerCase() === filterType.toLowerCase()
                  )
                  const isToday = isSameDay(day, new Date())
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={`min-h-[100px] p-2 border border-border rounded-lg ${
                        isToday ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-primary' : 'text-foreground'
                      }`}>
                        {format(day, 'd')}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`text-xs p-1 rounded ${getTypeColor(event.type)} truncate`}
                            title={`${event.employee} - ${event.type}`}
                          >
                            {event.employee}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <span className="text-sm">Vacation</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <span className="text-sm">Sick Leave</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span className="text-sm">Personal</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-yellow-500"></div>
                <span className="text-sm">Pending</span>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Time Off */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4" />
                Upcoming Time Off
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map(event => (
                  <div key={event.id} className="space-y-1">
                    <div className="font-medium text-sm">{event.employee}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(event.startDate), "MMM d")} - {format(new Date(event.endDate), "MMM d")}
                    </div>
                    <Badge className={getTypeColor(event.type)} variant="secondary">
                      {event.type}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming time off</p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Requests:</span>
                <span className="font-medium">{filteredEvents.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Approved:</span>
                <span className="font-medium text-green-600">
                  {filteredEvents.filter(e => e.status === 'approved').length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pending:</span>
                <span className="font-medium text-yellow-600">
                  {filteredEvents.filter(e => e.status === 'pending').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
    </AppLayout>
  )
}