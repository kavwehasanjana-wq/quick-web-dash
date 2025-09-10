
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, RefreshCw, GraduationCap, Users, UserCheck, Plus, UserPlus, UserCog } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { instituteApi } from '@/api/institute.api';
import { studentsApi } from '@/api/students.api';
import { useApiRequest } from '@/hooks/useApiRequest';
import CreateUserForm from '@/components/forms/CreateUserForm';
import AssignUserForm from '@/components/forms/AssignUserForm';
import AssignParentForm from '@/components/forms/AssignParentForm';

interface InstituteUserData {
  id: string;
  name: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  phoneNumber?: string;
  imageUrl?: string;
  dateOfBirth?: string;
  userIdByInstitute?: string | null;
  verifiedBy?: string | null;
  fatherId?: string;
  motherId?: string;
  guardianId?: string;
}

interface InstituteUsersResponse {
  data: InstituteUserData[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

type UserType = 'STUDENT' | 'TEACHER' | 'ATTENDANCE_MARKER';

const InstituteUsers = () => {
  const { toast } = useToast();
  const { user, currentInstituteId } = useAuth();
  
  const [students, setStudents] = useState<InstituteUserData[]>([]);
  const [teachers, setTeachers] = useState<InstituteUserData[]>([]);
  const [attendanceMarkers, setAttendanceMarkers] = useState<InstituteUserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<InstituteUserData | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showCreateUserDialog, setShowCreateUserDialog] = useState(false);
  const [showAssignUserDialog, setShowAssignUserDialog] = useState(false);
  const [showAssignParentDialog, setShowAssignParentDialog] = useState(false);
  const [selectedStudentForParent, setSelectedStudentForParent] = useState<InstituteUserData | null>(null);
  const [assignInitialUserId, setAssignInitialUserId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<UserType>('STUDENT');
  const [loadingStates, setLoadingStates] = useState({
    STUDENT: false,
    TEACHER: false,
    ATTENDANCE_MARKER: false
  });

  // Use API request hook for fetching users by type
  const fetchUsersByTypeRequest = useApiRequest(
    async (userType: UserType) => {
      if (!currentInstituteId) throw new Error('No institute selected');
      const response = await instituteApi.getInstituteUsersByType(currentInstituteId, userType);
      return response;
    },
    { preventDuplicates: true }
  );

  const fetchUsersByType = async (userType: UserType) => {
    try {
      setLoadingStates(prev => ({ ...prev, [userType]: true }));
      
      const response = await fetchUsersByTypeRequest.execute(userType);
      console.log(`Institute ${userType.toLowerCase()}s data received:`, response);
      
      const userData = response.data || [];
      
      // Update the appropriate state based on user type
      switch (userType) {
        case 'STUDENT':
          setStudents(userData);
          break;
        case 'TEACHER':
          setTeachers(userData);
          break;
        case 'ATTENDANCE_MARKER':
          setAttendanceMarkers(userData);
          break;
      }
      
      toast({
        title: `${userType.charAt(0) + userType.slice(1).toLowerCase()}s Loaded`,
        description: `Successfully loaded ${userData.length} ${userType.toLowerCase()}s.`
      });
    } catch (error) {
      console.error(`Error fetching institute ${userType.toLowerCase()}s:`, error);
      toast({
        title: "Error",
        description: `Failed to load institute ${userType.toLowerCase()}s`,
        variant: "destructive"
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [userType]: false }));
    }
  };

  const handleViewUser = (user: InstituteUserData) => {
    setSelectedUser(user);
    setShowUserDialog(true);
  };

  const handleCreateUser = async (userData: any) => {
    console.log('User created successfully:', userData);
    setShowCreateUserDialog(false);
    
    // If API returned assignment-related shape, auto-open Assign dialog with prefilled userId
    if (userData && typeof userData.success === 'boolean' && userData.user?.id) {
      setAssignInitialUserId(userData.user.id);
      setShowAssignUserDialog(true);
    }
    
    toast({
      title: "User Created",
      description: "User has been created successfully.",
    });
  };

  const handleAssignUser = async (assignData: any) => {
    console.log('User assigned successfully:', assignData);
    setShowAssignUserDialog(false);
    
    toast({
      title: "User Assigned",
      description: "User has been assigned to institute successfully.",
    });
    
    // Refresh the current tab data
    fetchUsersByType(activeTab);
  };

  const handleAssignParent = (student: InstituteUserData) => {
    setSelectedStudentForParent(student);
    setShowAssignParentDialog(true);
  };

  const handleParentAssignment = async (data: any) => {
    if (!selectedStudentForParent) return;
    
    try {
      await studentsApi.assignParent(selectedStudentForParent.id, data);
      
      toast({
        title: "Parent Assigned",
        description: "Parent has been assigned to student successfully.",
      });
      
      setShowAssignParentDialog(false);
      setSelectedStudentForParent(null);
      
      // Refresh students data
      fetchUsersByType('STUDENT');
    } catch (error) {
      console.error('Error assigning parent:', error);
      toast({
        title: "Error",
        description: "Failed to assign parent to student.",
        variant: "destructive"
      });
    }
  };

  const getCurrentUsers = () => {
    switch (activeTab) {
      case 'STUDENT':
        return students;
      case 'TEACHER':
        return teachers;
      case 'ATTENDANCE_MARKER':
        return attendanceMarkers;
      default:
        return [];
    }
  };

  const getUserTypeLabel = (type: UserType) => {
    switch (type) {
      case 'STUDENT':
        return 'Students';
      case 'TEACHER':
        return 'Teachers';
      case 'ATTENDANCE_MARKER':
        return 'Attendance Markers';
      default:
        return '';
    }
  };

  const getUserTypeIcon = (type: UserType) => {
    switch (type) {
      case 'STUDENT':
        return GraduationCap;
      case 'TEACHER':
        return Users;
      case 'ATTENDANCE_MARKER':
        return UserCheck;
      default:
        return Users;
    }
  };

  if (!user || user.role !== 'InstituteAdmin') {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Access denied. InstituteAdmin role required.</p>
      </div>
    );
  }

