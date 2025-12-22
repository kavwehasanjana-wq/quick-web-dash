import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar, MobileHeader } from "@/components/layout/Sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset>
          {/* Desktop header with trigger */}
          <header className="hidden md:flex h-14 items-center gap-4 border-b border-border px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <SidebarTrigger className="text-muted-foreground hover:text-foreground transition-colors">
              <Menu className="w-5 h-5" />
            </SidebarTrigger>
            <div className="flex-1" />
          </header>
          
          {/* Mobile header */}
          <MobileHeader />
          
          {/* Main content */}
          <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 animate-fade-in">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
