import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useApiRequest } from '@/hooks/useApiRequest';
import { instituteClassesApi, type InstituteClass, type EnrollClassData } from '@/api/instituteClasses.api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Users, Calendar, MapPin, GraduationCap, Clock } from 'lucide-react';

const enrollFormSchema = z.object({
  enrollmentCode: z.string().min(1, 'Enrollment code is required'),
});

type EnrollFormValues = z.infer<typeof enrollFormSchema>;

const EnrollClass = () => {
  const { selectedInstitute, user } = useAuth();
  const [classes, setClasses] = useState<InstituteClass[]>([]);
  const [hasData, setHasData] = useState(false);
  const [selectedClass, setSelectedClass] = useState<InstituteClass | null>(null);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);

  console.log('EnrollClass component rendered', { 
    selectedInstitute, 
    user: user?.role, 
    classes: classes?.length,
    hasData,
    classesArray: classes
  });

  const { execute: loadClasses, loading: loadingClasses } = useApiRequest(
    instituteClassesApi.getByInstitute
  );

  const { execute: enrollInClass, loading: enrolling } = useApiRequest(
    instituteClassesApi.enroll
  );

  const form = useForm<EnrollFormValues>({
    resolver: zodResolver(enrollFormSchema),
    defaultValues: {
      enrollmentCode: '',
    },
  });

  const handleLoadClasses = async () => {
    console.log('🚀 Load Classes button clicked!');
    console.log('Selected Institute:', selectedInstitute);
    
    if (!selectedInstitute) {
      console.log('❌ No institute selected');
      toast.error('Please select an institute first');
      return;
    }

    console.log('✅ Making API call to load classes...');

    try {
      console.log('🚀 About to call API with institute ID:', selectedInstitute.id);
      const data = await loadClasses(selectedInstitute.id);
      console.log('🔍 RECEIVED DATA:', data);
      
      if (!data) {
        console.log('❌ No data received from API');
        toast.error('No data received from server');
        return;
      }
      
      // Convert the backend object format to array
      let classesArray: InstituteClass[] = [];
      
      if (Array.isArray(data)) {
        console.log('✅ Data is array');
        classesArray = data;
      } else if (data && typeof data === 'object') {
        console.log('✅ Data is object, extracting values');
        // Handle object with numbered keys (0, 1, 2, etc.) and filter out non-class properties
        const allValues = Object.values(data).filter(item => 
          item && 
          typeof item === 'object' && 
          'id' in item && 
          'name' in item &&
          'instituteId' in item &&
          !('data' in item) && // Exclude pagination metadata
          !('_truncated' in item) // Exclude response metadata
        );
        console.log('📋 Filtered class objects:', allValues);
        
        classesArray = allValues as InstituteClass[];
      }
      
      console.log('🎯 Final array length:', classesArray.length);
      console.log('🎯 Final array:', classesArray);
      
      if (classesArray.length > 0) {
        console.log('✅ Setting classes in state');
        setClasses(classesArray);
        setHasData(true);
        toast.success(`Found ${classesArray.length} available classes`);
      } else {
        console.log('❌ No valid classes found in response');
        setClasses([]);
        setHasData(true); // Still show the section but with "no classes" message
        toast.error('No classes found');
      }
    } catch (error) {
      console.error('❌ Error loading classes:', error);
      toast.error('Failed to load classes');
      setHasData(false);
    }
  };

  const handleEnrollClick = (classItem: InstituteClass) => {
    setSelectedClass(classItem);
    form.reset({ enrollmentCode: classItem.enrollmentCode || '' });
    setEnrollDialogOpen(true);
  };

  const onSubmit = async (values: EnrollFormValues) => {
    if (!selectedClass) return;

    try {
      const enrollData: EnrollClassData = {
        classId: selectedClass.id,
        enrollmentCode: values.enrollmentCode,
      };

      const result = await enrollInClass(enrollData);
      console.log('Enrollment result:', result);
      
      // Close the dialog first
      setEnrollDialogOpen(false);
      
      // Show appropriate message based on verification requirements
      if (result.requiresVerification) {
        toast.success(result.message || "Enrollment submitted. Waiting for teacher verification.");
      } else {
        toast.success(result.message || "Successfully enrolled in class!");
      }
      
      // Refresh classes to show updated enrollment status
      handleLoadClasses();
    } catch (error) {
      console.error('Error enrolling in class:', error);
      toast.error('Failed to enroll in class');
    }
  };

  // Only show for students
  if (user?.role !== 'Student') {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive">Access Denied</h2>
          <p className="text-muted-foreground">This section is only available for students.</p>
        </div>
      </div>
    );
  }

  if (!selectedInstitute) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">No Institute Selected</h2>
          <p className="text-muted-foreground">Please select an institute to view available classes.</p>
        </div>
      </div>
    );
  }

  console.log('🏗️ About to render main component - hasData:', hasData, 'classes:', (classes || []).length);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Enroll in Classes</h1>
        <p className="text-muted-foreground">
          Current Selection - Institute: {selectedInstitute?.name || 'Unknown'}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Browse and enroll in available classes
        </p>
      </div>

      <div className="mb-6">
        <Button
          onClick={() => {
            console.log('🔥 BUTTON CLICKED!');
            handleLoadClasses();
          }}
          disabled={loadingClasses}
          size="lg"
          className="w-full sm:w-auto"
        >
          {loadingClasses ? 'Loading Classes...' : 'Load Available Classes'}
        </Button>
      </div>

      {hasData && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Available Classes ({(classes || []).length})</h2>
          </div>

          {(classes || []).length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto max-w-md">
                <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No Classes Available</h3>
                <p className="mt-2 text-muted-foreground">
                  There are currently no classes available for enrollment at this institute.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(classes || []).map((classItem) => (
                <Card key={classItem.id} className="overflow-hidden hover:shadow-lg transition-all duration-200">
                  <div className="relative">
                    {classItem.imageUrl && (
                      <img 
                        src={classItem.imageUrl} 
                        alt={classItem.name}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge variant={classItem.isActive ? 'default' : 'secondary'}>
                        {classItem.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <div className="space-y-1">
                      <CardTitle className="text-lg leading-tight">{classItem.name}</CardTitle>
                      <CardDescription className="font-medium">{classItem.code}</CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {classItem.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {classItem.description}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span>Grade {classItem.grade} - Level {classItem.level}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{classItem.specialty}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Capacity: {classItem.capacity} students</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{classItem.academicYear}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{classItem.startDate} to {classItem.endDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t">
                      <Badge variant="outline" className="text-xs">
                        {classItem.classType}
                      </Badge>
                      <Button 
                        onClick={() => handleEnrollClick(classItem)}
                        disabled={!classItem.enrollmentEnabled || !classItem.isActive}
                        size="sm"
                        className="min-w-[80px]"
                      >
                        {!classItem.isActive 
                          ? 'Inactive' 
                          : !classItem.enrollmentEnabled 
                          ? 'Closed' 
                          : 'Enroll'
                        }
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enroll in {selectedClass?.name}</DialogTitle>
            <DialogDescription>
              Enter the enrollment code to join this class. You can get this code from your teacher or institute.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="enrollmentCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Enrollment Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter enrollment code" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedClass?.requireTeacherVerification && (
                <div className="rounded-md bg-muted p-3">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> This class requires teacher verification. 
                    Your enrollment will be pending until approved.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEnrollDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={enrolling}>
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnrollClass;