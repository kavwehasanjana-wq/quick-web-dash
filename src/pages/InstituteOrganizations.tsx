import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, RefreshCw, Plus, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTableData } from '@/hooks/useTableData';
import MUITable from '@/components/ui/mui-table';
import CreateOrganizationForm from '@/components/forms/CreateOrganizationForm';
import AddOrganizationUserDialog from '@/components/forms/AddOrganizationUserDialog';

interface Organization {
  organizationId: string;
  name: string;
  type: string;
  isPublic: boolean;
  imageUrl: string;
  instituteId: string;
  memberCount: number;
  causeCount: number;
  createdAt: string;
  institute: {
    instituteId: string;
    name: string;
    imageUrl: string;
  };
}

const InstituteOrganizations = () => {
  const { selectedInstitute } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [addUserDialog, setAddUserDialog] = useState<{ open: boolean; orgId: string; orgName: string }>({
    open: false,
    orgId: '',
    orgName: '',
  });

  const { state, actions, pagination, availableLimits } = useTableData<Organization>({
    endpoint: `/organizations/institute/${selectedInstitute?.id}`,
    autoLoad: false,
    pagination: {
      defaultLimit: 10,
      availableLimits: [10, 25, 50]
    }
  });

  const columns = [
    {
      id: 'imageUrl',
      label: 'Image',
      minWidth: 100,
      format: (_value: any, row: any) => (
        <div className="flex items-center justify-center">
          {row.imageUrl ? (
            <img 
              src={row.imageUrl} 
              alt={row.name}
              className="w-10 h-10 rounded-md object-cover"
            />
          ) : (
            <Building2 className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
      )
    },
    {
      id: 'organizationId',
      label: 'Organization ID',
      minWidth: 120,
    },
    {
      id: 'name',
      label: 'Organization Name',
      minWidth: 200,
    },
    {
      id: 'type',
      label: 'Type',
      minWidth: 120,
      format: (_value: any, row: any) => (
        <Badge variant="outline">{row.type}</Badge>
      )
    },
    {
      id: 'isPublic',
      label: 'Visibility',
      minWidth: 120,
      format: (_value: any, row: any) => (
        <Badge variant={row.isPublic ? 'default' : 'secondary'}>
          {row.isPublic ? 'Public' : 'Private'}
        </Badge>
      )
    },
    {
      id: 'instituteId',
      label: 'Institute ID',
      minWidth: 120,
    },
    {
      id: 'memberCount',
      label: 'Members',
      minWidth: 100,
      align: 'center' as const,
    },
    {
      id: 'causeCount',
      label: 'Causes',
      minWidth: 100,
      align: 'center' as const,
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 120,
      align: 'center' as const,
      format: (_value: any, row: any) => (
        <Button
          size="sm"
          onClick={() => setAddUserDialog({ open: true, orgId: row.organizationId, orgName: row.name })}
          className="gap-1"
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      )
    },
  ];

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    actions.loadData(true); // Refresh the list
  };

  if (!selectedInstitute) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Institute Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Please select an institute first.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Institute Organizations</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Organizations for {selectedInstitute.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="gap-2 text-sm"
            size="sm"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Org</span>
            <span className="sm:hidden">Create</span>
          </Button>
          <Button 
            onClick={() => actions.loadData(true)}
            disabled={state.loading}
            className="gap-2 text-sm"
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 ${state.loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{state.loading ? 'Loading...' : 'Load Organizations'}</span>
            <span className="sm:hidden">{state.loading ? 'Loading' : 'Load'}</span>
          </Button>
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl mx-4">
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
          </DialogHeader>
          <CreateOrganizationForm
            instituteId={selectedInstitute.id}
            instituteName={selectedInstitute.name}
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <AddOrganizationUserDialog
        open={addUserDialog.open}
        onOpenChange={(open) => setAddUserDialog({ ...addUserDialog, open })}
        organizationId={addUserDialog.orgId}
        organizationName={addUserDialog.orgName}
        onSuccess={() => actions.loadData(true)}
      />

      {state.error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">{state.error}</p>
          </CardContent>
        </Card>
      )}

      <Card className="flex-1 flex flex-col">
        <CardContent className="p-0 flex-1 flex flex-col">
          <MUITable
            title=""
            columns={columns}
            data={state.data}
            page={pagination.page}
            rowsPerPage={pagination.limit}
            totalCount={pagination.totalCount}
            onPageChange={actions.setPage}
            onRowsPerPageChange={actions.setLimit}
            rowsPerPageOptions={availableLimits}
            allowAdd={false}
            allowEdit={false}
            allowDelete={false}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default InstituteOrganizations;
