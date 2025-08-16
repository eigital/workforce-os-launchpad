import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Clock, User, Calendar, LogIn, LogOut } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ActivityLog {
  id: string
  activity_type: string
  description: string
  created_at: string
  user_id?: string
  metadata: any
}

interface ActivityFeedProps {
  companyId: string
}

const activityTypeConfig = {
  clock_in: {
    icon: LogIn,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  clock_out: {
    icon: LogOut,
    color: 'text-red-600',
    bgColor: 'bg-red-50'
  },
  schedule_created: {
    icon: Calendar,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  shift_pickup: {
    icon: User,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  },
  time_off_request: {
    icon: Calendar,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  user_added: {
    icon: User,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50'
  }
}

export default function ActivityFeed({ companyId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivityLogs()
  }, [companyId])

  const loadActivityLogs = async () => {
    try {
      const { data: logsData, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setActivities(logsData || [])
    } catch (error: any) {
      console.error('Error loading activity logs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No recent activity</h3>
            <p className="text-sm text-muted-foreground">
              When employees clock in/out, create schedules, or perform other actions, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const config = activityTypeConfig[activity.activity_type as keyof typeof activityTypeConfig] || {
                icon: Activity,
                color: 'text-gray-600',
                bgColor: 'bg-gray-50'
              }
              const IconComponent = config.icon

              return (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full ${config.bgColor} flex items-center justify-center`}>
                    <IconComponent className={`w-4 h-4 ${config.color}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {activity.activity_type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}