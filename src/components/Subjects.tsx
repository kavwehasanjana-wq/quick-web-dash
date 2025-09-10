import React, { useState, useEffect } from 'react';
import DataTable from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { DataCardView } from '@/components/ui/data-card-view';
import { RefreshCw, Filter, Eye, Edit, Trash2, Plus } from 'lucide-react';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { AccessControl } from '@/utils/permissions';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import CreateSubjectForm from '@/components/forms/CreateSubjectForm';
import AssignSubjectToClassForm from '@/components/forms/AssignSubjectToClassForm';
import { getBaseUrl } from '@/contexts/utils/auth.api';

interface SubjectData {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  creditHours: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const Subjects = () => {
  const { user, selectedInstitute, selectedClass, selectedSubject, currentInstituteId, currentClassId, currentSubjectId } = useAuth();
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedSubjectData, setSelectedSubjectData] = useState<any>(null);
  const [subjectsData, setSubjectsData] = useState<SubjectData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const userRole = (user?.role || 'Student') as UserRole;
  const isInstituteAdmin = userRole === 'InstituteAdmin';
  const canEdit = AccessControl.hasPermission(userRole, 'edit-subject') && !isInstituteAdmin;
  const canDelete = AccessControl.hasPermission(userRole, 'delete-subject') && !isInstituteAdmin;
  const canCreate = userRole === 'InstituteAdmin';
  const canAssignSubjects = userRole === 'InstituteAdmin' || userRole === 'Teacher';

  const getAuthToken = () => {
    const token = localStorage.getItem('access_token') || 
                  localStorage.getItem('token') || 
                  localStorage.getItem('authToken');
    return token;
  };

  const getApiHeaders = () => {
    const token = getAuthToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  };

