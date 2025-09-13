import { useState } from 'react';
import { Search, Building2, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreateInstituteModal } from '@/components/CreateInstituteModal';
import { AssignUserModal } from '@/components/AssignUserModal';
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

interface Institute {
  id: string;
  name: string;
  code: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  type: string;
}

export function InstituteManagement() {
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
  const { toast } = useToast();

  const loadInstitutes = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await ApiService.getInstitutes(page, 10);
      setInstitutes(response.data);
      setMeta(response.meta);
      setCurrentPage(page);
    } catch (error) {
      toast({
        title: "Failed to load institutes",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstituteCreated = () => {
    loadInstitutes();
  };

  const filteredInstitutes = institutes.filter(institute => 
    institute.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    institute.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    institute.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Institute Management</h2>
          <p className="text-muted-foreground">Manage educational institutions in the system</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => loadInstitutes()} variant="outline" disabled={isLoading}>
            {isLoading ? "Loading..." : "Load Institutes"}
          </Button>
          <AssignUserModal onUserAssigned={handleInstituteCreated} />
          <CreateInstituteModal onInstituteCreated={handleInstituteCreated} />
        </div>
      </div>

      {/* Search */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search institutes by name, code, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Institutes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInstitutes.map((institute) => (
          <Card key={institute.id} className="border-border bg-card hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={institute.imageUrl} />
                  <AvatarFallback className="bg-admin text-admin-foreground">
                    <Building2 className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{institute.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {institute.code}
                    </Badge>
                    <Badge className={institute.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
                      {institute.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{institute.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>{institute.phone}</span>
              </div>
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-2">
                  {institute.address}, {institute.city}, {institute.state}, {institute.country} {institute.pinCode}
                </span>
              </div>
              <div className="pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Created: {new Date(institute.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInstitutes.length === 0 && institutes.length > 0 && (
        <Card className="border-border bg-card">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No institutes found matching your search criteria.</p>
          </CardContent>
        </Card>
      )}

      {institutes.length === 0 && !isLoading && (
        <Card className="border-border bg-card">
          <CardContent className="text-center py-8">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No institutes loaded yet.</p>
            <Button onClick={() => loadInstitutes()} disabled={isLoading}>
              Load Institutes
            </Button>
          </CardContent>
        </Card>
      )}
      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => meta.hasPrev && loadInstitutes(currentPage - 1)}
                  className={!meta.hasPrev ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => loadInstitutes(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => meta.hasNext && loadInstitutes(currentPage + 1)}
                  className={!meta.hasNext ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}