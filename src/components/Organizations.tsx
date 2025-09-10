
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Building2, Search, Plus, LayoutGrid, List, Filter, UserPlus, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { organizationApi, Organization, OrganizationQueryParams } from '@/api/organization.api';
import { useToast } from '@/hooks/use-toast';
import CreateOrganizationForm from '@/components/forms/CreateOrganizationForm';
import EnrollOrganizationDialog from './EnrollOrganizationDialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const Organizations = () => {
  const { setSelectedOrganization, user } = useAuth();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchTerm, setSearchTerm] = useState('');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const [selectedEnrollOrganization, setSelectedEnrollOrganization] = useState<Organization | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrganizations, setTotalOrganizations] = useState(0);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [publicFilter, setPublicFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchOrganizations = async () => {
    setIsLoading(true);
    try {
      const params: OrganizationQueryParams = {
        page: currentPage,
        limit: 10,
        sortBy,
        sortOrder,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (typeFilter !== 'all') {
        params.type = typeFilter as 'INSTITUTE' | 'GLOBAL';
      }

      if (publicFilter !== 'all') {
        params.isPublic = publicFilter === 'public';
      }

      const response = await organizationApi.getOrganizations(params);
      setOrganizations(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalOrganizations(response.pagination.total);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch organizations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Removed automatic API call - users must click Refresh to load data

  const canCreateOrganizations = () => {
    return user?.role === 'OrganizationManager';
  };

  const canEnrollInOrganizations = () => {
    return ['Student', 'Teacher', 'InstituteAdmin'].includes(user?.role || '');
  };

  const handleSelectOrganization = (org: Organization) => {
    console.log('Select organization:', org.organizationId);
    setSelectedOrganization({
      id: org.organizationId,
      name: org.name,
      code: org.type,
      description: `${org.type} Organization`,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userRole: org.userRole, // Pass the userRole from the organization data
    });
  };

  const handleCreateSuccess = (newOrganization: Organization) => {
    setIsCreateDialogOpen(false);
    fetchOrganizations(); // Refresh the list
    toast({
      title: 'Success',
      description: 'Organization created successfully',
    });
  };

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setPublicFilter('all');
    setSortBy('createdAt');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const OrganizationCard = ({ org }: { org: Organization }) => (
    <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
      {/* Image section - 1/3 of card */}
      <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
        {org.imageUrl ? (
          <img 
            src={org.imageUrl} 
            alt={org.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to gradient background if image fails to load
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.classList.add('bg-gradient-to-br', 'from-primary/10', 'to-primary/5');
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
            <Building2 className="h-16 w-16 text-primary/30" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant={org.isPublic ? 'default' : 'secondary'}>
            {org.isPublic ? 'Public' : 'Private'}
          </Badge>
        </div>
        {org.needEnrollmentVerification && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
              Verification Required
            </Badge>
          </div>
        )}
      </div>
      
      {/* Content section - 2/3 of card */}
      <div className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg line-clamp-2">{org.name}</CardTitle>
              <Badge variant="outline" className="mt-2">
                {org.type}
              </Badge>
            </div>
            {org.instituteId && (
              <Badge variant="outline" className="text-xs">
                Institute: {org.instituteId}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <span className="font-medium">Type:</span>
              <span className="text-muted-foreground">{org.type}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Visibility:</span>
              <span className="text-muted-foreground">
                {org.isPublic ? 'Public' : 'Private'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-medium">Verification:</span>
              <span className="text-muted-foreground">
                {org.needEnrollmentVerification ? 'Required' : 'Not Required'}
              </span>
            </div>
          </div>

          <div className="pt-2 space-y-2">
            <Button
              onClick={() => handleSelectOrganization(org)}
              className="w-full"
            >
              Select Organization
            </Button>
            {canEnrollInOrganizations() && (
              <Button
                onClick={() => {
                  setSelectedEnrollOrganization(org);
                  setShowEnrollDialog(true);
                }}
                variant="outline"
                className="w-full"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Enroll
              </Button>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
  );

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Organizations</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {canEnrollInOrganizations() 
              ? "View organizations in your institute" 
              : "Manage your organizations and their details"
            }
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          {canEnrollInOrganizations() && (
            <Button onClick={() => {
              // This button will trigger the enrollment view where users can see available organizations
              fetchOrganizations();
            }} className="flex items-center gap-2 w-full sm:w-auto">
              <UserPlus className="h-4 w-4" />
              Browse Organizations
            </Button>
          )}
          {canCreateOrganizations() && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Organization
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl mx-4">
                <DialogHeader>
                  <DialogTitle>Create New Organization</DialogTitle>
                </DialogHeader>
                <CreateOrganizationForm
                  onSuccess={handleCreateSuccess}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="relative flex-1 max-w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Filters</span>
              <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            <Button
              variant={viewMode === 'card' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('card')}
              className="flex-1 sm:flex-none"
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Cards</span>
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="flex-1 sm:flex-none"
            >
              <List className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Table</span>
            </Button>
          </div>
        </div>

        {/* Filter Row - Collapsible */}
        <Collapsible open={showFilters} onOpenChange={setShowFilters}>
          <CollapsibleContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="INSTITUTE">Institute</SelectItem>
                  <SelectItem value="GLOBAL">Global</SelectItem>
                </SelectContent>
              </Select>

              <Select value={publicFilter} onValueChange={setPublicFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Visibility</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>

              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('-');
                setSortBy(field);
                setSortOrder(order as 'asc' | 'desc');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="type-asc">Type (A-Z)</SelectItem>
                  <SelectItem value="type-desc">Type (Z-A)</SelectItem>
                  <SelectItem value="createdAt-desc">Newest First</SelectItem>
                  <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" onClick={resetFilters} className="w-full">
                <Filter className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Reset Filters</span>
                <span className="sm:hidden">Reset</span>
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Content */}
      {!isLoading && (
        <>
          {viewMode === 'card' ? (
            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {organizations.map((org) => (
                <OrganizationCard key={org.organizationId} org={org} />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Card>
                <CardHeader>
                  <CardTitle>Organizations List</CardTitle>
                </CardHeader>
                <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Name</TableHead>
                      <TableHead className="hidden sm:table-cell">Type</TableHead>
                      <TableHead className="hidden md:table-cell">Visibility</TableHead>
                      <TableHead className="hidden lg:table-cell">Institute ID</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organizations.map((org) => (
                      <TableRow key={org.organizationId}>
                        <TableCell>
                          <div className="font-medium truncate">{org.name}</div>
                          <div className="sm:hidden text-xs text-muted-foreground">
                            {org.type} • {org.isPublic ? 'Public' : 'Private'}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline">{org.type}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant={org.isPublic ? 'default' : 'secondary'}>
                            {org.isPublic ? 'Public' : 'Private'}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {org.instituteId ? (
                            <Badge variant="outline" className="text-xs">
                              {org.instituteId}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              onClick={() => handleSelectOrganization(org)}
                              size="sm"
                              className="w-full sm:w-auto"
                            >
                              Select
                            </Button>
                            {canEnrollInOrganizations() && (
                              <Button
                                onClick={() => {
                                  setSelectedEnrollOrganization(org);
                                  setShowEnrollDialog(true);
                                }}
                                variant="outline"
                                size="sm"
                                className="w-full sm:w-auto"
                              >
                                <UserPlus className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Enroll</span>
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
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {organizations.length} of {totalOrganizations} organizations
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          {organizations.length === 0 && !isLoading && (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No organizations found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || typeFilter !== 'all' || publicFilter !== 'all'
                      ? 'Try adjusting your search terms or filters'
                      : 'Get started by adding your first organization'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Enroll Organization Dialog */}
      {selectedEnrollOrganization && (
        <EnrollOrganizationDialog
          open={showEnrollDialog}
          onOpenChange={setShowEnrollDialog}
          organizationId={selectedEnrollOrganization.organizationId}
          organizationName={selectedEnrollOrganization.name}
          onEnrollmentSuccess={() => {
            fetchOrganizations();
            setSelectedEnrollOrganization(null);
          }}
        />
      )}
    </div>
  );
};

export default Organizations;
