import { useState, useEffect } from 'react'
import { Search, Filter, Calendar, Download, Eye, Clock, Tag } from 'lucide-react'
import AppLayout from '@/components/layouts/AppLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'

interface LogCategory {
  id: string
  name: string
  color: string
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
  tags: string[]
  category?: LogCategory
}

interface SearchFilters {
  searchTerm: string
  dateRange?: DateRange
  categories: string[]
  priorities: string[]
  hasShiftTime: boolean | null
  sortBy: 'created_at' | 'entry_date' | 'priority'
  sortOrder: 'asc' | 'desc'
}

export default function LogBookSearch() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<LogCategory[]>([])
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    categories: [],
    priorities: [],
    hasShiftTime: null,
    sortBy: 'created_at',
    sortOrder: 'desc'
  })

  useEffect(() => {
    if (user) {
      loadCategories()
      performSearch()
    }
  }, [user])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (user) performSearch()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [filters])

  const loadCategories = async () => {
    const { data } = await supabase
      .from('log_categories')
      .select('id, name, color')
      .eq('is_active', true)
      .order('name')
    
    if (data) setCategories(data)
  }

  const performSearch = async () => {
    setLoading(true)
    
    let query = supabase
      .from('log_entries')
      .select(`
        *,
        category:log_categories(id, name, color)
      `, { count: 'exact' })

    // Apply search term
    if (filters.searchTerm) {
      query = query.or(`title.ilike.%${filters.searchTerm}%,content.ilike.%${filters.searchTerm}%`)
    }

    // Apply date range
    if (filters.dateRange?.from) {
      query = query.gte('entry_date', format(filters.dateRange.from, 'yyyy-MM-dd'))
    }
    if (filters.dateRange?.to) {
      query = query.lte('entry_date', format(filters.dateRange.to, 'yyyy-MM-dd'))
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      query = query.in('category_id', filters.categories)
    }

    // Apply priority filter
    if (filters.priorities.length > 0) {
      query = query.in('priority', filters.priorities)
    }

    // Apply shift time filter
    if (filters.hasShiftTime === true) {
      query = query.not('shift_time', 'is', null)
    } else if (filters.hasShiftTime === false) {
      query = query.is('shift_time', null)
    }

    // Apply sorting
    query = query.order(filters.sortBy, { ascending: filters.sortOrder === 'asc' })

    const { data, error, count } = await query.limit(100)

    if (!error && data) {
      setEntries(data as any)
      setTotalResults(count || 0)
    }

    setLoading(false)
  }

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const toggleCategory = (categoryId: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
    }))
  }

  const togglePriority = (priority: string) => {
    setFilters(prev => ({
      ...prev,
      priorities: prev.priorities.includes(priority)
        ? prev.priorities.filter(p => p !== priority)
        : [...prev.priorities, priority]
    }))
  }

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      categories: [],
      priorities: [],
      hasShiftTime: null,
      sortBy: 'created_at',
      sortOrder: 'desc'
    })
  }

  const exportResults = () => {
    const csvContent = [
      ['Title', 'Category', 'Priority', 'Date', 'Shift Time', 'Content'],
      ...entries.map(entry => [
        entry.title,
        entry.category?.name || '',
        entry.priority,
        entry.entry_date,
        entry.shift_time || '',
        entry.content.replace(/,/g, ';') // Replace commas to avoid CSV issues
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `logbook-search-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

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
    <AppLayout title="Search Logs" subtitle="Advanced search and filtering for log entries">
      <div className="space-y-6">
        {/* Search Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Advanced Search
            </CardTitle>
            <CardDescription>
              Search through {totalResults} log entries with powerful filters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search in titles and content..."
                value={filters.searchTerm}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Date Range */}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <DatePickerWithRange
                  date={filters.dateRange}
                  onDateChange={(dateRange) => updateFilter('dateRange', dateRange)}
                />
              </div>

              {/* Categories Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Tag className="h-4 w-4" />
                    Categories
                    {filters.categories.length > 0 && (
                      <Badge variant="secondary">{filters.categories.length}</Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64">
                  <div className="space-y-2">
                    <h4 className="font-medium">Select Categories</h4>
                    {categories.map(category => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.id}`}
                          checked={filters.categories.includes(category.id)}
                          onCheckedChange={() => toggleCategory(category.id)}
                        />
                        <Label htmlFor={`category-${category.id}`} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Priority Filter */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Priority
                    {filters.priorities.length > 0 && (
                      <Badge variant="secondary">{filters.priorities.length}</Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48">
                  <div className="space-y-2">
                    <h4 className="font-medium">Select Priorities</h4>
                    {['urgent', 'high', 'normal', 'low'].map(priority => (
                      <div key={priority} className="flex items-center space-x-2">
                        <Checkbox
                          id={`priority-${priority}`}
                          checked={filters.priorities.includes(priority)}
                          onCheckedChange={() => togglePriority(priority)}
                        />
                        <Label htmlFor={`priority-${priority}`}>
                          <Badge className={getPriorityColor(priority)}>
                            {priority}
                          </Badge>
                        </Label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>

              {/* Shift Time Filter */}
              <Select value={filters.hasShiftTime?.toString() || 'all'} onValueChange={(value) => updateFilter('hasShiftTime', value === 'all' ? null : value === 'true')}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Shift Time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entries</SelectItem>
                  <SelectItem value="true">With Shift Time</SelectItem>
                  <SelectItem value="false">Without Shift Time</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort Options */}
              <Select value={`${filters.sortBy}-${filters.sortOrder}`} onValueChange={(value) => {
                const [sortBy, sortOrder] = value.split('-')
                updateFilter('sortBy', sortBy)
                updateFilter('sortOrder', sortOrder)
              }}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Newest First</SelectItem>
                  <SelectItem value="created_at-asc">Oldest First</SelectItem>
                  <SelectItem value="entry_date-desc">Entry Date (New)</SelectItem>
                  <SelectItem value="entry_date-asc">Entry Date (Old)</SelectItem>
                  <SelectItem value="priority-desc">High Priority First</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear and Export */}
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
                <Button variant="outline" onClick={exportResults} disabled={entries.length === 0}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Search Results {totalResults > 0 && `(${totalResults})`}
            </h3>
            {loading && <div className="text-sm text-muted-foreground">Searching...</div>}
          </div>

          {entries.length === 0 && !loading ? (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No entries found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or filters
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {entries.map(entry => (
                <Card key={entry.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg">{entry.title}</CardTitle>
                        <CardDescription className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            {entry.category && (
                              <>
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: entry.category.color }}
                                />
                                {entry.category.name}
                              </>
                            )}
                          </span>
                          <span>{format(new Date(entry.entry_date), 'MMM d, yyyy')}</span>
                          {entry.shift_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {entry.shift_time}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(entry.priority)}>
                          {entry.priority}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {entry.content}
                    </p>
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {entry.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
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