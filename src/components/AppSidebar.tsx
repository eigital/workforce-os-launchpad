import { useState } from "react"
import { 
  Calendar, 
  Users, 
  UserPlus, 
  CheckSquare, 
  BookOpen, 
  Clock, 
  DollarSign, 
  BarChart3, 
  HelpCircle,
  Home,
  CalendarDays,
  CalendarX,
  Shield,
  GitBranch
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const navigationItems = [
  { title: "Dashboard", url: "/dashboard", icon: Home },
  {
    title: "Schedule",
    icon: Calendar,
    items: [
      { title: "Schedules", url: "/schedule", icon: CalendarDays },
      { title: "Time Off", url: "/schedule/time-off", icon: CalendarX },
      { title: "Availability", url: "/schedule/availability", icon: Clock },
      { title: "Shift Pool", url: "/schedule/shift-pool", icon: GitBranch },
    ]
  },
  { title: "Team", url: "/team", icon: Users },
  { title: "Hiring", url: "/hiring", icon: UserPlus },
  { title: "Tasks", url: "/tasks", icon: CheckSquare },
  { title: "Log Book", url: "/log-book", icon: BookOpen },
  { title: "Time Clocking", url: "/time-clocking", icon: Clock },
  { title: "Tip Management", url: "/tip-management", icon: DollarSign },
  { title: "Payroll", url: "/payroll", icon: DollarSign },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Quick Start", url: "/quick-start", icon: HelpCircle, badge: "GUIDE" },
  { title: "Help", url: "/help", icon: HelpCircle },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const [openGroups, setOpenGroups] = useState<string[]>(["Schedule"])
  const collapsed = state === "collapsed"

  const isActive = (path: string) => currentPath === path
  const isGroupActive = (items: any[]) => items?.some(item => isActive(item.url))
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : "hover:bg-sidebar-accent/50"

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => 
      prev.includes(title) 
        ? prev.filter(group => group !== title)
        : [...prev, title]
    )
  }

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-sidebar-foreground/70 uppercase tracking-wider px-3">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible
                      open={openGroups.includes(item.title)}
                      onOpenChange={() => toggleGroup(item.title)}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={`w-full justify-between ${
                            isGroupActive(item.items) 
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" 
                              : "hover:bg-sidebar-accent/50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <item.icon className="h-4 w-4" />
                            {!collapsed && <span>{item.title}</span>}
                          </div>
                          {!collapsed && (
                            <div className={`transition-transform ${
                              openGroups.includes(item.title) ? "rotate-90" : ""
                            }`}>
                              ▶
                            </div>
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      {!collapsed && (
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton asChild>
                                  <NavLink 
                                    to={subItem.url} 
                                    className={getNavCls}
                                  >
                                    <subItem.icon className="h-4 w-4" />
                                    <span>{subItem.title}</span>
                                  </NavLink>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      )}
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && (
                          <div className="flex items-center gap-2">
                            <span>{item.title}</span>
                            {item.badge && (
                              <span className="text-xs bg-orange-500 text-white px-1.5 py-0.5 rounded">
                                {item.badge}
                              </span>
                            )}
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}