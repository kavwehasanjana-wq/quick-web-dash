import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader, ActionButton } from "@/components/shared/PageComponents";
import { Users, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useMemo } from "react";
import { api } from "@/lib/api";
import { DataTable, Column, PaginationMeta } from "@/components/shared/DataTable";
import { ViewDetailsDialog } from "@/components/shared/ViewDetailsDialog";
import { AssignRfidDialog } from "@/components/forms/AssignRfidDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  userType: string;
  dateOfBirth: string;
  gender: string;
  isActive: boolean;
  createdAt: string;
  imageUrl: string | null;
  subscriptionPlan: string;
  telegramId: string | null;
  rfid: string | null;
  language: string;
}

export default function UsersPage() {
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [rfidDialogOpen, setRfidDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [page, limit]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.getUsers(page, limit);
      setAllUsers(response.data || []);
      if (response.meta) {
        setPagination({
          page: response.meta.page,
          limit: response.meta.limit,
          total: response.meta.total,
          totalPages: response.meta.totalPages,
          hasNextPage: response.meta.hasNextPage,
          hasPreviousPage: response.meta.hasPreviousPage,
        });
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Frontend filtering by isActive
  const activeUsers = useMemo(() => allUsers.filter(u => u.isActive === true), [allUsers]);
  const inactiveUsers = useMemo(() => allUsers.filter(u => u.isActive === false), [allUsers]);

  const handleCreateUser = () => {
    toast({
      title: "Create User",
      description: "User creation form would open here.",
    });
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  const handleAssignRfid = (user: User) => {
    setSelectedUser(user);
    setRfidDialogOpen(true);
  };

  const columns: Column[] = [
    { key: "imageUrl", label: "Image", type: "image" },
    { key: "id", label: "ID" },
    { key: "firstName", label: "Name", render: (_, row) => `${row.firstName} ${row.lastName}` },
    { key: "userType", label: "User Type", type: "badge" },
    { key: "subscriptionPlan", label: "Plan", type: "badge" },
    { key: "rfid", label: "RFID" },
    {
      key: "assignRfid",
      label: "Assign RFID",
      render: (_, row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            handleAssignRfid(row as User);
          }}
        >
          <CreditCard className="w-4 h-4 mr-1" />
          RFID
        </Button>
      ),
    },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Users"
        description="Manage all users in the system"
        icon={Users}
        actions={<ActionButton label="Create User" onClick={handleCreateUser} />}
      />
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active">Active ({activeUsers.length})</TabsTrigger>
          <TabsTrigger value="inactive">Inactive ({inactiveUsers.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <DataTable
            columns={columns}
            data={activeUsers}
            isLoading={isLoading}
            onView={handleView}
            pagination={pagination || undefined}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </TabsContent>
        
        <TabsContent value="inactive">
          <DataTable
            columns={columns}
            data={inactiveUsers}
            isLoading={isLoading}
            onView={handleView}
            pagination={pagination || undefined}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </TabsContent>
      </Tabs>

      <ViewDetailsDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        data={selectedUser}
        title={selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : "User Details"}
      />

      {selectedUser && (
        <AssignRfidDialog
          open={rfidDialogOpen}
          onOpenChange={setRfidDialogOpen}
          onSuccess={fetchUsers}
          userId={selectedUser.id}
          userName={`${selectedUser.firstName} ${selectedUser.lastName}`}
          currentRfid={selectedUser.rfid}
        />
      )}
    </DashboardLayout>
  );
}