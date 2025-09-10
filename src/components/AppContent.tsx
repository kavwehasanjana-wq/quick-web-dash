import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import Dashboard from '@/components/Dashboard';
import Users from '@/components/Users';
import Students from '@/components/Students';
import Teachers from '@/components/Teachers';
import Parents from '@/components/Parents';
import ChildAttendance from '@/components/ChildAttendance';
import ChildResults from '@/components/ChildResults';

import Grades from '@/components/Grades';
import Classes from '@/components/Classes';
import Subjects from '@/components/Subjects';
import Institutes from '@/components/Institutes';
import Grading from '@/components/Grading';
import Attendance from '@/components/Attendance';
import NewAttendance from '@/components/NewAttendance';
import MyAttendance from '@/components/MyAttendance';
import AttendanceMarking from '@/components/AttendanceMarking';
import AttendanceMarkers from '@/components/AttendanceMarkers';
import QRAttendance from '@/components/QRAttendance';
import RFIDAttendance from '@/pages/RFIDAttendance';
import Lectures from '@/components/Lectures';
import LiveLectures from '@/components/LiveLectures';
import Homework from '@/components/Homework';
import Exams from '@/components/Exams';
import Results from '@/components/Results';
import Profile from '@/components/Profile';
import InstituteDetails from '@/components/InstituteDetails';
import Login from '@/components/Login';
import InstituteSelector from '@/components/InstituteSelector';
import ClassSelector from '@/components/ClassSelector';
import SubjectSelector from '@/components/SubjectSelector';
import ParentChildrenSelector from '@/components/ParentChildrenSelector';
import Organizations from '@/components/Organizations';
import Gallery from '@/components/Gallery';
import Settings from '@/components/Settings';
import Appearance from '@/components/Appearance';
import OrganizationHeader from '@/components/OrganizationHeader';
import OrganizationLogin from '@/components/OrganizationLogin';
import OrganizationSelector from '@/components/OrganizationSelector';
import CreateOrganizationForm from '@/components/forms/CreateOrganizationForm';
import OrganizationManagement from '@/components/OrganizationManagement';
import OrganizationCourses from '@/components/OrganizationCourses';
import OrganizationLectures from '@/components/OrganizationLectures';
import TeacherStudents from '@/components/TeacherStudents';
import TeacherHomework from '@/components/TeacherHomework';
import TeacherExams from '@/components/TeacherExams';
import TeacherLectures from '@/components/TeacherLectures';
import AttendanceMarkerSubjectSelector from '@/components/AttendanceMarkerSubjectSelector';
import UnverifiedStudents from '@/components/UnverifiedStudents';
import EnrollClass from '@/components/EnrollClass';
import EnrollSubject from '@/components/EnrollSubject';
import InstituteUsers from '@/components/InstituteUsers';
import SetupGuide from '@/components/SetupGuide';

interface AppContentProps {
  initialPage?: string;
}

