import { useState } from 'react';
import { Plus, Search, MoreHorizontal, UserCheck, UserX, Trash2, Users, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { CreateUserModal } from '@/components/CreateUserModal';
import { useToast } from '@/hooks/use-toast';
import ApiService from '@/services/api';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  userType: string;
  dateOfBirth?: string;
  gender?: string;
  imageUrl?: string;
  isActive: boolean;
  subscriptionPlan: string;
  createdAt: string;
}

enum UserType {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
  PARENT = 'PARENT',
  INSTITUTE_ADMIN = 'INSTITUTE_ADMIN',
  SUPERADMIN = 'SUPER_ADMIN'
}

interface UserManagementProps {
  currentUserType: string;
}

const getUserTypeColor = (userType: string) => {
  switch (userType) {
    case 'SUPER_ADMIN':
      return 'bg-admin text-admin-foreground';
    case 'INSTITUTE_ADMIN':
      return 'bg-blue-100 text-blue-800';
    case 'TEACHER':
      return 'bg-green-100 text-green-800';
    case 'STUDENT':
      return 'bg-gray-100 text-gray-800';
    case 'PARENT':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusColor = (isActive: boolean) => {
  return isActive 
    ? 'bg-green-100 text-green-800' 
    : 'bg-red-100 text-red-800';
};

export function UserManagement({ currentUserType }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserType, setSelectedUserType] = useState<string | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [meta, setMeta] = useState<any>(null);
  const { toast } = useToast();

  const canDeleteUsers = currentUserType === 'SUPER_ADMIN';
  const canManageUsers = ['SUPER_ADMIN', 'INSTITUTE_ADMIN'].includes(currentUserType);

  const loadUsers = async (page = 1, limit = pageSize) => {
    setIsLoading(true);
    try {
      const response = await ApiService.getUsers(page, limit, true);
      setUsers(response.data);
      setMeta(response.meta);
      setCurrentPage(page);
    } catch (error) {
      toast({
        title: "Failed to load users",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageSizeChange = (newPageSize: string) => {
    const size = parseInt(newPageSize);
    setPageSize(size);
    setCurrentPage(1);
    loadUsers(1, size);
  };

  const handleUserCreated = () => {
    loadUsers();
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`;
    const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedUserType === 'ALL' || user.userType === selectedUserType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">User Management</h2>
          <p className="text-dashboard-muted">Manage system users and their permissions</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => loadUsers()} variant="outline" disabled={isLoading}>
            {isLoading ? "Loading..." : "Load Users"}
          </Button>
          {canManageUsers && <CreateUserModal onUserCreated={handleUserCreated} />}
        </div>
      </div>

      {/* Filters */}
      <Card className="border-dashboard-border bg-dashboard-card">
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-dashboard-muted" />
                <Input
                  placeholder="Search users by name, email, or institute..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-dashboard-border"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedUserType}
                onChange={(e) => setSelectedUserType(e.target.value as string | 'ALL')}
                className="px-3 py-2 border border-dashboard-border rounded-md bg-background text-foreground"
              >
                <option value="ALL">All User Types</option>
                {Object.values(UserType).map(type => (
                  <option key={type} value={type}>{type.replace('_', ' ')}</option>
                ))}
              </select>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-dashboard-border bg-dashboard-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-dashboard-border">
                  <TableHead>User</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-dashboard-border">
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-dashboard-muted">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs', getUserTypeColor(user.userType))}>
                        {user.userType.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-foreground">
                        {user.phoneNumber || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('text-xs', getStatusColor(user.isActive))}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {user.subscriptionPlan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-dashboard-muted">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {canManageUsers && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem className="text-muted-foreground">
                              <UserCheck className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {canDeleteUsers && (
                              <DropdownMenuItem className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredUsers.length === 0 && users.length > 0 && (
            <div className="text-center py-8">
              <p className="text-dashboard-muted">No users found matching your criteria.</p>
            </div>
          )}
          {users.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-dashboard-muted mb-4">No users loaded yet.</p>
              <Button onClick={() => loadUsers()} disabled={isLoading}>
                Load Users
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Info & Controls */}
      {meta && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, meta.total)} of {meta.total} users
          </div>
          
          {meta.totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => meta.hasPreviousPage && loadUsers(currentPage - 1, pageSize)}
                    className={!meta.hasPreviousPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(meta.totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (meta.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= meta.totalPages - 2) {
                    pageNum = meta.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => loadUsers(pageNum, pageSize)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => meta.hasNextPage && loadUsers(currentPage + 1, pageSize)}
                    className={!meta.hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}