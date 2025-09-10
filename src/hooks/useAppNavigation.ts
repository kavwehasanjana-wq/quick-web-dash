
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

export const useAppNavigation = () => {
  const navigate = useNavigate();

  const navigateToPage = useCallback((page: string) => {
    console.log('Navigating to page:', page);
    
    // Map internal page names to URL routes
    const routeMap: Record<string, string> = {
      'dashboard': '/',
      'institutes': '/institutes',
      'institute-users': '/institutes/users', 
      'institute-classes': '/institutes/classes',
      'organizations': '/organizations',
      'profile': '/profile',
      'users': '/users',
      'students': '/students',
      'teachers': '/teachers',
      'parents': '/parents',
      'classes': '/classes',
      'subjects': '/subjects',
      'grades': '/grades',
      'grading': '/grading',
      'attendance': '/attendance',
      'my-attendance': '/my-attendance',
      'daily-attendance': '/daily-attendance',
      'attendance-marking': '/attendance-marking',
      'attendance-markers': '/attendance-markers',
      'qr-attendance': '/qr-attendance',
      'lectures': '/lectures',
      'live-lectures': '/live-lectures',
      'homework': '/homework',
      'homework-submissions': '/homework-submissions',
      'exams': '/exams',
      'results': '/results',
      'select-institute': '/select-institute',
      'select-class': '/select-class',
      'select-subject': '/select-subject',
      'parent-children': '/parent-children',
      'teacher-students': '/teacher-students',
      'teacher-homework': '/teacher-homework',
      'teacher-exams': '/teacher-exams',
      'teacher-lectures': '/teacher-lectures',
      'settings': '/settings',
      'appearance': '/appearance',
      'institute-details': '/institute-details',
      'gallery': '/gallery',
      'institute-payments': '/institute-payments',
      'subject-payments': '/subject-payments',
      'subject-pay-submission': '/subject-pay-submission',
      'unverified-students': '/unverified-students',
      'enroll-class': '/enroll-class',
      'enroll-subject': '/enroll-subject',
      'child-attendance': '/child-attendance',
      'child-results': '/child-results'
    };
    
    const route = routeMap[page] || `/${page}`;
    navigate(route);
  }, [navigate]);

  const getPageFromPath = useCallback((pathname: string): string => {
    // Handle root path
    if (pathname === '/') return 'dashboard';
    
    // Handle nested institute routes  
    if (pathname === '/institutes/users') return 'institute-users';
    if (pathname === '/institutes/classes') return 'institute-classes';
    
    // Handle subject payment submission route
    if (pathname === '/subject-pay-submission') return 'subject-pay-submission';
    
    // Remove leading slash for simple routes
    return pathname.slice(1);
  }, []);

  return {
    navigateToPage,
    getPageFromPath
  };
};
