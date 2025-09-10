import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import Sidebar from './Sidebar';
import Header from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
  onPageChange?: (page: string) => void;
}

const AppLayout = ({ children, currentPage: propCurrentPage, onPageChange }: AppLayoutProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { navigateToPage } = useAppNavigation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Determine current page based on URL if not provided
  const getCurrentPage = () => {
    if (propCurrentPage) return propCurrentPage;
    
    const path = location.pathname;
    if (path.startsWith('/payments')) return 'system-payment';
    return 'dashboard';
  };

  const currentPage = getCurrentPage();

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handlePageChange = (page: string) => {
    if (onPageChange) {
      onPageChange(page);
    } else if (page === 'system-payment') {
      navigate('/payments');
    } else {
      navigateToPage(page);
    }
    setIsSidebarOpen(false);
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex w-full">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={handleSidebarClose}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
        
        <div className="flex-1 min-h-screen">
          <Header onMenuClick={handleMenuClick} />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;