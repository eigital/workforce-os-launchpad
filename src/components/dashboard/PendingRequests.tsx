import { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, User, Calendar, MapPin, MoreHorizontal } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface PendingRequest {
  id: string
  request_type: string
  title: string
  description?: string
  requested_at: string
  user_id: string
  status: string
}

interface PendingRequestsProps {
  companyId: string
}

const requestTypeConfig = {
  time_off: {
    icon: Calendar,
    color: 'text-blue-600',
    label: 'Time Off'
  },
  availability_change: {
    icon: Clock,
    color: 'text-purple-600',
    label: 'Availability'
  },
  shift_pickup: {
    icon: User,
    color: 'text-green-600',
    label: 'Shift Pickup'
  },
  shift_swap: {
    icon: User,
    color: 'text-orange-600',
    label: 'Shift Swap'
  }
}

export default function PendingRequests({ companyId }: PendingRequestsProps) {
  const [requests, setRequests] = useState<PendingRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPendingRequests()
  }, [companyId])

  const loadPendingRequests = async () => {
    try {
      const { data: requestsData, error } = await supabase
        .from('pending_requests')
        .select('*')
        .eq('company_id', companyId)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setRequests(requestsData || [])
    } catch (error: any) {
      console.error('Error loading pending requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestAction = async (requestId: string, action: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('pending_requests')
        .update({
          status: action,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', requestId)

      if (error) throw error

      // Remove from list
      setRequests(prev => prev.filter(r => r.id !== requestId))
    } catch (error: any) {
      console.error('Error updating request:', error)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded"></div>
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
          <Clock className="w-5 h-5" />
          Pending Requests
          {requests.length > 0 && (
            <Badge variant="secondary">{requests.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-medium mb-2">No pending requests</h3>
            <p className="text-sm text-muted-foreground">
              When your employees submit time off requests, availability changes, or shift pickups, they'll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const config = requestTypeConfig[request.request_type as keyof typeof requestTypeConfig] || {
                icon: Clock,
                color: 'text-gray-600',
                label: request.request_type
              }
              const IconComponent = config.icon

              return (
                <div key={request.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className={`flex-shrink-0 ${config.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{request.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {config.label} • {formatDistanceToNow(new Date(request.requested_at), { addSuffix: true })}
                        </p>
                        {request.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {request.description}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex gap-1 ml-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleRequestAction(request.id, 'approved')}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs"
                          onClick={() => handleRequestAction(request.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            
            {requests.length > 5 && (
              <Button variant="ghost" className="w-full">
                View all requests
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}