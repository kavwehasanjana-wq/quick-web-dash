import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Users, UserPlus, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getBaseUrl } from '@/contexts/utils/auth.api';
import { instituteClassesApi, BulkAssignStudentsData } from '@/api/instituteClasses.api';
import { enrollmentApi } from '@/api/enrollment.api';

interface Student {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  imageUrl?: string;
  dateOfBirth?: string;
}

interface StudentsResponse {
  data: Student[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface AssignStudentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignmentComplete: () => void;
}

const AssignStudentsDialog: React.FC<AssignStudentsDialogProps> = ({
  open,
  onOpenChange,
  onAssignmentComplete
}) => {
  const { selectedInstitute, selectedClass, user } = useAuth();
  const { toast } = useToast();
  
  // Check permissions - InstituteAdmin and Teacher only
  const hasPermission = user?.role === 'InstituteAdmin' || user?.role === 'Teacher';
  
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);

  const getApiHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'ngrok-skip-browser-warning': 'true'
    };
  };

  const fetchAvailableStudents = async () => {
    if (!selectedInstitute?.id) return;

    setLoading(true);
    try {
      const response = await fetch(
        `${getBaseUrl()}/institute-users/institute/${selectedInstitute.id}/users/STUDENT`,
        { headers: getApiHeaders() }
      );
      
      if (response.ok) {
        const data: StudentsResponse = await response.json();
        setStudents(data.data);
        setDataLoaded(true);
      } else {
        throw new Error('Failed to fetch students');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast({
        title: "Error",
        description: "Failed to load available students",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(student => student.id));
    }
  };

  const handleAssignStudents = async () => {
    if (!selectedClass?.id || !selectedInstitute?.id || selectedStudentIds.length === 0) return;

    setAssigning(true);
    try {
      const assignData: BulkAssignStudentsData = {
        studentUserIds: selectedStudentIds,
        skipVerification: true,
        assignmentNotes: "Batch assignment for new students"
      };

      console.log('Assigning students to class:', {
        instituteId: selectedInstitute.id,
        classId: selectedClass.id,
        className: selectedClass.name,
        studentIds: assignData.studentUserIds
      });
      
      const result = await instituteClassesApi.teacherAssignStudents(selectedInstitute.id, selectedClass.id, assignData);
      console.log('Assignment result:', result);
      
      // Handle new API response format
      if (result && result.success) {
        const successCount = result.success.length;
        const failedCount = result.failed.length;
        
        if (failedCount === 0) {
          // All assignments succeeded
          toast({
            title: "Success!",
            description: `Successfully assigned ${successCount} student(s) to ${selectedClass.name}`
          });
          
          onAssignmentComplete();
          onOpenChange(false);
          setSelectedStudentIds([]);
        } else if (successCount > 0) {
          // Some succeeded, some failed
          toast({
            title: "Partial Success",
            description: `${successCount} students assigned successfully, ${failedCount} failed`,
          });
          
          if (result.failed.length > 0) {
            const failedStudentNames = result.failed.map(studentId => {
              const student = students.find(s => s.id === studentId);
              return student ? student.name : `Student ${studentId}`;
            }).join(', ');
            
            toast({
              title: "Failed Assignments",
              description: `Failed to assign: ${failedStudentNames}`,
              variant: "destructive"
            });
          }
          
          onAssignmentComplete();
          onOpenChange(false);
          setSelectedStudentIds([]);
        } else {
          // All failed
          toast({
            title: "Assignment Failed",
            description: "Failed to assign all selected students to the class",
            variant: "destructive"
          });
          
          setSelectedStudentIds([]);
        }
      } else {
        // Fallback
        toast({
          title: "Assignment Complete",
          description: "Students have been assigned to the class"
        });
        
        onAssignmentComplete();
        onOpenChange(false);
        setSelectedStudentIds([]);
      }
    } catch (error) {
      console.error('Error assigning students:', error);
      toast({
        title: "Network Error",
        description: "Failed to communicate with the server. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAssigning(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const name = student.name.toLowerCase();
    const email = (student.email || '').toLowerCase();
    return !searchTerm || 
           name.includes(searchTerm.toLowerCase()) || 
           email.includes(searchTerm.toLowerCase());
  });

  useEffect(() => {
    if (open && !dataLoaded && hasPermission) {
      fetchAvailableStudents();
    } else if (open && !hasPermission) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to assign students. This feature is only available for Institute Admins and Teachers.",
        variant: "destructive"
      });
      onOpenChange(false);
    }
  }, [open, dataLoaded, hasPermission]);

  useEffect(() => {
    if (!open) {
      setSearchTerm('');
      setSelectedStudentIds([]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign Students to Class
          </DialogTitle>
          <DialogDescription>
            Select students to assign to <strong>{selectedClass?.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Select All */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleSelectAll}
              disabled={filteredStudents.length === 0}
            >
              {selectedStudentIds.length === filteredStudents.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          {/* Selected Count */}
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {selectedStudentIds.length} Selected
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {filteredStudents.length} Available
            </Badge>
          </div>

          {/* Students List */}
          <ScrollArea className="h-96">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading students...</span>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Students Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? 'No students match your search.' : 'No students available.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleStudentToggle(student.id)}
                  >
                    <Checkbox
                      checked={selectedStudentIds.includes(student.id)}
                      onChange={() => handleStudentToggle(student.id)}
                    />
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={student.imageUrl || ''} alt={student.name} />
                      <AvatarFallback>
                        {student.name.split(' ').map(n => n.charAt(0)).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{student.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {student.email || 'No email'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">ID: {student.id}</p>
                      {student.phoneNumber && (
                        <p className="text-sm text-muted-foreground">{student.phoneNumber}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAssignStudents}
            disabled={selectedStudentIds.length === 0 || assigning}
          >
            {assigning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Assigning...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Assign {selectedStudentIds.length} Students
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AssignStudentsDialog;