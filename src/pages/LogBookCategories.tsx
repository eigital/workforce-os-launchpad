import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Save, X, GripVertical } from 'lucide-react'
import AppLayout from '@/components/layouts/AppLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

interface LogCategory {
  id: string
  name: string
  description: string
  color: string
  icon: string
  sort_order: number
  is_active: boolean
  is_required: boolean
  template_fields: any
  created_at: string
}

export default function LogBookCategories() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<LogCategory[]>([])
  const [isNewCategoryOpen, setIsNewCategoryOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#6B7280',
    icon: 'FileText',
    is_required: false
  })

  useEffect(() => {
    if (user) {
      loadCategories()
    }
  }, [user])

  const loadCategories = async () => {
    const { data } = await supabase
      .from('log_categories')
      .select('*')
      .order('sort_order')
    
    if (data) setCategories(data)
  }

  const handleCreateCategory = async () => {
    if (!user || !newCategory.name) return

    // Get user's company_id
    const { data: userCompanies } = await supabase
      .from('user_companies')
      .select('company_id')
      .eq('user_id', user.id)
      .single()

    if (!userCompanies) return

    const { error } = await supabase
      .from('log_categories')
      .insert({
        ...newCategory,
        company_id: userCompanies.company_id,
        created_by: user.id,
        sort_order: categories.length
      })

    if (!error) {
      setIsNewCategoryOpen(false)
      setNewCategory({
        name: '',
        description: '',
        color: '#6B7280',
        icon: 'FileText',
        is_required: false
      })
      loadCategories()
    }
  }

  const handleUpdateCategory = async (id: string, updates: Partial<LogCategory>) => {
    const { error } = await supabase
      .from('log_categories')
      .update(updates)
      .eq('id', id)

    if (!error) {
      loadCategories()
    }
  }

  const handleDeleteCategory = async (id: string) => {
    // Check if category has any log entries
    const { count } = await supabase
      .from('log_entries')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)

    if (count && count > 0) {
      alert('Cannot delete category with existing log entries. Please move or delete the entries first.')
      return
    }

    const { error } = await supabase
      .from('log_categories')
      .delete()
      .eq('id', id)

    if (!error) {
      loadCategories()
    }
  }

  const availableColors = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
    '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
    '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
    '#EC4899', '#F43F5E', '#6B7280', '#374151', '#1F2937'
  ]

  const iconOptions = [
    'FileText', 'DollarSign', 'MessageSquare', 'Users', 'Wrench',
    'Package', 'Shield', 'Star', 'Clock', 'Target',
    'Award', 'TrendingUp', 'BarChart3', 'PieChart', 'Activity'
  ]

  return (
    <AppLayout title="Log Categories" subtitle="Manage and organize your log book categories">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Categories</h2>
            <p className="text-muted-foreground">Organize your log entries with custom categories</p>
          </div>
          
          <Dialog open={isNewCategoryOpen} onOpenChange={setIsNewCategoryOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Category</DialogTitle>
                <DialogDescription>
                  Add a new category to organize your log entries
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Daily Sales"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of this category"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          newCategory.color === color ? 'border-primary' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setNewCategory(prev => ({ ...prev, color }))}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Icon</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {iconOptions.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        className={`p-2 rounded border ${
                          newCategory.icon === icon ? 'border-primary bg-primary/10' : 'border-border'
                        }`}
                        onClick={() => setNewCategory(prev => ({ ...prev, icon }))}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="required"
                    checked={newCategory.is_required}
                    onCheckedChange={(checked) => setNewCategory(prev => ({ ...prev, is_required: checked }))}
                  />
                  <Label htmlFor="required">Required category</Label>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateCategory} disabled={!newCategory.name}>
                    Create Category
                  </Button>
                  <Button variant="outline" onClick={() => setIsNewCategoryOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Plus className="h-16 w-16 mx-auto mb-4 opacity-50" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No categories yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first category to start organizing log entries
              </p>
              <Button onClick={() => setIsNewCategoryOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Category
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {categories.map(category => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        {category.description && (
                          <CardDescription>{category.description}</CardDescription>
                        )}
                      </div>
                      {category.is_required && (
                        <Badge variant="secondary">Required</Badge>
                      )}
                      {!category.is_active && (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateCategory(category.id, { is_active: !category.is_active })}
                      >
                        {category.is_active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingCategory(category.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Icon: {category.icon}</span>
                    <span>Order: {category.sort_order}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}