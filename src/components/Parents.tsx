import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  RefreshCw, 
  Search, 
  Plus,
  AlertTriangle,
  User,
  MapPin,
  Phone
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AccessControl } from '@/utils/permissions';
import { type UserRole } from '@/contexts/types/auth.types';
import { useToast } from '@/hooks/use-toast';
import { parentsApi, type InstituteParent, type InstituteParentsResponse } from '@/api/parents.api';
import { useApiRequest } from '@/hooks/useApiRequest';
import CreateParentForm from '@/components/forms/CreateParentForm';

const Parents = () => {
  const { user, selectedInstitute } = useAuth();
  const { toast } = useToast();
  const [parents, setParents] = useState<InstituteParent[]>([]);
  const [filteredParents, setFilteredParents] = useState<InstituteParent[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });

  const userRole = (user?.role || 'Student') as UserRole;
  const canViewParents = userRole === 'InstituteAdmin';
  const canCreateParents = userRole === 'InstituteAdmin';

  // API request hook
  const { 
    execute: fetchInstituteParents, 
    loading 
  } = useApiRequest(parentsApi.getInstituteParents);

  const loadParents = async () => {
    if (!selectedInstitute) {
      toast({
        title: "Selection Required",
        description: "Please select an institute",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Fetching parents for institute:', selectedInstitute.id);
      const response: InstituteParentsResponse = await fetchInstituteParents(selectedInstitute.id);
      console.log('API Response:', response);
      console.log('Parents data:', response.data);
      console.log('Meta data:', response.meta);

      setParents(response.data || []);
      setFilteredParents(response.data || []);
      // Add fallback for meta to prevent undefined errors
      setMeta(response.meta || { total: 0, page: 1, limit: 10, totalPages: 0 });

      console.log('State updated - parents:', response.data?.length || 0);

      toast({
        title: "Success",
        description: `Loaded ${response.data?.length || 0} parents`,
      });
    } catch (error) {
      console.error('Error loading parents:', error);
      toast({
        title: "Error",
        description: "Failed to load parents",
        variant: "destructive",
      });
    }
  };

  // Remove useEffect - only load data on button click

  const handleSearch = (term: string) => {
    const trimmed = term.trim();
    setSearchTerm(trimmed);
    if (trimmed) {
      const filtered = parents.filter(parent =>
        parent.name.toLowerCase().includes(trimmed.toLowerCase()) ||
        (parent.addressLine2?.toLowerCase().includes(trimmed.toLowerCase()))
      );
      setFilteredParents(filtered);
    } else {
      setFilteredParents(parents);
    }
  };
  const handleCreateParentSubmit = (data: any) => {
    toast({
      title: "Success",
      description: "Parent created successfully",
    });
    setShowCreateDialog(false);
    loadParents(); // Refresh the list
  };

  // Access control check
  if (!canViewParents) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h3 className="text-lg font-semibold mb-2">Access Denied</h3>
        <p className="text-muted-foreground">
          You don't have permission to view parents. Only Institute Admins can access this section.
        </p>
      </div>
    );
  }

  // Selection requirement check
  if (!selectedInstitute) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Users className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Selection Required</h3>
        <p className="text-muted-foreground">
          Please select an institute to view parents.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 md:w-8 md:h-8" />
            Institute Parents
          </h1>
          <div className="text-sm md:text-base text-muted-foreground">
            <p>Institute: <span className="font-medium">{selectedInstitute.name}</span></p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <Button
            onClick={loadParents}
            disabled={loading}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {canCreateParents && (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Parent
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Parent</DialogTitle>
                  <DialogDescription>
                    Add a new parent to the institute
                  </DialogDescription>
                </DialogHeader>
                <CreateParentForm 
                  onSubmit={handleCreateParentSubmit}
                  onCancel={() => setShowCreateDialog(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Input
          type="text"
          placeholder="Search parents..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      </div>

      {/* Stats Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base md:text-lg">Parent Statistics</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl md:text-2xl font-bold">{meta?.total || 0}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Total Parents</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold">{filteredParents.length}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Filtered Results</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold">{meta?.page || 1}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Current Page</div>
            </div>
            <div>
              <div className="text-xl md:text-2xl font-bold">{meta?.totalPages || 0}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Total Pages</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          <span>Loading parents...</span>
        </div>
      )}

      {/* Parents Table */}
      {!loading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base md:text-lg">
              Parents List ({filteredParents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Debug: {parents.length} parents loaded, {filteredParents.length} filtered
              </p>
            </div>
            {filteredParents.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead className="min-w-[120px]">ID</TableHead>
                      <TableHead className="min-w-[150px]">Name</TableHead>
                      <TableHead className="min-w-[140px] hidden sm:table-cell">Phone</TableHead>
                      <TableHead className="min-w-[200px] hidden md:table-cell">Address</TableHead>
                      <TableHead className="min-w-[120px] hidden lg:table-cell">Institute ID</TableHead>
                      <TableHead className="w-20 text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredParents.map((parent) => (
                      <TableRow key={parent.id}>
                        <TableCell>
                          <Avatar className="h-8 w-8 md:h-10 md:w-10">
                            <AvatarImage 
                              src={parent.imageUrl} 
                              alt={parent.name}
                            />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">
                            {parent.id}
                          </div>
                        </TableCell>
                         <TableCell>
                           <div className="space-y-1">
                             <div className="font-medium text-sm md:text-base">
                               {parent.name}
                             </div>
                             <div className="sm:hidden text-xs text-muted-foreground space-y-1">
                               {parent.phoneNumber && (
                                 <div className="flex items-center gap-1">
                                   <Phone className="h-3 w-3" />
                                   {parent.phoneNumber}
                                 </div>
                               )}
                               {parent.addressLine2 && (
                                 <div className="flex items-center gap-1">
                                   <MapPin className="h-3 w-3" />
                                   {parent.addressLine2}
                                 </div>
                               )}
                             </div>
                           </div>
                         </TableCell>
                         <TableCell className="hidden sm:table-cell">
                           <div className="text-sm flex items-center gap-2">
                             <Phone className="h-4 w-4 text-muted-foreground" />
                             {parent.phoneNumber || 'Not specified'}
                           </div>
                         </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-sm flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {parent.addressLine2 || 'Not specified'}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="text-sm">
                            {parent.userIdByInstitute || 'Not assigned'}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            variant={parent.verifiedBy ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {parent.verifiedBy ? 'Verified' : 'Unverified'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Parents Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? `No parents match "${searchTerm}"`
                    : 'No parents found for this institute'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Parents;
