import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, ExternalLink, FileText, Plus, Edit } from 'lucide-react';
import ApiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import CreateEditLectureModal from '@/components/CreateEditLectureModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface Document {
  _id: string;
  documentName: string;
  documentUrl: string;
  uploadedAt: string;
}

interface Lecture {
  _id: string;
  subjectId: string;
  grade: number;
  title: string;
  description: string;
  lessonNumber: number;
  lectureNumber: number;
  provider: string;
  lectureLink: string;
  isActive: boolean;
  documents: Document[];
  createdAt: string;
  updatedAt: string;
}

export default function SubjectLecturesManagement() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null);
  const { toast } = useToast();


  const fetchLectures = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getLectures();
      
      // Handle different response structures
      if (Array.isArray(response)) {
        setLectures(response);
        setTotalRecords(response.length);
        setTotalPages(1);
      } else if (response.success && response.data) {
        setLectures(response.data);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
          setTotalRecords(response.pagination.totalRecords);
        } else {
          setTotalRecords(response.data.length);
          setTotalPages(1);
        }
      } else if (response.data) {
        setLectures(response.data);
        setTotalRecords(response.data.length);
        setTotalPages(1);
      } else {
        setLectures([]);
        setTotalRecords(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching lectures:', error);
      toast({
        title: "Error",
        description: "Failed to fetch lectures. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredLectures = lectures.filter(lecture =>
    lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecture.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lecture.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateLecture = () => {
    setEditingLecture(null);
    setIsModalOpen(true);
  };

  const handleEditLecture = (lecture: Lecture) => {
    setEditingLecture(lecture);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingLecture(null);
  };

  const handleModalSuccess = () => {
    fetchLectures();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-border bg-card">
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground">Subject Lectures Management</CardTitle>
          <p className="text-muted-foreground">
            Manage and view all structured lectures in the system ({totalRecords} total)
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lectures by title, provider, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-border bg-background"
              />
            </div>
            <Button 
              onClick={fetchLectures} 
              className="shrink-0 bg-green-600 text-white hover:bg-green-700 px-4 py-2 mr-2"
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <Search className="h-4 w-4 mr-2" />
              Load Lectures
            </Button>
            <Button 
              onClick={handleCreateLecture} 
              className="shrink-0 bg-blue-600 text-white hover:bg-blue-700 px-4 py-2"
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Lecture
            </Button>
          </div>

          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-foreground">Title</TableHead>
                  <TableHead className="text-foreground">Grade</TableHead>
                  <TableHead className="text-foreground">Provider</TableHead>
                  <TableHead className="text-foreground">Lesson/Lecture</TableHead>
                  <TableHead className="text-foreground">Documents</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLectures.map((lecture) => (
                  <TableRow key={lecture._id} className="border-border">
                    <TableCell>
                      <div>
                        <div className="font-medium text-foreground">{lecture.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {lecture.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-border">
                        Grade {lecture.grade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground">{lecture.provider}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Lesson: {lecture.lessonNumber}</div>
                        <div>Lecture: {lecture.lectureNumber}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-foreground">
                          {lecture.documents.length} docs
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={lecture.isActive ? "default" : "secondary"}
                        className={lecture.isActive ? "bg-emerald-500 text-white" : ""}
                      >
                        {lecture.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                         <Button
                           size="sm"
                           variant="outline"
                           onClick={() => handleEditLecture(lecture)}
                           className="border-gray-300 bg-white hover:bg-gray-50 px-3 py-1"
                           style={{ display: 'flex', alignItems: 'center' }}
                         >
                           <Edit className="h-4 w-4" />
                           <span className="ml-1 text-xs">Edit</span>
                         </Button>
                        {lecture.lectureLink && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(lecture.lectureLink, '_blank')}
                            className="border-gray-300 bg-white hover:bg-gray-50 px-3 py-1"
                            style={{ display: 'flex', alignItems: 'center' }}
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="ml-1 text-xs">Link</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredLectures.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No lectures found matching your search.</p>
              </div>
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
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
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateEditLectureModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        lecture={editingLecture}
      />
    </div>
  );
}