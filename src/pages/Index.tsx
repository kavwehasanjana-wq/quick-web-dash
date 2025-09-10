
import React from 'react';
import { useLocation } from 'react-router-dom';
import AppContent from '@/components/AppContent';

const Index = () => {
  const location = useLocation();
  console.log('Index component rendering, current path:', location.pathname);
  
  // Extract page name from URL path
  const getPageFromPath = () => {
    const pathname = location.pathname;
    console.log('Converting pathname to page:', pathname);
    if (pathname === '/') return 'dashboard';
    
    // Handle nested routes
    if (pathname.startsWith('/institutes/')) {
      const parts = pathname.split('/');
      if (parts[2] === 'users') return 'institute-users';
      if (parts[2] === 'classes') return 'classes';
      return 'institutes';
    }
    
    // Remove leading slash and use as page name
    const pageName = pathname.slice(1);
    console.log('Final page name:', pageName);
    return pageName;
  };
  
  const currentPage = getPageFromPath();
  
  return <AppContent initialPage={currentPage} />;
};

export default Index;
