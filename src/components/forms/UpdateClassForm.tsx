import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { instituteClassesApi, InstituteClassCreateData } from '@/api/instituteClasses.api.ts';
import { Loader2, Upload } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getBaseUrl } from '@/contexts/utils/auth.api';

const updateClassSchema = z.object({
  instituteId: z.string().min(1, 'Institute ID is required'),
  name: z.string().min(1, 'Class name is required'),
  code: z.string().min(1, 'Class code is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
  level: z.number().min(1, 'Level must be at least 1'),
  grade: z.number().min(1, 'Grade must be at least 1'),
  specialty: z.string().min(1, 'Specialty is required'),
  classType: z.string().min(1, 'Class type is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  classTeacherId: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  enrollmentCode: z.string().optional(),
  enrollmentEnabled: z.boolean(),
  requireTeacherVerification: z.boolean(),
});

type UpdateClassFormData = z.infer<typeof updateClassSchema>;

interface UpdateClassFormProps {
  classData: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const UpdateClassForm: React.FC<UpdateClassFormProps> = ({ classData, onSubmit, onCancel }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const form = useForm<UpdateClassFormData>({
    resolver: zodResolver(updateClassSchema),
    defaultValues: {
      instituteId: classData.instituteId || '',
      name: classData.name || '',
      code: classData.code || '',
      academicYear: classData.academicYear || '',
      level: classData.level || 1,
      grade: classData.grade || 1,
      specialty: classData.specialty || '',
      classType: classData.classType || '',
      capacity: classData.capacity || 1,
      classTeacherId: classData.classTeacherId || '',
      description: classData.description || '',
      imageUrl: classData.imageUrl || '',
      isActive: classData.isActive ?? true,
      startDate: classData.startDate || '',
      endDate: classData.endDate || '',
      enrollmentCode: classData.enrollmentCode || '',
      enrollmentEnabled: classData.enrollmentEnabled ?? true,
      requireTeacherVerification: classData.requireTeacherVerification ?? true,
    },
  });

  const handleSubmit = async (data: UpdateClassFormData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('access_token');
      const formDataToSend = new FormData();
      
      formDataToSend.append('instituteId', data.instituteId);
      formDataToSend.append('name', data.name);
      formDataToSend.append('code', data.code);
      formDataToSend.append('academicYear', data.academicYear);
      formDataToSend.append('level', String(data.level));
      formDataToSend.append('grade', String(data.grade));
      formDataToSend.append('specialty', data.specialty);
      formDataToSend.append('classType', data.classType);
      formDataToSend.append('capacity', String(data.capacity));
      if (data.classTeacherId) formDataToSend.append('classTeacherId', data.classTeacherId);
      if (data.description) formDataToSend.append('description', data.description);
      formDataToSend.append('isActive', String(data.isActive));
      formDataToSend.append('startDate', new Date(data.startDate).toISOString());
      formDataToSend.append('endDate', new Date(data.endDate).toISOString());
      if (data.enrollmentCode) formDataToSend.append('enrollmentCode', data.enrollmentCode);
      formDataToSend.append('enrollmentEnabled', String(data.enrollmentEnabled));
      formDataToSend.append('requireTeacherVerification', String(data.requireTeacherVerification));
      if (selectedImage) formDataToSend.append('image', selectedImage);
      
      const response = await fetch(`${getBaseUrl()}/institute-classes/${classData.id}/upload-image`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update class');
      }
      
      const updatedClass = await response.json();
      
      toast({
        title: "Success",
        description: "Class updated successfully",
      });
      
      onSubmit(updatedClass);
    } catch (error) {
      console.error('Error updating class:', error);
      toast({
        title: "Error",
        description: "Failed to update class",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter class name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class Code</FormLabel>
                <FormControl>
                  <Input placeholder="Enter class code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="academicYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Academic Year</FormLabel>
                <FormControl>
                  <Input placeholder="2025-2026" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="grade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Grade</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter grade" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Level</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter level" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="specialty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specialty</FormLabel>
                <FormControl>
                  <Input placeholder="Enter specialty" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="classType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Regular">Regular</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                    <SelectItem value="Remedial">Remedial</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Enter capacity" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="classTeacherId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Class Teacher ID (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter teacher ID" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel>Class Image</FormLabel>
            <div className="space-y-2">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
              />
              {selectedImage && (
                <span className="text-xs text-muted-foreground">
                  Selected: {selectedImage.name}
                </span>
              )}
              {!selectedImage && classData.imageUrl && (
                <span className="text-xs text-muted-foreground">
                  Current: {classData.imageUrl}
                </span>
              )}
            </div>
          </div>

          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(new Date(field.value), "PPP") : <span>Start Date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(new Date(field.value), "PPP") : <span>End Date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enrollmentCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Enrollment Code (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter enrollment code" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter class description" 
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Active Status</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Enable or disable this class
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="enrollmentEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Enrollment Enabled</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Allow student enrollment
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="requireTeacherVerification"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Teacher Verification</FormLabel>
                  <div className="text-sm text-muted-foreground">
                    Require teacher approval
                  </div>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Class'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default UpdateClassForm;