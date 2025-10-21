import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminSidebar } from '@/components/AdminSidebar';
import { StatsCards } from '@/components/StatsCards';
import { UserManagement } from '@/components/UserManagement';
import { InstituteManagement } from '@/pages/InstituteManagement';
import { SubjectManagement } from '@/pages/SubjectManagement';
import SubjectLecturesManagement from '@/pages/SubjectLecturesManagement';
import TransportManagement from '@/pages/TransportManagement';
import { AssignRfidManagement } from '@/pages/AssignRfidManagement';
import { PaymentManagement } from '@/pages/PaymentManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ApiService from '@/services/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [adminUser, setAdminUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = ApiService.getCurrentUser();
    if (!user || !ApiService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    setAdminUser(user);
  }, [navigate]);

  const handleLogout = () => {
    ApiService.logout();
    navigate('/login');
  };

  if (!adminUser) {
    return <div>Loading...</div>;
  }

  const mockStats = {
    totalUsers: 1250,
    activeUsers: 1180,
    inactiveUsers: 70,
    pendingUsers: 25,
    usersByType: {
      STUDENT: 850,
      TEACHER: 200,
      INSTITUTE_ADMIN: 180,
      SUPER_ADMIN: 20
    },
    recentRegistrations: 45
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">System Dashboard</h1>
              <p className="text-muted-foreground mt-2">
                Welcome back, {adminUser.firstName} {adminUser.lastName}. Here's your system overview.
              </p>
            </div>
            <StatsCards stats={mockStats} />
            
            {/* User Type Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">User Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(mockStats.usersByType).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="text-muted-foreground">{type.replace('_', ' ')}</span>
                        <span className="font-medium text-foreground">{count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-lg">System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Active Rate</span>
                      <span className="font-medium text-emerald-600">
                        {((mockStats.activeUsers / mockStats.totalUsers) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">System Load</span>
                      <span className="font-medium text-emerald-600">Normal</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">API Status</span>
                      <span className="font-medium text-emerald-600">Operational</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
        
      case 'users':
        return <UserManagement currentUserType={adminUser.userType} />;
        
      case 'institutes':
        return <InstituteManagement />;
        
      case 'subjects':
        return <SubjectManagement />;
        
      case 'lectures':
        return <SubjectLecturesManagement />;
        
      case 'transport':
        return <TransportManagement />;
        
      case 'assign-rfid':
        return <AssignRfidManagement />;
        
      case 'classes':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Class Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Class management features coming soon...</p>
            </CardContent>
          </Card>
        );
        
      case 'payments':
        return <PaymentManagement />;
        
      case 'settings':
        return (
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">System settings interface coming soon...</p>
            </CardContent>
          </Card>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        adminUser={{
          name: `${adminUser.firstName} ${adminUser.lastName}`,
          email: adminUser.email,
          userType: adminUser.userType
        }}
      />
      
      <main className="md:pl-64">
        <div className="p-4 md:p-8 pt-16 md:pt-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
