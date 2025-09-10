import React, { useState, useEffect } from 'react';
import DataTable from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, RefreshCw, GraduationCap, Image } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getBaseUrl } from '@/contexts/utils/auth.api';
import CreateClassForm from '@/components/forms/CreateClassForm';
import { AccessControl } from '@/utils/permissions';
import { UserRole } from '@/contexts/types/auth.types';

interface ClassData {
  id: string;
  instituteId: string;
  name: string;
  code: string;
  academicYear: string;
  level: number;
  grade: number;
  specialty: string;
  classType: string;
  capacity: number;
  classTeacherId: string;
  description: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  enrollmentCode: string;
  enrollmentEnabled: boolean;
  requireTeacherVerification: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

interface ApiResponse {
  data: ClassData[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
    previousPage: number | null;
    nextPage: number | null;
  };
}

const Classes = () => {
  const { user, selectedInstitute } = useAuth();
  const { toast } = useToast();

  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const userRole = (user?.role || 'Student') as UserRole;
  const isInstituteAdmin = userRole === 'InstituteAdmin';
  const canEdit = AccessControl.hasPermission(userRole, 'edit-class') && !isInstituteAdmin;
  const canDelete = AccessControl.hasPermission(userRole, 'delete-class') && !isInstituteAdmin;
  const canCreate = userRole === 'InstituteAdmin';

  const getApiHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    };
  };

  const fetchClasses = async () => {
    if (!selectedInstitute?.id) {
      toast({
        title: "Missing Information",
        description: "Please select an institute first.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '10',
        instituteId: selectedInstitute.id,
      });

      const response = await fetch(
        `${getBaseUrl()}/institute-classes?${params}`,
        { headers: getApiHeaders() }
      );

      if (response.ok) {
        const data: ApiResponse = await response.json();
        setClasses(data.data);
        toast({
          title: "Classes Loaded",
          description: `Successfully loaded ${data.data.length} classes.`
        });
      } else {
        throw new Error('Failed to fetch classes');
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (responseData: any) => {
    console.log('Class created successfully:', responseData);
    setIsCreateDialogOpen(false);
    fetchClasses(); // Refresh data
  };

  const handleCancelCreate = () => {
    setIsCreateDialogOpen(false);
  };

  const handleEditClass = async (classData: ClassData) => {
    // Simulate API call
    console.log('Editing class:', classData);
    toast({
      title: "Class Updated",
      description: `Successfully updated class: ${classData.name}`
    });
    fetchClasses(); // Refresh data
  };

  const handleDeleteClass = async (classId: string) => {
    // Simulate API call
    console.log('Deleting class with ID:', classId);
    toast({
      title: "Class Deleted",
      description: `Successfully deleted class with ID: ${classId}`
    });
    fetchClasses(); // Refresh data
  };

  const handleLoadData = () => {
    fetchClasses();
  };

  const columns = [
    {
      key: 'imageUrl',
      header: 'Image',
      render: (value: string, row: any) => (
        <Avatar className="h-12 w-12">
          <AvatarImage 
            src={value} 
            alt={row.name}
            className="object-cover"
          />
          <AvatarFallback className="bg-blue-100 text-blue-600">
            <Image className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
      )
    },
    {
      key: 'name',
      header: 'Class Name',
      render: (value: string, row: any) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-muted-foreground">{row.code}</div>
        </div>
      )
    },
    {
      key: 'grade',
      header: 'Grade',
      render: (value: number) => `Grade ${value}`
    },
    {
      key: 'specialty',
      header: 'Specialty'
    },
    {
      key: 'classType',
      header: 'Type',
      render: (value: string) => (
        <Badge variant="outline">{value}</Badge>
      )
    },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (value: number) => (
        <div className="flex items-center gap-1">
          <GraduationCap className="h-4 w-4" />
          {value}
        </div>
      )
    },
    {
      key: 'academicYear',
      header: 'Academic Year'
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value: boolean) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Classes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage institute classes and their details
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleLoadData} disabled={loading} variant="outline" size="sm">
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
          
          {canCreate && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Class
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Class</DialogTitle>
                </DialogHeader>
                <CreateClassForm onSubmit={handleCreateClass} onCancel={handleCancelCreate} />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <DataTable
        title=""
        data={classes}
        columns={columns}
        onEdit={!isInstituteAdmin && canEdit ? handleEditClass : undefined}
        onDelete={!isInstituteAdmin && canDelete ? handleDeleteClass : undefined}
        searchPlaceholder="Search classes..."
        allowAdd={false}
        allowEdit={!isInstituteAdmin && canEdit}
        allowDelete={!isInstituteAdmin && canDelete}
      />
    </div>
  );
};

export default Classes;
