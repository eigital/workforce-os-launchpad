import { useState, useEffect } from 'react'
import { Plus, FileText, TrendingUp, Clock, AlertTriangle, Search, Filter, Calendar, Star } from 'lucide-react'
import AppLayout from '@/components/layouts/AppLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { format } from 'date-fns'

interface LogCategory {
  id: string
  name: string
  description: string
  color: string
  icon: string
}

interface LogEntry {
  id: string
  title: string
  content: string
  category_id: string
  priority: string
  entry_date: string
  shift_time?: string
  created_at: string
  created_by: string
  category?: LogCategory
}

interface DashboardMetrics {
  totalEntries: number
  todayEntries: number
  highPriorityEntries: number
  activeCategories: number
}

export default function LogBook() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<LogCategory[]>([])
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalEntries: 0,
    todayEntries: 0,
    highPriorityEntries: 0,
    activeCategories: 0
  })
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isNewEntryOpen, setIsNewEntryOpen] = useState(false)
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    category_id: '',
    priority: 'normal' as const,
    shift_time: ''
  })

  useEffect(() => {
    if (user) {
      loadCategories()
      loadEntries()
      loadMetrics()
    }
  }, [user])

  const loadCategories = async () => {
    const { data } = await supabase
      .from('log_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
    
    if (data) setCategories(data)
  }

  const loadEntries = async () => {
    const { data } = await supabase
      .from('log_entries')
      .select(`
        *,
        category:log_categories(id, name, description, color, icon)
      `)
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (data) setEntries(data as any)
  }

  const loadMetrics = async () => {
    // Get total entries
    const { count: totalEntries } = await supabase
      .from('log_entries')
      .select('*', { count: 'exact', head: true })

    // Get today's entries
    const today = new Date().toISOString().split('T')[0]
    const { count: todayEntries } = await supabase
      .from('log_entries')
      .select('*', { count: 'exact', head: true })
      .eq('entry_date', today)

    // Get high priority entries
    const { count: highPriorityEntries } = await supabase
      .from('log_entries')
      .select('*', { count: 'exact', head: true })
      .in('priority', ['high', 'urgent'])

    // Get active categories
    const { count: activeCategories } = await supabase
      .from('log_categories')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)

    setMetrics({
      totalEntries: totalEntries || 0,
      todayEntries: todayEntries || 0,
      highPriorityEntries: highPriorityEntries || 0,
      activeCategories: activeCategories || 0
    })
  }

  const handleCreateEntry = async () => {
    if (!user || !newEntry.title || !newEntry.content || !newEntry.category_id) return

    // Get user's company_id
    const { data: userCompanies } = await supabase
      .from('user_companies')
      .select('company_id')
      .eq('user_id', user.id)
      .single()

    if (!userCompanies) return

    const { error } = await supabase
      .from('log_entries')
      .insert({
        ...newEntry,
        company_id: userCompanies.company_id,
        created_by: user.id
      })

    if (!error) {
      setIsNewEntryOpen(false)
      setNewEntry({
        title: '',
        content: '',
        category_id: '',
        priority: 'normal',
        shift_time: ''
      })
      loadEntries()
      loadMetrics()
    }
  }

  const filteredEntries = entries.filter(entry => {
    const matchesCategory = selectedCategory === 'all' || entry.category_id === selectedCategory
    const matchesSearch = searchTerm === '' || 
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-destructive text-destructive-foreground'
      case 'high': return 'bg-orange-500 text-white'
      case 'normal': return 'bg-primary text-primary-foreground'
      case 'low': return 'bg-muted text-muted-foreground'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <AppLayout title="Log Book" subtitle="Track daily operations and manage business logs">
      <div className="space-y-6">
        {/* Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalEntries}</div>
              <p className="text-xs text-muted-foreground">All time logs</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Entries</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.todayEntries}</div>
              <p className="text-xs text-muted-foreground">Entries today</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.highPriorityEntries}</div>
              <p className="text-xs text-muted-foreground">Needs attention</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.activeCategories}</div>
              <p className="text-xs text-muted-foreground">Active categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isNewEntryOpen} onOpenChange={setIsNewEntryOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Log Entry</DialogTitle>
                <DialogDescription>
                  Add a new entry to track daily operations
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Entry title"
                    value={newEntry.title}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Select value={newEntry.category_id} onValueChange={(value) => setNewEntry(prev => ({ ...prev, category_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Select value={newEntry.priority} onValueChange={(value: any) => setNewEntry(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Input
                    type="time"
                    value={newEntry.shift_time}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, shift_time: e.target.value }))}
                    placeholder="Shift time (optional)"
                  />
                </div>

                <div>
                  <Textarea
                    placeholder="Entry content"
                    value={newEntry.content}
                    onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateEntry} disabled={!newEntry.title || !newEntry.content || !newEntry.category_id}>
                    Create Entry
                  </Button>
                  <Button variant="outline" onClick={() => setIsNewEntryOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Log Entries */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Entries</h3>
          {filteredEntries.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No entries found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || selectedCategory !== 'all' 
                    ? "Try adjusting your filters or search terms"
                    : "Start by creating your first log entry"
                  }
                </p>
                {!searchTerm && selectedCategory === 'all' && (
                  <Button onClick={() => setIsNewEntryOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Entry
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredEntries.map(entry => (
                <Card key={entry.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{entry.title}</CardTitle>
                        <CardDescription>
                          {entry.category?.name} • {format(new Date(entry.entry_date), 'MMM d, yyyy')}
                          {entry.shift_time && ` • ${entry.shift_time}`}
                        </CardDescription>
                      </div>
                      <Badge className={getPriorityColor(entry.priority)}>
                        {entry.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{entry.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}