  if (!currentInstituteId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400">Please select an institute first.</p>
      </div>
    );
  }

  const currentUsers = getCurrentUsers();
  const currentLoading = loadingStates[activeTab];
  const IconComponent = getUserTypeIcon(activeTab);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Institute Users</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage users in your institute
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowAssignUserDialog(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Assign User
          </Button>
          <Button 
            onClick={() => setShowCreateUserDialog(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create User
          </Button>
        </div>
      </div>

      {/* Tabs for different user types */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as UserType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="STUDENT" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="TEACHER" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Teachers
          </TabsTrigger>
          <TabsTrigger value="ATTENDANCE_MARKER" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Attendance Markers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="STUDENT" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                {students.length} Students
              </Badge>
            </div>
            <Button 
              onClick={() => fetchUsersByType('STUDENT')} 
              disabled={loadingStates.STUDENT}
              variant="outline"
              size="sm"
            >
              {loadingStates.STUDENT ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Load Students
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="TEACHER" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {teachers.length} Teachers
              </Badge>
            </div>
            <Button 
              onClick={() => fetchUsersByType('TEACHER')} 
              disabled={loadingStates.TEACHER}
              variant="outline"
              size="sm"
            >
              {loadingStates.TEACHER ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Load Teachers
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="ATTENDANCE_MARKER" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <UserCheck className="h-4 w-4" />
                {attendanceMarkers.length} Attendance Markers
              </Badge>
            </div>
            <Button 
              onClick={() => fetchUsersByType('ATTENDANCE_MARKER')} 
              disabled={loadingStates.ATTENDANCE_MARKER}
              variant="outline"
              size="sm"
            >
              {loadingStates.ATTENDANCE_MARKER ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Load Attendance Markers
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.imageUrl || ''} alt={user.name} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email || 'N/A'}</TableCell>
                  <TableCell>{user.phoneNumber || 'N/A'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewUser(user)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      {activeTab === 'STUDENT' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAssignParent(user)}
                        >
                          <UserCog className="h-4 w-4 mr-2" />
                          Assign Parent
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {currentUsers.length === 0 && !currentLoading && (
        <Card>
          <CardContent className="text-center py-12">
            <IconComponent className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No {getUserTypeLabel(activeTab)} Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No {activeTab.toLowerCase().replace('_', ' ')}s found in this institute. Click the button above to load data.
            </p>
          </CardContent>
        </Card>
      )}

      {/* User Details Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getUserTypeLabel(activeTab).slice(0, -1)} Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.imageUrl || ''} alt={selectedUser.name} />
                  <AvatarFallback className="text-lg">
                    {selectedUser.name.split(' ').map(n => n.charAt(0)).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-gray-600">{selectedUser.email || 'N/A'}</p>
                  <Badge variant="outline">{activeTab.replace('_', ' ')}</Badge>
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">User ID</label>
                  <p className="text-sm">{selectedUser.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-sm">{selectedUser.phoneNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-sm">{selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Institute User ID</label>
                  <p className="text-sm">{selectedUser.userIdByInstitute || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Verified By</label>
                  <p className="text-sm">{selectedUser.verifiedBy || 'N/A'}</p>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h4 className="text-lg font-medium mb-3">Address Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address Line 1</label>
                    <p className="text-sm">{selectedUser.addressLine1 || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Address Line 2</label>
                    <p className="text-sm">{selectedUser.addressLine2 || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Family Information (Students only) */}
              {activeTab === 'STUDENT' && (selectedUser.fatherId || selectedUser.motherId || selectedUser.guardianId) && (
                <div>
                  <h4 className="text-lg font-medium mb-3">Family Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedUser.fatherId && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Father ID</label>
                        <p className="text-sm">{selectedUser.fatherId}</p>
                      </div>
                    )}
                    {selectedUser.motherId && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Mother ID</label>
                        <p className="text-sm">{selectedUser.motherId}</p>
                      </div>
                    )}
                    {selectedUser.guardianId && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Guardian ID</label>
                        <p className="text-sm">{selectedUser.guardianId}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={showCreateUserDialog} onOpenChange={setShowCreateUserDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <CreateUserForm
            onSubmit={handleCreateUser}
            onCancel={() => setShowCreateUserDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Assign User Dialog */}
      <Dialog open={showAssignUserDialog} onOpenChange={setShowAssignUserDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign User to Institute</DialogTitle>
          </DialogHeader>
          <AssignUserForm
            instituteId={currentInstituteId!}
            onSubmit={handleAssignUser}
            onCancel={() => setShowAssignUserDialog(false)}
            initialUserId={assignInitialUserId}
          />
        </DialogContent>
      </Dialog>

      {/* Assign Parent Dialog */}
      <Dialog open={showAssignParentDialog} onOpenChange={setShowAssignParentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign Parent to Student</DialogTitle>
          </DialogHeader>
          {selectedStudentForParent && (
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Assigning parent to:</p>
              <p className="font-medium">{selectedStudentForParent.name}</p>
              <p className="text-sm text-muted-foreground">ID: {selectedStudentForParent.id}</p>
            </div>
          )}
          <AssignParentForm
            onSubmit={handleParentAssignment}
            onCancel={() => {
              setShowAssignParentDialog(false);
              setSelectedStudentForParent(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstituteUsers;