  const handleLoadData = async () => {
    if (!currentInstituteId) {
      toast({
        title: "Error",
        description: "Please select an institute first.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    console.log('Loading subjects data...');
    console.log(`Current context - Institute: ${selectedInstitute?.name}, InstituteId: ${currentInstituteId}`);
    
    try {
      const baseUrl = getBaseUrl();
      const headers = getApiHeaders();
      
      // Use the new API endpoint
      const url = `${baseUrl}/subjects?isActive=true&instituteId=${currentInstituteId}`;
      console.log('Fetching subjects from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch subjects: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('API response:', result);
      
      // Filter subjects based on local filters
      let filteredData = result;
      
      if (searchTerm) {
        filteredData = filteredData.filter((subject: SubjectData) =>
          subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subject.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subject.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (statusFilter !== 'all') {
        filteredData = filteredData.filter((subject: SubjectData) => 
          statusFilter === 'active' ? subject.isActive : !subject.isActive
        );
      }
      
      if (categoryFilter !== 'all') {
        filteredData = filteredData.filter((subject: SubjectData) => subject.category === categoryFilter);
      }
      
      setSubjectsData(filteredData);
      setDataLoaded(true);
      toast({
        title: "Data Loaded",
        description: `Successfully loaded ${filteredData.length} subjects.`
      });
    } catch (error) {
      console.error('Error loading subjects:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load subjects data.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const subjectsColumns = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'description', header: 'Description' },
    { key: 'category', header: 'Category' },
    { key: 'creditHours', header: 'Credit Hours' },
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

  const handleCreateSubject = async (subjectData: any) => {
    if (!currentInstituteId) {
      toast({
        title: "Error",
        description: "Please select an institute first.",
        variant: "destructive"
      });
      return;
    }

    try {
      toast({
        title: "Subject Created",
        description: `Subject ${subjectData.name} has been created successfully.`
      });
      
      setIsCreateDialogOpen(false);
      // Refresh data after creation
      handleLoadData();
    } catch (error: any) {
      console.error('Error in handleCreateSubject:', error);
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create subject.",
        variant: "destructive"
      });
    }
  };

  const handleEditSubject = (subject: any) => {
    console.log('Edit subject:', subject);
    setSelectedSubjectData(subject);
    setIsEditDialogOpen(true);
  };

  const handleUpdateSubject = (subjectData: any) => {
    console.log('Updating subject:', subjectData);
    
    toast({
      title: "Subject Updated",
      description: `Subject ${subjectData.name} has been updated successfully.`
    });
    setIsEditDialogOpen(false);
    setSelectedSubjectData(null);
    // Refresh data after update
    handleLoadData();
  };

  const handleDeleteSubject = (subject: any) => {
    console.log('Delete subject:', subject);
    toast({
      title: "Subject Deleted",
      description: `Subject ${subject.name} has been deleted.`,
      variant: "destructive"
    });
  };

  const handleViewSubject = (subject: any) => {
    console.log('View subject details:', subject);
    toast({
      title: "View Subject",
      description: `Viewing subject: ${subject.name}`
    });
  };

  const getContextTitle = () => {
    const contexts = [];
    
    if (selectedInstitute) {
      contexts.push(selectedInstitute.name);
    }
    
    if (selectedClass) {
      contexts.push(selectedClass.name);
    }
    
    if (selectedSubject) {
      contexts.push(selectedSubject.name);
    }
    
    let title = 'Subjects Management';
    if (contexts.length > 0) {
      title += ` (${contexts.join(' → ')})`;
    }
    
    return title;
  };

  const customActions = isInstituteAdmin ? [] : [
    {
      label: 'View',
      action: (subject: any) => handleViewSubject(subject),
      icon: <Eye className="h-3 w-3" />,
      variant: 'outline' as const
    },
    ...(canEdit ? [{
      label: 'Edit',
      action: (subject: any) => handleEditSubject(subject),
      icon: <Edit className="h-3 w-3" />,
      variant: 'outline' as const
    }] : []),
    ...(canDelete ? [{
      label: 'Delete',
      action: (subject: any) => handleDeleteSubject(subject),
      icon: <Trash2 className="h-3 w-3" />,
      variant: 'destructive' as const
    }] : [])
  ];

  return (
    <div className="space-y-6">
      {!dataLoaded ? (
        <div className="text-center py-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {getContextTitle()}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Click the button below to load subjects data
          </p>
          <Button 
            onClick={handleLoadData} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading Data...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Data
              </>
            )}
          </Button>
        </div>
      ) : (
        <>
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {getContextTitle()}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage academic subjects, curriculum planning, and subject assignments
            </p>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filters
              </Button>
              
              {canCreate && (
                 <Button
                   onClick={() => setIsCreateDialogOpen(true)}
                   className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                   size="sm"
                 >
                   <Plus className="h-4 w-4" />
                   Create Subject
                 </Button>
                )}
                
                {canAssignSubjects && dataLoaded && subjectsData.length > 0 && (
                  <Button
                    onClick={() => setIsAssignDialogOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                    Assign Subject
                  </Button>
                )}
            </div>
            
            <Button 
              onClick={handleLoadData} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Data
                </>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border mb-6">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Search Subjects
                </label>
                <Input
                  placeholder="Search subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                  Category
                </label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Core">Core</SelectItem>
                    <SelectItem value="Optional">Optional</SelectItem>
                    <SelectItem value="Elective">Elective</SelectItem>
                    <SelectItem value="Mandatory">Mandatory</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Mobile View Content - Always Card View */}
          <div className="md:hidden">
            <DataCardView
              data={subjectsData || []}
              columns={subjectsColumns}
              customActions={customActions}
              allowEdit={false}
              allowDelete={false}
            />
          </div>

          {/* Desktop View */}
          <div className="hidden md:block">
            <DataTable
              title="Subjects"
              data={subjectsData || []}
              columns={subjectsColumns}
              onEdit={!isInstituteAdmin && canEdit ? handleEditSubject : undefined}
              onDelete={!isInstituteAdmin && canDelete ? handleDeleteSubject : undefined}
              onView={!isInstituteAdmin ? handleViewSubject : undefined}
              searchPlaceholder="Search subjects..."
              allowEdit={!isInstituteAdmin && canEdit}
              allowDelete={!isInstituteAdmin && canDelete}
            />
          </div>
        </>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Subject</DialogTitle>
          </DialogHeader>
          <CreateSubjectForm
            onSubmit={handleCreateSubject}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
          </DialogHeader>
          <CreateSubjectForm
            initialData={selectedSubjectData}
            onSubmit={handleUpdateSubject}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setSelectedSubjectData(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Assign Subject Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Subjects to Class</DialogTitle>
          </DialogHeader>
          <AssignSubjectToClassForm
            onSuccess={() => {
              setIsAssignDialogOpen(false);
              toast({
                title: "Success",
                description: "Subjects assigned successfully!"
              });
            }}
            onCancel={() => setIsAssignDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Subjects;
