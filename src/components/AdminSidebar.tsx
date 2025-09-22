import { useState } from 'react';
import { 
  Users, 
  Building2, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut,
  Shield,
  Menu,
  X,
  BookOpen,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  adminUser: {
    name: string;
    email: string;
    userType: string;
  };
}

const navigation = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'institutes', label: 'Institutes', icon: Building2 },
  { id: 'subjects', label: 'Subjects', icon: Settings },
  { id: 'lectures', label: 'Subject Lectures', icon: BookOpen },
  { id: 'transport', label: 'Transport', icon: Truck },
  { id: 'assign-rfid', label: 'Assign Rfid', icon: Shield },
  { id: 'classes', label: 'Classes', icon: Settings },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar({ activeTab, onTabChange, onLogout, adminUser }: AdminSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-dashboard-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-admin rounded-lg flex items-center justify-center">
            <Shield className="h-6 w-6 text-admin-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">LAAS Admin</h2>
            <p className="text-sm text-dashboard-muted">System Hub</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? 'default' : 'ghost'}
              className={cn(
                'w-full justify-start gap-3 h-11',
                activeTab === item.id 
                  ? 'bg-admin text-admin-foreground shadow-sm' 
                  : 'text-dashboard-muted hover:text-foreground hover:bg-admin-accent'
              )}
              onClick={() => {
                onTabChange(item.id);
                setIsMobileOpen(false);
              }}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-dashboard-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-admin-accent rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-admin">
              {adminUser.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {adminUser.name}
            </p>
            <p className="text-xs text-dashboard-muted truncate">
              {adminUser.userType.replace('_', ' ')}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-2 text-dashboard-muted border-dashboard-border"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-dashboard-card border-r border-dashboard-border">
        {sidebarContent}
      </div>

      {/* Mobile sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-dashboard-card border-r border-dashboard-border">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}