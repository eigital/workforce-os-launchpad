import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Plus, Clock, CheckCircle, XCircle, AlertCircle, Users, CalendarDays } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function TimeOff() {
  const navigate = useNavigate()
  
  // Mock data - replace with actual data from Supabase
  const timeOffSummary = {
    vacation: { used: 40, total: 80, pending: 8 },
    sick: { used: 16, total: 40, pending: 0 },
    personal: { used: 8, total: 16, pending: 0 }
  }

  const recentRequests = [
    { id: 1, employee: "John Smith", type: "Vacation", dates: "Dec 23-27, 2024", status: "pending", days: 5 },
    { id: 2, employee: "Sarah Johnson", type: "Sick", dates: "Dec 15, 2024", status: "approved", days: 1 },
    { id: 3, employee: "Mike Chen", type: "Personal", dates: "Dec 20, 2024", status: "approved", days: 1 },
  ]

  const upcomingTimeOff = [
    { employee: "Sarah Johnson", type: "Vacation", dates: "Jan 2-5, 2025", days: 4 },
    { employee: "Mike Chen", type: "Personal", dates: "Jan 8, 2025", days: 1 },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "denied": return <XCircle className="h-4 w-4 text-red-500" />
      case "pending": return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800"
      case "denied": return "bg-red-100 text-red-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Time Off</h1>
          <p className="text-muted-foreground">Manage employee time off requests and balances</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/schedule/time-off/requests")}>
            <Plus className="h-4 w-4 mr-2" />
            New Request
          </Button>
          <Button variant="outline" onClick={() => navigate("/schedule/time-off/calendar")}>
            <CalendarDays className="h-4 w-4 mr-2" />
            View Calendar
          </Button>
        </div>
      </div>

      {/* Time Off Balance Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(timeOffSummary).map(([type, data]) => (
          <Card key={type}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium capitalize">{type}</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.used + data.pending}/{data.total}</div>
              <p className="text-xs text-muted-foreground">
                hours used/available
              </p>
              <Progress 
                value={((data.used + data.pending) / data.total) * 100} 
                className="mt-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Used: {data.used}h</span>
                {data.pending > 0 && <span>Pending: {data.pending}h</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Requests
            </CardTitle>
            <CardDescription>Latest time off requests submitted</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <div className="font-medium">{request.employee}</div>
                      <div className="text-sm text-muted-foreground">
                        {request.type} • {request.dates} • {request.days} day{request.days > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {request.status}
                  </Badge>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate("/schedule/time-off/requests")}
            >
              View All Requests
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Time Off */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Upcoming Time Off
            </CardTitle>
            <CardDescription>Approved time off in the next 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTimeOff.map((timeOff, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{timeOff.employee}</div>
                    <div className="text-sm text-muted-foreground">
                      {timeOff.type} • {timeOff.dates} • {timeOff.days} day{timeOff.days > 1 ? 's' : ''}
                    </div>
                  </div>
                  <Badge variant="outline">Approved</Badge>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate("/schedule/time-off/calendar")}
            >
              View Calendar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common time off management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => navigate("/schedule/time-off/requests")}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Request
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => navigate("/schedule/time-off/calendar")}
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              View Calendar
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => navigate("/schedule/time-off/blocked-days")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Blocked Days
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => navigate("/schedule/time-off/requests")}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Requests
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}