const AppContent = ({ initialPage }: AppContentProps) => {
  const { user, login, selectedInstitute, selectedClass, selectedSubject, selectedChild, selectedOrganization, setSelectedOrganization, currentInstituteId } = useAuth();
  const { navigateToPage, getPageFromPath } = useAppNavigation();
  const location = useLocation();
  
  // Initialize currentPage from URL or prop
  const [currentPage, setCurrentPageState] = useState(() => {
    return initialPage || getPageFromPath(location.pathname);
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [organizationLoginData, setOrganizationLoginData] = useState<any>(null);
  const [showCreateOrgForm, setShowCreateOrgForm] = useState(false);
  const [organizationCurrentPage, setOrganizationCurrentPage] = useState('organizations');

  // Update currentPage when URL changes
  useEffect(() => {
    const pageFromPath = getPageFromPath(location.pathname);
    if (pageFromPath !== currentPage) {
      setCurrentPageState(pageFromPath);
    }
  }, [location.pathname, currentPage, getPageFromPath]);

  const setCurrentPage = (page: string) => {
    setCurrentPageState(page);
    navigateToPage(page);
  };

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  const handleOrganizationLogin = (loginResponse: any) => {
    console.log('Organization login successful:', loginResponse);
    setOrganizationLoginData(loginResponse);
    setOrganizationCurrentPage('organizations');
  };

  const handleOrganizationSelect = (organization: any) => {
    console.log('Organization selected:', organization);
    setSelectedOrganization(organization);
    
    // Switch to using baseUrl2 for organization-specific API calls
    import('@/api/client').then(({ apiClient }) => {
      apiClient.setUseBaseUrl2(true);
    });
    
    setCurrentPage('dashboard');
  };

  const handleBackToOrganizationSelector = () => {
    setCurrentPage('organization-selector');
  };

  const handleBackToMain = () => {
    setOrganizationLoginData(null);
    setOrganizationCurrentPage('organizations');
    
    // Switch back to using baseUrl for main API calls
    import('@/api/client').then(({ apiClient }) => {
      apiClient.setUseBaseUrl2(false);
    });
    
    setCurrentPage('dashboard');
  };

  const handleCreateOrganization = () => {
    setShowCreateOrgForm(true);
  };

  const handleCreateOrganizationSuccess = (organization: any) => {
    console.log('Organization created successfully:', organization);
    setShowCreateOrgForm(false);
    setCurrentPage('organization-selector');
  };

  const handleCreateOrganizationCancel = () => {
    setShowCreateOrgForm(false);
  };

  // Organization-specific navigation component
  const OrganizationNavigation = () => {
    if (!organizationLoginData) return null;

    const userRole = user?.role;
    const isOrganizationManager = userRole === 'OrganizationManager';
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    const navigationItems = [
      {
        id: 'organizations',
        label: 'Select Organizations',
        icon: '🏢',
        visible: true
      },
      {
        id: 'courses',
        label: 'Courses',
        icon: '📚',
        visible: isOrganizationManager
      },
      {
        id: 'lectures',
        label: 'Lectures',
        icon: '🎓',
        visible: isOrganizationManager
      },
      {
        id: 'profile',
        label: 'Profile',
        icon: '👤',
        visible: true
      },
      {
        id: 'appearance',
        label: 'Appearance',
        icon: '🎨',
        visible: true
      }
    ];

    const handleNavigation = (pageId: string) => {
      setOrganizationCurrentPage(pageId);
      setIsSidebarOpen(false); // Close mobile sidebar after navigation
    };
    
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between p-4">
            <h2 className="font-bold text-lg text-gray-900 dark:text-white">Organization Portal</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleBackToMain}>
                Back
              </Button>
            </div>
          </div>
        </div>

        <div className="flex w-full min-h-screen lg:h-screen">
          {/* Mobile Overlay */}
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Organization Sidebar */}
          <div className={`
            fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col
            transform transition-transform duration-300 ease-in-out lg:translate-x-0
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:w-64 lg:flex
          `}>
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">Organization Portal</h2>
              <Button variant="ghost" size="sm" onClick={handleBackToMain}>
                Back
              </Button>
            </div>

            {/* Mobile Header in Sidebar */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">Navigation</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(false)}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            </div>
            
            {/* Navigation Items */}
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-2">
                {navigationItems.filter(item => item.visible).map((item) => (
                  <Button
                    key={item.id}
                    variant={organizationCurrentPage === item.id ? 'default' : 'ghost'}
                    className="w-full justify-start text-left"
                    onClick={() => handleNavigation(item.id)}
                  >
                    <span className="mr-3 text-base">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Mobile Back Button */}
            <div className="lg:hidden p-4 border-t border-gray-200 dark:border-gray-700">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleBackToMain}
              >
                Back to Main
              </Button>
            </div>
          </div>
          
          {/* Organization Content */}
          <div className="flex-1 overflow-auto">
            {/* Content Wrapper with responsive padding */}
            <div className="p-4 sm:p-6 lg:p-8 max-w-full">
              {organizationCurrentPage === 'organizations' && (
                <OrganizationManagement
                  userRole={userRole || 'Student'}
                  userPermissions={organizationLoginData?.permissions}
                  currentInstituteId={currentInstituteId || undefined}
                />
              )}
              {organizationCurrentPage === 'courses' && isOrganizationManager && (
                <OrganizationCourses />
              )}
              {organizationCurrentPage === 'lectures' && isOrganizationManager && (
                <OrganizationLectures />
              )}
              {organizationCurrentPage === 'profile' && <Profile />}
              {organizationCurrentPage === 'appearance' && <Appearance />}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderComponent = () => {
    // Handle organization-related pages
    if (currentPage === 'organizations') {
      if (showCreateOrgForm) {
        return (
          <CreateOrganizationForm
            onSuccess={handleCreateOrganizationSuccess}
            onCancel={handleCreateOrganizationCancel}
          />
        );
      }
      
      // Show organization login for all specified user roles
      if (!organizationLoginData && ['InstituteAdmin', 'Student', 'Teacher', 'OrganizationManager'].includes(user?.role || '')) {
        return (
          <OrganizationLogin
            onLogin={handleOrganizationLogin}
            onBack={handleBackToMain}
          />
        );
      }
      
      // Show organization navigation after login
      if (organizationLoginData) {
        return <OrganizationNavigation />;
      }
      
      if (!selectedOrganization) {
        return (
          <OrganizationSelector
            onOrganizationSelect={handleOrganizationSelect}
            onBack={handleBackToMain}
            onCreateOrganization={handleCreateOrganization}
            userPermissions={organizationLoginData?.permissions}
          />
        );
      }
    }

    if (currentPage === 'organization-selector') {
      return (
        <OrganizationSelector
          onOrganizationSelect={handleOrganizationSelect}
          onBack={handleBackToMain}
          onCreateOrganization={handleCreateOrganization}
          userPermissions={organizationLoginData?.permissions}
        />
      );
    }

    // For Organization Manager - show organizations list or organization-specific dashboard
    if (user?.role === 'OrganizationManager') {
      if (!selectedOrganization && currentPage !== 'organizations') {
        return <Organizations />;
      }

      // Add Organization Header for specific sections
      const shouldShowOrgHeader = ['dashboard', 'students', 'lectures', 'gallery'].includes(currentPage);
      
      const getPageTitle = () => {
        switch (currentPage) {
          case 'dashboard': return 'Dashboard';
          case 'students': return 'Students';
          case 'lectures': return 'Lectures';
          case 'gallery': return 'Gallery';
          default: return 'Management';
        }
      };

      const renderWithHeader = (component: React.ReactNode) => (
        <>
          {shouldShowOrgHeader && <OrganizationHeader title={getPageTitle()} />}
          {component}
        </>
      );

      switch (currentPage) {
        case 'organizations':
          return <Organizations />;
        case 'dashboard':
          return renderWithHeader(<Dashboard />);
        case 'students':
          return renderWithHeader(<Students />);
        case 'lectures':
          return renderWithHeader(<Lectures />);
        case 'gallery':
          return renderWithHeader(<Gallery />);
        case 'appearance':
          return <Appearance />;
        case 'profile':
          return <Profile />;
        case 'settings':
          return <Settings />;
        default:
          return <Dashboard />;
      }
    }

    // For Student role - simplified interface
    if (user?.role === 'Student') {
      if (!selectedInstitute && user.institutes.length === 1) {
        // Auto-select the only institute available
        // This should be handled by the auth context
      }
      
      if (!selectedInstitute && currentPage !== 'institutes' && currentPage !== 'select-institute') {
        return <InstituteSelector />;
      }

      switch (currentPage) {
        case 'dashboard':
          return <Dashboard />;
        case 'enroll-class':
          console.log('Student: Rendering EnrollClass component');
          return <EnrollClass />;
        case 'enroll-subject':
          console.log('Student: Rendering EnrollSubject component');
          return <EnrollSubject />;
        case 'my-attendance':
          console.log('Student: Rendering MyAttendance component');
          return <MyAttendance />;
        case 'lectures':
          return <Lectures />;
        case 'homework':
          return <Homework />;
        case 'exams':
          return <Exams />;
        case 'results':
          return <Results />;
        case 'profile':
          return <Profile />;
        case 'select-institute':
          return <InstituteSelector />;
        case 'appearance':
          return <Appearance />;
        case 'organizations':
          return renderComponent();
        default:
          return <Dashboard />;
      }
    }

    // For Parent role
    if (user?.role === 'Parent') {
      if (currentPage === 'parents') {
        return <ParentChildrenSelector />;
      }

      if (!selectedChild && currentPage !== 'parents' && currentPage !== 'profile' && currentPage !== 'appearance') {
        return <ParentChildrenSelector />;
      }

      // For Parent role, when "Select Institute" is clicked (dashboard page), 
      // use InstituteSelector but pass the selected child's ID
      if (currentPage === 'dashboard' && selectedChild && !selectedInstitute) {
        return <InstituteSelector useChildId={true} />;
      }

      switch (currentPage) {
        case 'dashboard':
          return <Dashboard />;
        case 'attendance':
          return <Attendance />;
        case 'homework':
          return <Homework />;
        case 'results':
          return <Results />;
        case 'exams':
          return <Exams />;
        case 'profile':
          return <Profile />;
        case 'child-attendance':
          return <ChildAttendance />;
        case 'child-results':
          return <ChildResults />;
        case 'parents':
          return <ParentChildrenSelector />;
        case 'appearance':
          return <Appearance />;
        default:
          return <ParentChildrenSelector />;
      }
    }

    // For Teacher role
    if (user?.role === 'Teacher') {
      if (!selectedInstitute && currentPage !== 'institutes' && currentPage !== 'select-institute') {
        return <InstituteSelector />;
      }

      if (currentPage === 'select-class') {
        return <ClassSelector />;
      }

      if (currentPage === 'select-subject') {
        return <SubjectSelector />;
      }

      const classRequiredPages = ['attendance-marking', 'grading'];
      if (selectedInstitute && !selectedClass && classRequiredPages.includes(currentPage)) {
        return <ClassSelector />;
      }

      const subjectRequiredPages = ['lectures'];
      if (selectedClass && !selectedSubject && subjectRequiredPages.includes(currentPage)) {
        return <SubjectSelector />;
      }

      switch (currentPage) {
        case 'dashboard':
          return <Dashboard />;
        case 'students':
          return <Students />;
        case 'unverified-students':
          return <UnverifiedStudents />;
        case 'parents':
          return <Parents />;
        case 'classes':
          return <Classes />;
        case 'subjects':
          return <Subjects />;
        case 'select-institute':
          return <InstituteSelector />;
        case 'grading':
        case 'grades-table':
        case 'create-grade':
        case 'assign-grade-classes':
        case 'view-grade-classes':
          return <Grading />;
        case 'attendance':
          return <Attendance />;
        case 'daily-attendance':
          return <NewAttendance />;
        case 'attendance-marking':
          return <AttendanceMarking onNavigate={setCurrentPage} />;
        case 'qr-attendance':
          return <QRAttendance />;
        case 'rfid-attendance':
          return <RFIDAttendance />;
        case 'lectures':
          return user?.role === 'Teacher' ? <TeacherLectures /> : <Lectures />;
        case 'homework':
          return user?.role === 'Teacher' ? <TeacherHomework /> : <Homework />;
        case 'exams':
          return user?.role === 'Teacher' ? <TeacherExams /> : <Exams />;
        case 'results':
          return <Results />;
        case 'profile':
          return <Profile />;
        case 'appearance':
          return <Appearance />;
        default:
          return <Dashboard />;
      }
    }

    // For AttendanceMarker role
    if (user?.role === 'AttendanceMarker') {
      if (!selectedInstitute && currentPage !== 'select-institute') {
        return <InstituteSelector />;
      }

      if (currentPage === 'select-class') {
        return <ClassSelector />;
      }

      if (currentPage === 'select-subject') {
        return <AttendanceMarkerSubjectSelector />;
      }

      switch (currentPage) {
        case 'dashboard':
          return <Dashboard />;
        case 'qr-attendance':
          return <QRAttendance />;
        case 'rfid-attendance':
          return <RFIDAttendance />;
        case 'attendance-marking':
          return <AttendanceMarking onNavigate={setCurrentPage} />;
        case 'profile':
          return <Profile />;
        case 'select-institute':
          return <InstituteSelector />;
        case 'select-class':
          return <ClassSelector />;
        case 'appearance':
          return <Appearance />;
        case 'settings':
          return <Settings />;
        default:
          return <QRAttendance />;
      }
    }

    // For InstituteAdmin and other roles - full access within their institute
    if (!selectedInstitute && currentPage !== 'institutes' && currentPage !== 'select-institute') {
      return <InstituteSelector />;
    }

    if (currentPage === 'select-class') {
      return <ClassSelector />;
    }

    if (currentPage === 'select-subject') {
      return <SubjectSelector />;
    }

    const classRequiredPages = ['attendance-marking', 'grading'];
    if (selectedInstitute && !selectedClass && classRequiredPages.includes(currentPage)) {
      return <ClassSelector />;
    }

    const subjectRequiredPages = ['lectures'];
    if (selectedClass && !selectedSubject && subjectRequiredPages.includes(currentPage)) {
      return <SubjectSelector />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'institute-users':
        return <InstituteUsers />;
      case 'users':
        // Show InstituteUsers for InstituteAdmin
        if (user?.role === 'InstituteAdmin') {
          return <InstituteUsers />;
        }
        return <Users />;
      case 'students':
         return <Students />;
      case 'unverified-students':
        return <UnverifiedStudents />;
      case 'enroll-class':
        console.log('Rendering EnrollClass component for Student');
        return <EnrollClass />;
      case 'enroll-subject':
        console.log('Rendering EnrollSubject component for Student');
        return <EnrollSubject />;
      case 'teachers':
        return <Teachers />;
      case 'parents':
        return <Parents />;
      case 'grades':
        return <Grades />;
      case 'classes':
        return <Classes />;
      case 'subjects':
        return <Subjects />;
      case 'institutes':
        return <Institutes />;
      case 'select-institute':
        return <InstituteSelector />;
      case 'grading':
      case 'grades-table':
      case 'create-grade':
      case 'assign-grade-classes':
      case 'view-grade-classes':
        return <Grading />;
      case 'attendance':
        return <Attendance />;
      case 'daily-attendance':
        return <NewAttendance />;
      case 'attendance-marking':
        return <AttendanceMarking onNavigate={setCurrentPage} />;
      case 'attendance-markers':
        return <AttendanceMarkers />;
      case 'qr-attendance':
        return <QRAttendance />;
      case 'rfid-attendance':
        return <RFIDAttendance />;
      case 'lectures':
        return <Lectures />;
      case 'homework':
        return <Homework />;
      case 'exams':
        return <Exams />;
      case 'results':
        return <Results />;
      case 'teacher-students':
        return <TeacherStudents />;
      case 'teacher-homework':
        return <TeacherHomework />;
      case 'teacher-exams':
        return <TeacherExams />;
      case 'teacher-lectures':
        return <TeacherLectures />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      case 'setup-guide':
        return <SetupGuide />;
      case 'institute-details':
        return <InstituteDetails />;
      case 'appearance':
        return <Appearance />;
      default:
        return <Dashboard />;
    }
  };

  if (!user) {
    return <Login onLogin={() => {}} loginFunction={login} />;
  }

  // If organizations page is active with login data, render organization navigation
  if (currentPage === 'organizations' && organizationLoginData) {
    return renderComponent();
  }

  // If organizations page is active without login data, render full screen
  if (currentPage === 'organizations' && !selectedOrganization && !organizationLoginData) {
    return renderComponent();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="flex w-full h-screen">
        <Sidebar 
          isOpen={isSidebarOpen}
          onClose={handleSidebarClose}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Header onMenuClick={handleMenuClick} />
          <main className="flex-1 overflow-auto p-3 sm:p-4 lg:p-6">
            <div className="max-w-full">
              {renderComponent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AppContent;
