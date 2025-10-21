import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Plus } from 'lucide-react';
import { AssignRfidModal } from '@/components/AssignRfidModal';
import { toast } from 'sonner';

export function AssignRfidManagement() {
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const handleAssignSuccess = () => {
    toast.success('RFID assigned successfully');
    setIsAssignModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assign RFID</h1>
          <p className="text-dashboard-muted">Manage RFID assignments for users</p>
        </div>
        <Button 
          onClick={() => setIsAssignModalOpen(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Assign RFID
        </Button>
      </div>

      <Card className="border-dashboard-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-admin/10 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-admin" />
            </div>
            <div>
              <CardTitle className="text-xl">RFID Management</CardTitle>
              <CardDescription>
                Assign RFID tags to users for access control
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Shield className="h-12 w-12 text-dashboard-muted mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Ready to Assign RFID</h3>
            <p className="text-dashboard-muted mb-4">
              Click the "Assign RFID" button to start assigning RFID tags to users
            </p>
            <Button 
              onClick={() => setIsAssignModalOpen(true)}
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Assign RFID
            </Button>
          </div>
        </CardContent>
      </Card>

      <AssignRfidModal 
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={handleAssignSuccess}
      />
    </div>
  );
}