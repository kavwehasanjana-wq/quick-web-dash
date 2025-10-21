
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Phone, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getBaseUrl } from '@/contexts/utils/auth.api';

interface TeacherData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  imageUrl: string;
}

interface TeacherProfileProps {
  instituteId: string;
  classId: string;
  subjectId: string;
}

const TeacherProfile = ({ instituteId, classId, subjectId }: TeacherProfileProps) => {
  const { toast } = useToast();
  const [teacher, setTeacher] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(false);

  
  
  const getApiHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchTeacher = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${getBaseUrl()}/institute-class-subjects/institute/${instituteId}/class/${classId}/subject/${subjectId}/teacher`,
        { headers: getApiHeaders() }
      );
      
      if (response.ok) {
        const data = await response.json();
        setTeacher(data);
      } else {
        throw new Error('Failed to fetch teacher data');
      }
    } catch (error) {
      console.error('Error fetching teacher:', error);
      toast({
        title: "Error",
        description: "Failed to load teacher information",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (instituteId && classId && subjectId) {
      fetchTeacher();
    }
  }, [instituteId, classId, subjectId]);

  const handleEmailClick = () => {
    if (teacher?.email) {
      window.location.href = `mailto:${teacher.email}`;
    }
  };

  const handleCallClick = () => {
    if (teacher?.phone) {
      window.location.href = `tel:${teacher.phone}`;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subject Teacher</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-20 w-20 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!teacher) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subject Teacher</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center">No teacher assigned to this subject</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject Teacher</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <Avatar className="w-20 h-20 mx-auto mb-4">
          <AvatarImage src={teacher.imageUrl} alt={`${teacher.firstName} ${teacher.lastName}`} />
          <AvatarFallback>
            <User className="w-8 h-8" />
          </AvatarFallback>
        </Avatar>
        
        <h3 className="text-xl font-semibold mb-2">
          {teacher.firstName} {teacher.lastName}
        </h3>
        
        <div className="space-y-2 mb-4">
          <p className="text-gray-600">{teacher.email}</p>
          <p className="text-gray-600">{teacher.phone}</p>
        </div>
        
        <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={handleEmailClick}>
            <Mail className="w-4 h-4 mr-2" />
            Email
          </Button>
          <Button variant="outline" size="sm" onClick={handleCallClick}>
            <Phone className="w-4 h-4 mr-2" />
            Call
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeacherProfile;
