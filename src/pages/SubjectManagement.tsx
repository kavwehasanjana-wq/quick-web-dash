import { useState } from 'react';
import { Search, BookOpen, Award, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import ApiService from '@/services/api';
import { CreateSubjectModal } from '@/components/CreateSubjectModal';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface Subject {
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

export function SubjectManagement() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [meta, setMeta] = useState<any>(null);
const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const loadSubjects = async (page = 1) => {
    setIsLoading(true);
    try {
      const response = await ApiService.getSubjects(page, 10);
      // Handle both shapes: array response or { data, meta }
      const subjectsData = Array.isArray(response) ? response : response?.data ?? [];
      const metaRaw = Array.isArray(response) ? null : response?.meta ?? null;

      setSubjects(subjectsData as Subject[]);
      setMeta(
        metaRaw
          ? {
              totalPages: metaRaw.totalPages ?? 1,
              hasPrev: metaRaw.hasPreviousPage ?? false,
              hasNext: metaRaw.hasNextPage ?? false,
            }
          : null
      );
      setCurrentPage(page);
    } catch (error) {
      toast({
        title: "Failed to load subjects",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'science':
        return 'bg-emerald-100 text-emerald-800';
      case 'mathematics':
        return 'bg-blue-100 text-blue-800';
      case 'optional':
        return 'bg-purple-100 text-purple-800';
      case 'language':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSubjects = subjects.filter(subject => 
    subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    subject.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Subject Management</h2>
          <p className="text-muted-foreground">Manage academic subjects and curriculum</p>
        </div>
<div className="flex gap-3">
          <Button onClick={() => setIsCreateOpen(true)}>
            Create Subject
          </Button>
          <Button onClick={() => loadSubjects()} variant="outline" disabled={isLoading}>
            {isLoading ? "Loading..." : "Load Subjects"}
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subjects by name, code, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-border"
            />
          </div>
        </CardContent>
      </Card>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject) => (
          <Card key={subject.id} className="border-border bg-card hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{subject.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {subject.code}
                    </Badge>
                    <Badge className={subject.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}>
                      {subject.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {subject.description}
              </p>
              
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <Badge className={getCategoryColor(subject.category)}>
                  {subject.category}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{subject.creditHours} Credit Hours</span>
              </div>
              
              <div className="pt-2 border-t border-border">
                <span className="text-xs text-muted-foreground">
                  Created: {new Date(subject.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSubjects.length === 0 && subjects.length > 0 && (
        <Card className="border-border bg-card">
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No subjects found matching your search criteria.</p>
          </CardContent>
        </Card>
      )}

      {subjects.length === 0 && !isLoading && (
        <Card className="border-border bg-card">
          <CardContent className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No subjects loaded yet.</p>
            <Button onClick={() => loadSubjects()} disabled={isLoading}>
              Load Subjects
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
                  onClick={() => meta.hasPrev && loadSubjects(currentPage - 1)}
                  className={!meta.hasPrev ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
              
              {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => loadSubjects(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext 
                  onClick={() => meta.hasNext && loadSubjects(currentPage + 1)}
                  className={!meta.hasNext ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <CreateSubjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => { setIsCreateOpen(false); loadSubjects(currentPage); }}
      />
    </div>
  );
}