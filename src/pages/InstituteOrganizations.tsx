import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Building2, RefreshCw, Plus, UserPlus, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTableData } from '@/hooks/useTableData';
import MUITable from '@/components/ui/mui-table';
import CreateOrganizationForm from '@/components/forms/CreateOrganizationForm';
import AddOrganizationUserDialog from '@/components/forms/AddOrganizationUserDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

interface OrganizationMember {
  userId: string;
  studentIdByInstitute: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phoneNumber: string;
  imageUrl: string;
  role: string;
  status: string;
  enrolledDate: string;
}

const InstituteOrganizations = () => {
  const { selectedInstitute } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [addUserDialog, setAddUserDialog] = useState<{ open: boolean; orgId: string; orgName: string }>({
    open: false,
    orgId: '',
    orgName: '',
  });

  const [viewMembersDialog, setViewMembersDialog] = useState<{ 
    open: boolean; 
    orgId: string; 
    orgName: string;
  }>({
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

  const membersData = useTableData<OrganizationMember>({
    endpoint: viewMembersDialog.orgId && selectedInstitute 
      ? `/organizations/institute/${selectedInstitute.id}/organization/${viewMembersDialog.orgId}/students`
      : '',
    autoLoad: false,
    pagination: {
      defaultLimit: 10,
      availableLimits: [10, 25, 50]
    }
  });

  const memberColumns = [
    {
      id: 'imageUrl',
      label: 'Photo',
      minWidth: 80,
      format: (_value: any, row: any) => (
        <Avatar className="h-10 w-10">
          <AvatarImage src={row.imageUrl} alt={row.name} />
          <AvatarFallback>{row.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
      )
    },
    {
      id: 'userIdByInstitute',
      label: 'User ID',
      minWidth: 120,
    },
    {
      id: 'name',
      label: 'Name',
      minWidth: 180,
    },
    {
      id: 'email',
      label: 'Email',
      minWidth: 200,
    },
    {
      id: 'phoneNumber',
      label: 'Phone',
      minWidth: 140,
    },
    {
      id: 'instituteUserType',
      label: 'User Type',
      minWidth: 120,
      format: (_value: any, row: any) => (
        <Badge variant="outline">
          {row.instituteUserType}
        </Badge>
      )
    },
    {
      id: 'organizationRole',
      label: 'Org Role',
      minWidth: 100,
      format: (_value: any, row: any) => (
        <Badge variant={row.organizationRole === 'ADMIN' ? 'default' : 'secondary'}>
          {row.organizationRole}
        </Badge>
      )
    },
    {
      id: 'verificationStatus',
      label: 'Status',
      minWidth: 100,
      format: (_value: any, row: any) => (
        <Badge variant={row.verificationStatus === 'verified' ? 'default' : 'outline'}>
          {row.verificationStatus}
        </Badge>
      )
    }
  ];

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
      minWidth: 200,
      align: 'center' as const,
      format: (_value: any, row: any) => (
        <div className="flex gap-2 justify-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setViewMembersDialog({ open: true, orgId: row.organizationId, orgName: row.name });
              setTimeout(() => membersData.actions.loadData(true), 100);
            }}
            className="gap-1"
          >
            <Eye className="h-4 w-4" />
            View Members
          </Button>
          <Button
            size="sm"
            onClick={() => setAddUserDialog({ open: true, orgId: row.organizationId, orgName: row.name })}
            className="gap-1"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>
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

      <Dialog open={viewMembersDialog.open} onOpenChange={(open) => setViewMembersDialog({ ...viewMembersDialog, open })}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Members - {viewMembersDialog.orgName}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <Card className="h-full flex flex-col border-0 shadow-none">
              <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                {membersData.state.loading && !membersData.state.data.length ? (
                  <div className="flex items-center justify-center p-8">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : membersData.state.error ? (
                  <div className="p-4 text-destructive">{membersData.state.error}</div>
                ) : (
                  <MUITable
                    title=""
                    columns={memberColumns}
                    data={membersData.state.data}
                    page={membersData.pagination.page}
                    rowsPerPage={membersData.pagination.limit}
                    totalCount={membersData.pagination.totalCount}
                    onPageChange={membersData.actions.setPage}
                    onRowsPerPageChange={membersData.actions.setLimit}
                    rowsPerPageOptions={membersData.availableLimits}
                    allowAdd={false}
                    allowEdit={false}
                    allowDelete={false}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

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
