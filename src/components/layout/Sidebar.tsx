import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import {
  Users,
  Building2,
  BookOpen,
  Bus,
  CreditCard,
  MessageSquare,
  Receipt,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/dashboard/users", icon: Users, label: "Users" },
  { to: "/dashboard/institute", icon: Building2, label: "Institute" },
  { to: "/dashboard/subjects", icon: BookOpen, label: "Subjects" },
  { to: "/dashboard/transport", icon: Bus, label: "Transport" },
  { to: "/dashboard/system-payment", icon: CreditCard, label: "System Payment" },
  { to: "/dashboard/sms", icon: MessageSquare, label: "SMS" },
  { to: "/dashboard/sms-payment", icon: Receipt, label: "SMS Payment" },
  { to: "/dashboard/advertisement", icon: Megaphone, label: "Advertisement" },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { state, setOpenMobile, isMobile } = useSidebar();
  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Check if SMS Payment is active to show indicator on SMS
  const isSMSPaymentActive = location.pathname === "/dashboard/sms-payment";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      {/* Header */}
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sidebar-primary rounded-xl flex items-center justify-center shadow-glow-sidebar shrink-0">
              <LayoutDashboard className="w-6 h-6 text-sidebar-primary-foreground" />
            </div>
            {!isCollapsed && (
              <div className="animate-fade-in">
                <h1 className="font-bold text-lg text-sidebar-foreground">Admin Panel</h1>
                <p className="text-sm text-sidebar-foreground/60">Management System</p>
              </div>
            )}
          </div>
          {/* Close button for mobile/tablet */}
          {isMobile && (
            <button
              onClick={() => setOpenMobile(false)}
              className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
            >
              <X className="w-5 h-5 text-sidebar-foreground" />
            </button>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = isActive(item.to);
                // Show dot indicator on SMS when SMS Payment is active
                const showDot = item.to === "/dashboard/sms" && isSMSPaymentActive;

                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className={cn(
                        "relative transition-all duration-200 h-12 text-base",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow-sidebar"
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      )}
                    >
                      <NavLink to={item.to} onClick={() => isMobile && setOpenMobile(false)}>
                        <div className="relative">
                          <item.icon className="w-6 h-6" />
                          {showDot && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-sidebar-primary rounded-full animate-pulse" />
                          )}
                        </div>
                        <span className="font-medium text-base">{item.label}</span>
                        {active && !isCollapsed && (
                          <span className="absolute right-3 w-2 h-2 bg-sidebar-primary-foreground rounded-full" />
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sidebar-muted mb-3 animate-fade-in">
            <div className="w-11 h-11 rounded-full bg-sidebar-primary flex items-center justify-center shrink-0">
              <span className="text-base font-semibold text-sidebar-primary-foreground">
                {user?.firstName?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-medium text-sidebar-foreground truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-sidebar-foreground/60 truncate">{user?.email}</p>
            </div>
          </div>
        )}
        
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              tooltip="Sign Out"
              className="h-12 text-base text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
            >
              <LogOut className="w-6 h-6" />
              <span className="font-medium">Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function MobileHeader() {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b border-border flex items-center px-4 gap-3">
      <SidebarTrigger className="text-foreground">
        <Menu className="w-5 h-5" />
      </SidebarTrigger>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
          <LayoutDashboard className="w-4 h-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-foreground">Admin Panel</span>
      </div>
    </header>
  );
}
