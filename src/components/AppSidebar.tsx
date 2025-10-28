import React, { useState } from "react"
import { motion } from "framer-motion"
import { getSpringConfig } from "@/lib/3d-utils"
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
  GitBranch,
  UserCheck,
  Target,
  TrendingUp,
  Activity,
  Timer,
  Award,
  MessageSquare,
  Search,
  Coins,
  Bell,
  Megaphone,
  CalendarRange,
  CalendarClock,
  Ban
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

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
    title: "Communication",
    icon: MessageSquare,
    items: [
      { title: "Messages", url: "/communication/messages", icon: MessageSquare },
      { title: "Announcements", url: "/communication/announcements", icon: Megaphone },
      { title: "Notifications", url: "/communication/notifications", icon: Bell },
    ]
  },
  {
    title: "Schedule",
    icon: Calendar,
    items: [
      { title: "Schedules", url: "/schedule", icon: CalendarDays },
      { 
        title: "Time Off", 
        url: "/schedule/time-off", 
        icon: CalendarX,
        items: [
          { title: "Overview", url: "/schedule/time-off", icon: CalendarRange },
          { title: "Requests", url: "/schedule/time-off/requests", icon: CalendarClock },
          { title: "Calendar", url: "/schedule/time-off/calendar", icon: CalendarDays },
          { title: "Blocked Days", url: "/schedule/time-off/blocked-days", icon: Ban },
        ]
      },
      { title: "Availability", url: "/schedule/availability", icon: Clock },
      { title: "Shift Pool", url: "/schedule/shift-pool", icon: GitBranch },
    ]
  },
  {
    title: "Team",
    icon: Users,
    items: [
      { title: "Employees", url: "/team", icon: Users },
      { title: "Engage", url: "/team/engage", icon: Target },
    ]
  },
  {
    title: "Hiring",
    icon: UserPlus,
    items: [
      { title: "Job Postings", url: "/hiring", icon: UserPlus },
    ]
  },
  {
    title: "Tasks",
    icon: CheckSquare,
    items: [
      { title: "Overview", url: "/tasks", icon: CheckSquare },
      { title: "Task Templates", url: "/tasks/templates", icon: BookOpen },
      { title: "Settings", url: "/tasks/settings", icon: Shield },
    ]
  },
  {
    title: "Log Book",
    icon: BookOpen,
    items: [
      { title: "View Logs", url: "/log-book", icon: BookOpen },
      { title: "Categories", url: "/log-book/categories", icon: Search },
      { title: "Search", url: "/log-book/search", icon: Search },
    ]
  },
  { title: "Time Clocking", url: "/time-clocking", icon: Clock },
  {
    title: "Tip Management",
    icon: DollarSign,
    items: [
      { title: "Tip Pooling", url: "/tip-management", icon: DollarSign },
      { title: "Settings", url: "/tip-management/settings", icon: Shield },
    ]
  },
  { title: "Payroll", url: "/payroll", icon: DollarSign },
  {
    title: "Reports",
    icon: BarChart3,
    items: [
      { title: "Overview", url: "/reports", icon: TrendingUp },
      { title: "Performance", url: "/reports/performance", icon: Activity },
      { title: "Employee Insights", url: "/reports/employee-insights", icon: Users },
      { title: "Hours & Wages", url: "/reports/hours-wages", icon: Clock },
      { title: "Scheduling", url: "/reports/scheduling", icon: Calendar },
      { title: "Time Tracking", url: "/reports/time-tracking", icon: Timer },
      { title: "Time Off", url: "/reports/time-off", icon: CalendarX },
      { title: "Attendance", url: "/reports/attendance", icon: UserCheck },
      { title: "Certifications", url: "/reports/certifications", icon: Award },
      { title: "Feedback", url: "/reports/feedback", icon: MessageSquare },
      { title: "Tip Analytics", url: "/reports/tip-analytics", icon: Coins },
      { title: "Labor Compliance", url: "/reports/labor-compliance", icon: Shield },
      { title: "Audit Trail", url: "/reports/audit-trail", icon: Search },
      { title: "Task Reports", url: "/reports/tasks", icon: CheckSquare },
    ]
  },
  {
    title: "Settings", 
    icon: Shield,
    items: [
      { title: "My Account", url: "/settings/account", icon: UserCheck },
      { title: "Company Settings", url: "/settings/company", icon: Shield },
      { title: "Plans", url: "/settings/plans", icon: Award },
      { title: "Add-ons", url: "/settings/add-ons", icon: GitBranch },
      { title: "Locations & Roles", url: "/settings/locations-roles", icon: Users },
      { title: "Developer Tools", url: "/settings/developer", icon: Search },
    ]
  },
  {
    title: "Apps & Integrations", 
    icon: GitBranch,
    items: [
      { title: "Explore", url: "/integrations", icon: Search },
      { title: "My Integrations", url: "/integrations/my-integrations", icon: GitBranch },
      { title: "Settings", url: "/integrations/settings", icon: Shield },
    ]
  },
  { title: "Quick Start", url: "/quick-start", icon: HelpCircle, badge: "GUIDE" },
  { title: "Help", url: "/help", icon: HelpCircle },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  // Determine which group should be open based on current path
  const getActiveGroup = (path: string) => {
    for (const item of navigationItems) {
      if (item.items) {
        const hasActiveSubItem = item.items.some(subItem => {
          if (subItem.items) {
            return subItem.items.some(nestedItem => path === nestedItem.url)
          }
          return path === subItem.url
        })
        if (hasActiveSubItem) {
          return item.title
        }
      } else if (path === item.url) {
        return null // Top level items don't need groups to be open
      }
    }
    return null
  }

  const activeGroup = getActiveGroup(currentPath)
  const [openGroups, setOpenGroups] = useState<string[]>(activeGroup ? [activeGroup] : [])

  // Update open groups when route changes
  React.useEffect(() => {
    const newActiveGroup = getActiveGroup(currentPath)
    setOpenGroups(newActiveGroup ? [newActiveGroup] : [])
  }, [currentPath])

  const isActive = (path: string) => currentPath === path
  
  const isGroupActive = (items: any[]) => {
    return items?.some(item => {
      if (item.items) {
        return item.items.some((nestedItem: any) => isActive(nestedItem.url))
      }
      return isActive(item.url)
    })
  }
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-black font-bold" : "hover:bg-sidebar-accent/50"

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => 
      prev.includes(title) 
        ? prev.filter(group => group !== title)
        : [...prev, title]
    )
  }

  const renderSubItems = (items: any[]) => {
    return items.map((subItem) => {
      if (subItem.items) {
        // Handle nested sub-items (like Time Off)
        return (
          <div key={subItem.title}>
            <SidebarMenuSubItem>
              <SidebarMenuSubButton asChild>
                <div className={`flex items-center gap-2 px-3 py-2 text-sm font-medium ${
                  isGroupActive(subItem.items) ? "text-sidebar-accent-foreground" : ""
                }`}>
                  <subItem.icon className="h-4 w-4" />
                  <span>{subItem.title}</span>
                </div>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
            {subItem.items.map((nestedItem: any) => (
              <SidebarMenuSubItem key={nestedItem.title} className="ml-4">
                <SidebarMenuSubButton asChild>
                  <NavLink 
                    to={nestedItem.url} 
                    className={getNavCls}
                  >
                    <nestedItem.icon className="h-4 w-4" />
                    <span>{nestedItem.title}</span>
                  </NavLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </div>
        )
      } else {
        return (
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
        )
      }
    })
  }

  const springConfig = getSpringConfig();

  return (
    <motion.div
      initial={{ rotateY: -10, opacity: 0 }}
      animate={{ rotateY: 0, opacity: 1 }}
      transition={springConfig}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <Sidebar 
        className={cn(
          collapsed ? "w-14" : "w-64",
          "backdrop-blur-[12px] bg-white/[0.08] dark:bg-white/[0.08] border-r border-white/[0.16]"
        )}
        collapsible="icon"
      >
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
                              ? "bg-sidebar-accent text-black font-bold" 
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
                            {renderSubItems(item.items)}
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
    </motion.div>
  )
}