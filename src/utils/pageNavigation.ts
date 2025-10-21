import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * 🔗 Page-Based Context Navigation Manager
 * 
 * Manages URL updates when context (institute/class/subject) changes
 * Works with existing page-based navigation system
 */

export const useContextUrlSync = (currentPage: string) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    selectedInstitute, 
    selectedClass, 
    selectedSubject,
    selectedChild,
    selectedOrganization,
    selectedTransport
  } = useAuth();

  useEffect(() => {
    // 🚫 DISABLED: Context-aware URLs causing 404 errors
    // The application uses page-based navigation internally
    // URLs remain simple (e.g., /classes instead of /institute/6/classes)
    // Context is maintained in AuthContext state
    
    console.log('📍 Current page:', currentPage, {
      institute: selectedInstitute?.name,
      class: selectedClass?.name,
      subject: selectedSubject?.name
    });
    
    // Only update URL to match simple page name if needed
    const simplePath = `/${currentPage}`;
    if (location.pathname !== simplePath && !location.pathname.includes(':')) {
      // Only update if not already on the right simple path
      // This prevents navigation loops
      const currentSimplePath = '/' + location.pathname.split('/').pop();
      if (currentSimplePath !== simplePath) {
        console.log('🔗 Updating URL to simple path:', simplePath);
        navigate(simplePath, { replace: true });
      }
    }
  }, [
    currentPage,
    selectedInstitute,
    selectedClass,
    selectedSubject,
    selectedChild,
    selectedOrganization,
    selectedTransport,
    navigate,
    location.pathname
  ]);
};

/**
 * Extract page name from context URL
 */
export const extractPageFromUrl = (pathname: string): string => {
  // Remove leading slash
  let path = pathname.startsWith('/') ? pathname.slice(1) : pathname;
  
  // Remove context segments
  path = path
    .replace(/^institute\/[^\/]+\/?/, '')
    .replace(/^class\/[^\/]+\/?/, '')
    .replace(/^subject\/[^\/]+\/?/, '')
    .replace(/^child\/[^\/]+\/?/, '')
    .replace(/^organization\/[^\/]+\/?/, '')
    .replace(/^transport\/[^\/]+\/?/, '');
  
  // If empty, return dashboard
  return path || 'dashboard';
};

/**
 * Parse context IDs from URL
 */
export const parseContextIds = (pathname: string): {
  instituteId?: string;
  classId?: string;
  subjectId?: string;
  childId?: string;
  organizationId?: string;
  transportId?: string;
} => {
  const parts = pathname.split('/').filter(Boolean);
  const context: any = {};
  
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const value = parts[i + 1];
    
    if (key === 'institute') context.instituteId = value;
    else if (key === 'class') context.classId = value;
    else if (key === 'subject') context.subjectId = value;
    else if (key === 'child') context.childId = value;
    else if (key === 'organization') context.organizationId = value;
    else if (key === 'transport') context.transportId = value;
  }
  
  return context;
};

/**
 * Build URL for sidebar navigation
 */
export const buildSidebarUrl = (
  page: string,
  context: {
    instituteId?: string;
    classId?: string;
    subjectId?: string;
    childId?: string;
    organizationId?: string;
    transportId?: string;
  }
): string => {
  let url = '';
  
  if (context.childId) {
    url = `/child/${context.childId}/${page}`;
  } else if (context.organizationId) {
    url = `/organization/${context.organizationId}/${page}`;
  } else if (context.transportId) {
    url = `/transport/${context.transportId}/${page}`;
  } else if (context.instituteId) {
    url = `/institute/${context.instituteId}`;
    
    if (context.classId) {
      url += `/class/${context.classId}`;
      
      if (context.subjectId) {
        url += `/subject/${context.subjectId}`;
      }
    }
    
    url += `/${page}`;
  } else {
    url = `/${page}`;
  }
  
  return url;
};

export default {
  useContextUrlSync,
  extractPageFromUrl,
  parseContextIds,
  buildSidebarUrl
};
