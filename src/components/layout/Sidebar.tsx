import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { AccessControl } from '@/utils/permissions';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  School,
  ClipboardList,
  BarChart3,
  Settings,
  User,
  Building2,
  QrCode,
  X,
  Award,
  Video,
  LogOut,
  Menu,
  FileText,
  ArrowLeft,
  Notebook,
  Images,
  Palette,
  CreditCard,
  Camera,
  AlertCircle
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar = ({ isOpen, onClose, currentPage, onPageChange }: SidebarProps) => {
  const { user, selectedInstitute, selectedClass, selectedSubject, selectedChild, selectedOrganization, logout, setSelectedInstitute, setSelectedClass, setSelectedSubject, setSelectedChild, setSelectedOrganization } = useAuth();
  const navigate = useNavigate();

  // Get menu items based on current selection state
  const getMenuItems = () => {
    // Special handling for organization selection
    if (selectedOrganization) {
      return [
        {
          id: 'organizations',
          label: 'Select Organizations',
          icon: Building2,
          permission: 'view-organizations',
          alwaysShow: true
        },
        {
          id: 'organization-gallery',
          label: 'Gallery',
          icon: Camera,
          permission: 'view-organizations',
          alwaysShow: true
        },
        {
          id: 'organization-courses', 
          label: 'Courses',
          icon: BookOpen,
          permission: 'view-organizations',
          alwaysShow: true
        }
      ];
    }

    // Special handling for Student role
    if (user?.role === 'Student') {
      // 1. Student without institute - only show basic options + payment
      if (!selectedInstitute) {
        return [
          {
            id: 'dashboard',
            label: 'Select Institutes',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'organizations',
            label: 'Organizations',
            icon: Building2,
            permission: 'view-organizations',
            alwaysShow: true
          }
        ];
      }

      // 2. Student with institute selected (but no class)
      if (selectedInstitute && !selectedClass) {
        return [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'my-attendance',
            label: 'My Attendance',
            icon: UserCheck,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'enroll-class',
            label: 'Enroll Class',
            icon: School,
            permission: 'view-dashboard',
            alwaysShow: false
          }
        ];
      }

      // 3. Student with institute and class selected (but no subject)
      if (selectedInstitute && selectedClass && !selectedSubject) {
        return [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'enroll-subject',
            label: 'Enroll Subject',
            icon: BookOpen,
            permission: 'view-dashboard',
            alwaysShow: false
          }
        ];
      }

      // 4. Student with institute, class, and subject all selected
      if (selectedInstitute && selectedClass && selectedSubject) {
        return [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'lectures',
            label: 'Lectures',
            icon: Video,
            permission: 'view-lectures',
            alwaysShow: false
          },
          {
            id: 'homework',
            label: 'Homework',
            icon: Notebook,
            permission: 'view-homework',
            alwaysShow: false
          },
          {
            id: 'exams',
            label: 'Exams',
            icon: Award,
            permission: 'view-exams',
            alwaysShow: false
          },
          {
            id: 'results',
            label: 'Results',
            icon: ClipboardList,
            permission: 'view-results',
            alwaysShow: false
          },
          {
            id: 'subject-payments',
            label: 'Subject Payments',
            icon: CreditCard,
            permission: 'view-payments',
            alwaysShow: false
          },
          {
            id: 'subject-submissions',
            label: 'Subject Submissions',
            icon: FileText,
            permission: 'view-submissions',
            alwaysShow: false
          }
        ];
      }
    }

    // Special handling for Teacher role
    if (user?.role === 'Teacher') {
      // 1. Teacher without institute - only show basic options + payment
      if (!selectedInstitute) {
        return [
          {
            id: 'dashboard',
            label: 'Select Institutes',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'organizations',
            label: 'Organizations',
            icon: Building2,
            permission: 'view-organizations',
            alwaysShow: true
          }
        ];
      }

      // 2. Teacher with institute selected (but no class/subject)
      if (selectedInstitute && !selectedClass && !selectedSubject) {
        return [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'organizations',
            label: 'Organizations',
            icon: Building2,
            permission: 'view-organizations',
            alwaysShow: true
          },
          {
            id: 'select-class',
            label: 'Select Class',
            icon: School,
            permission: 'view-classes',
            alwaysShow: false
          },
          {
            id: 'select-subject',
            label: 'Select Subject',
            icon: BookOpen,
            permission: 'view-subjects',
            alwaysShow: false
          }
        ];
      }

      // 3. Teacher with institute and class selected (but no subject)
      if (selectedInstitute && selectedClass && !selectedSubject) {
        return [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'daily-attendance',
            label: 'Daily Attendance',
            icon: UserCheck,
            permission: 'view-attendance',
            alwaysShow: false
          },
          {
            id: 'select-class',
            label: 'Select Class',
            icon: School,
            permission: 'view-classes',
            alwaysShow: false
          },
          {
            id: 'select-subject',
            label: 'Select Subject',
            icon: BookOpen,
            permission: 'view-subjects',
            alwaysShow: false
          },
          {
            id: 'students',
            label: 'Students',
            icon: GraduationCap,
            permission: 'view-students',
            alwaysShow: false
          },
          {
            id: 'unverified-students',
            label: 'Unverified Students',
            icon: AlertCircle,
            permission: 'view-students',
            alwaysShow: false
          },
        ];
      }

      // 4. Teacher with institute, class, and subject all selected
      if (selectedInstitute && selectedClass && selectedSubject) {
        return [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'daily-attendance',
            label: 'Daily Attendance',
            icon: UserCheck,
            permission: 'view-attendance',
            alwaysShow: false
          },
          {
            id: 'select-class',
            label: 'Select Class',
            icon: School,
            permission: 'view-classes',
            alwaysShow: false
          },
          {
            id: 'select-subject',
            label: 'Select Subject',
            icon: BookOpen,
            permission: 'view-subjects',
            alwaysShow: false
          },
          {
            id: 'students',
            label: 'Students',
            icon: GraduationCap,
            permission: 'view-students',
            alwaysShow: false
          },
          {
            id: 'unverified-students',
            label: 'Unverified Students',
            icon: AlertCircle,
            permission: 'view-students',
            alwaysShow: false
          },
          {
            id: 'subject-payments',
            label: 'Subject Payments',
            icon: CreditCard,
            permission: 'view-payments',
            alwaysShow: false
          }
        ];
      }
    }

    // Special handling for InstituteAdmin role
    if (user?.role === 'InstituteAdmin') {
      if (!selectedInstitute) {
        return [
          {
            id: 'dashboard',
            label: 'Select Institutes',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'organizations',
            label: 'Organizations',
            icon: Building2,
            permission: 'view-organizations',
            alwaysShow: true
          }
        ];
      }

      // If only institute is selected
      if (selectedInstitute && !selectedClass && !selectedSubject) {
        return [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'daily-attendance',
            label: 'Daily Attendance',
            icon: UserCheck,
            permission: 'view-attendance',
            alwaysShow: false
          },
          {
            id: 'institute-users',
            label: 'Institute Users',
            icon: Users,
            permission: 'view-users',
            alwaysShow: false
          },
          {
            id: 'parents',
            label: 'Parents',
            icon: Users,
            permission: 'view-parents',
            alwaysShow: false
          },
          {
            id: 'classes',
            label: 'All Classes',
            icon: School,
            permission: 'view-classes',
            alwaysShow: false
          },
          {
            id: 'subjects',
            label: 'All Subjects',
            icon: BookOpen,
            permission: 'view-subjects',
            alwaysShow: false
          },
          {
            id: 'select-class',
            label: 'Select Class',
            icon: School,
            permission: 'view-classes',
            alwaysShow: false
          },
          {
            id: 'select-subject',
            label: 'Select Subject',
            icon: BookOpen,
            permission: 'view-subjects',
            alwaysShow: false
          }
        ];
      }

      // If institute and class are selected (but not subject)
      if (selectedInstitute && selectedClass && !selectedSubject) {
        return [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'daily-attendance',
            label: 'Daily Attendance',
            icon: UserCheck,
            permission: 'view-attendance',
            alwaysShow: false
          },
          {
            id: 'students',
            label: 'Students',
            icon: GraduationCap,
            permission: 'view-students',
            alwaysShow: false
          },
          {
            id: 'unverified-students',
            label: 'Unverified Students',
            icon: AlertCircle,
            permission: 'view-students',
            alwaysShow: false
          },
          {
            id: 'classes',
            label: 'All Classes',
            icon: School,
            permission: 'view-classes',
            alwaysShow: false
          },
          {
            id: 'subjects',
            label: 'All Subjects',
            icon: BookOpen,
            permission: 'view-subjects',
            alwaysShow: false
          },
          {
            id: 'select-class',
            label: 'Select Class',
            icon: School,
            permission: 'view-classes',
            alwaysShow: false
          },
          {
            id: 'select-subject',
            label: 'Select Subject',
            icon: BookOpen,
            permission: 'view-subjects',
            alwaysShow: false
          }
        ];
      }

      // If institute, class, and subject are all selected
      if (selectedInstitute && selectedClass && selectedSubject) {
        return [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          },
          {
            id: 'daily-attendance',
            label: 'Daily Attendance',
            icon: UserCheck,
            permission: 'view-attendance',
            alwaysShow: false
          },
          {
            id: 'students',
            label: 'Students',
            icon: GraduationCap,
            permission: 'view-students',
            alwaysShow: false
          },
          {
            id: 'unverified-students',
            label: 'Unverified Students',
            icon: AlertCircle,
            permission: 'view-students',
            alwaysShow: false
          },
          {
            id: 'lectures',
            label: 'Lectures',
            icon: Video,
            permission: 'view-lectures',
            alwaysShow: false
          },
          {
            id: 'homework',
            label: 'Homework',
            icon: Notebook,
            permission: 'view-homework',
            alwaysShow: false
          },
          {
            id: 'exams',
            label: 'Exams',
            icon: Award,
            permission: 'view-exams',
            alwaysShow: false
          },
          {
            id: 'classes',
            label: 'All Classes',
            icon: School,
            permission: 'view-classes',
            alwaysShow: false
          },
          {
            id: 'subjects',
            label: 'All Subjects',
            icon: BookOpen,
            permission: 'view-subjects',
            alwaysShow: false
          },
          {
            id: 'select-class',
            label: 'Select Class',
            icon: School,
            permission: 'view-classes',
            alwaysShow: false
          },
          {
            id: 'select-subject',
            label: 'Select Subject',
            icon: BookOpen,
            permission: 'view-subjects',
            alwaysShow: false
          },
          {
            id: 'subject-payments',
            label: 'Subject Payments',
            icon: CreditCard,
            permission: 'view-payments',
            alwaysShow: false
          }
        ];
      }
    }

    // Special handling for Parent role
    if (user?.role === 'Parent') {
      // 1. Parent without child selected - only show Select Child
      if (!selectedChild) {
        return [
          {
            id: 'parents',
            label: 'Select Child',
            icon: Users,
            permission: 'view-parents',
            alwaysShow: false
          }
        ];
      }

      // 2. Parent with child selected - show main sections without institute navigation
      if (selectedChild) {
        return [
          {
            id: 'child-attendance',
            label: 'Child Attendance',
            icon: ClipboardList,
            permission: 'view-attendance',
            alwaysShow: false
          },
          {
            id: 'child-results',
            label: 'Child Results',
            icon: Award,
            permission: 'view-results',
            alwaysShow: false
          }
        ];
      }

      return [];
    }

    // Special handling for AttendanceMarker role - only show specific items when institute is selected
    if (user?.role === 'AttendanceMarker') {
      if (!selectedInstitute) {
        return [
          {
            id: 'dashboard',
            label: 'Select Institutes',
            icon: LayoutDashboard,
            permission: 'view-dashboard',
            alwaysShow: false
          }
        ];
      }

      // For AttendanceMarker with institute selected, only show QR Attendance and selection options
      return [
        {
          id: 'select-class',
          label: 'Select Class',
          icon: School,
          permission: 'view-classes',
          alwaysShow: false
        },
        {
          id: 'select-subject',
          label: 'Select Subject',
          icon: BookOpen,
          permission: 'view-subjects',
          alwaysShow: false
        }
      ];
    }

    // Base items that are always available for all other users
    const baseItems = [
      {
        id: 'dashboard',
        label: selectedInstitute ? 'Dashboard' : 'Select Institutes',
        icon: LayoutDashboard,
        permission: 'view-dashboard',
        alwaysShow: false
      },
      {
        id: 'organizations',
        label: 'Organizations',
        icon: Building2,
        permission: 'view-organizations',
        alwaysShow: true // Always show organizations for all users
      }
    ];

    // If no institute is selected, return basic navigation including organizations
    if (!selectedInstitute) {
      return baseItems;
    }

    // If institute is selected, show full navigation for other roles
    return [
      ...baseItems,
      {
        id: 'users',
        label: 'Users',
        icon: Users,
        permission: 'view-users',
        alwaysShow: false
      },
      {
        id: 'students',
        label: 'Students',
        icon: GraduationCap,
        permission: 'view-students',
        alwaysShow: false
      },
      {
        id: 'parents',
        label: 'Parents',
        icon: Users,
        permission: 'view-parents',
        alwaysShow: false
      },
      // Remove teachers section for SystemAdmin
      ...(user?.role !== 'SystemAdmin' ? [{
        id: 'teachers',
        label: 'Teachers',
        icon: UserCheck,
        permission: 'view-teachers',
        alwaysShow: false
      }] : []),
      {
        id: 'classes',
        label: 'All Classes',
        icon: School,
        permission: 'view-classes',
        alwaysShow: false
      },
      {
        id: 'subjects',
        label: 'All Subjects',
        icon: BookOpen,
        permission: 'view-subjects',
        alwaysShow: false
      },
      // Only show selection options for non-SystemAdmin users
      ...(user?.role !== 'SystemAdmin' ? [
        {
          id: 'select-class',
          label: 'Select Class',
          icon: School,
          permission: 'view-classes',
          alwaysShow: false
        },
        {
          id: 'select-subject',
          label: 'Select Subject',
          icon: BookOpen,
          permission: 'view-subjects',
          alwaysShow: false
        }
      ] : []),
      {
        id: 'institutes',
        label: 'Institutes',
        icon: Building2,
        permission: 'view-institutes',
        alwaysShow: false
      }
    ];
  };

  const getAttendanceItems = () => {
    // For Student - no additional attendance items needed as they are in main menu
    if (user?.role === 'Student') {
      return [];
    }

    // For Teacher - show specific attendance items based on selection state
    if (user?.role === 'Teacher') {
      // 3. Teacher with institute and class selected (but no subject)
      if (selectedInstitute && selectedClass && !selectedSubject) {
        return [
          {
            id: 'attendance',
            label: 'View Attendance',
            icon: ClipboardList,
            permission: 'view-attendance',
            alwaysShow: false
          },
          {
            id: 'qr-attendance',
            label: 'QR Attendance',
            icon: QrCode,
            permission: 'mark-attendance',
            alwaysShow: false
          }
        ];
      }

      // 4. Teacher with institute, class, and subject all selected
      if (selectedInstitute && selectedClass && selectedSubject) {
        return [
          {
            id: 'attendance',
            label: 'View Attendance',
            icon: ClipboardList,
            permission: 'view-attendance',
            alwaysShow: false
          },
          {
            id: 'qr-attendance',
            label: 'QR Attendance',
            icon: QrCode,
            permission: 'mark-attendance',
            alwaysShow: false
          }
        ];
      }

      // For other teacher states, no attendance items
      return [];
    }

    // For InstituteAdmin - show specific attendance items based on selection
    if (user?.role === 'InstituteAdmin') {
      if (!selectedInstitute) {
        return [];
      }

      // For InstituteAdmin with only institute selected
      if (selectedInstitute && !selectedClass && !selectedSubject) {
        return [
          {
            id: 'attendance',
            label: 'View Attendance',
            icon: ClipboardList,
            permission: 'view-attendance',
            alwaysShow: false
          },
          {
            id: 'qr-attendance',
            label: 'QR Attendance',
            icon: QrCode,
            permission: 'mark-attendance',
            alwaysShow: false
          }
        ];
      }

      // For InstituteAdmin with institute and class selected (or all three selected)
      if (selectedInstitute && selectedClass) {
        return [
          {
            id: 'attendance',
            label: 'View Attendance',
            icon: ClipboardList,
            permission: 'view-attendance',
            alwaysShow: false
          },
          {
            id: 'qr-attendance',
            label: 'QR Attendance',
            icon: QrCode,
            permission: 'mark-attendance',
            alwaysShow: false
          }
        ];
      }
    }

    // Default attendance items for other roles
    const attendanceItems = [
      {
        id: 'attendance',
        label: 'View Attendance',
        icon: ClipboardList,
        permission: 'view-attendance',
        alwaysShow: false
      },
      {
        id: 'attendance-marking',
        label: 'Mark Attendance',
        icon: UserCheck,
        permission: 'mark-attendance',
        alwaysShow: false
      },
      {
        id: 'attendance-markers',
        label: 'Attendance Markers',
        icon: Users,
        permission: 'manage-attendance-markers',
        alwaysShow: false
      },
      {
        id: 'qr-attendance',
        label: 'QR Attendance',
        icon: QrCode,
        permission: 'mark-attendance',
        alwaysShow: user?.role === 'AttendanceMarker' // Always show for AttendanceMarker
      }
    ];

    return attendanceItems;
  };

  const getSystemItems = () => {
    // For Student - no additional system items needed as they are in main menu
    if (user?.role === 'Student') {
      return [];
    }

    // For Teacher - show academic items only when institute, class, and subject are all selected
    if (user?.role === 'Teacher') {
      if (selectedInstitute && selectedClass && selectedSubject) {
        return [
          {
            id: 'lectures',
            label: 'Lectures',
            icon: Video,
            permission: 'view-lectures',
            alwaysShow: false
          },
          {
            id: 'homework',
            label: 'Homework',
            icon: Notebook,
            permission: 'view-homework',
            alwaysShow: false
          },
          {
            id: 'exams',
            label: 'Exams',
            icon: FileText,
            permission: 'view-exams',
            alwaysShow: false
          },
          {
            id: 'results',
            label: 'Results',
            icon: ClipboardList,
            permission: 'view-results',
            alwaysShow: false
          }
        ];
      }
      
      // For other teacher selection states, return empty array
      return [];
    }

    // For InstituteAdmin - show academic items when institute, class, and subject are all selected
    if (user?.role === 'InstituteAdmin') {
      if (selectedInstitute && selectedClass && selectedSubject) {
        return [
          {
            id: 'lectures',
            label: 'Lectures',
            icon: Video,
            permission: 'view-lectures',
            alwaysShow: false
          },
          {
            id: 'homework',
            label: 'Homework',
            icon: Notebook,
            permission: 'view-homework',
            alwaysShow: false
          },
          {
            id: 'exams',
            label: 'Exams',
            icon: FileText,
            permission: 'view-exams',
            alwaysShow: false
          },
          {
            id: 'results',
            label: 'Results',
            icon: ClipboardList,
            permission: 'view-results',
            alwaysShow: false
          }
        ];
      }
      
      // For other InstituteAdmin selection states, return empty array
      return [];
    }

    // Default system items for other roles
    const systemItems = [
      {
        id: 'grading',
        label: 'Grading',
        icon: BarChart3,
        permission: 'view-grading',
        alwaysShow: false
      },
      {
        id: 'live-lectures',
        label: 'Live Lectures',
        icon: Video,
        permission: 'view-lectures',
        alwaysShow: false
      },
      {
        id: 'homework',
        label: 'Homework',
        icon: Notebook,
        permission: 'view-homework',
        alwaysShow: false
      },
      {
        id: 'exams',
        label: 'Exams',
        icon: FileText,
        permission: 'view-exams',
        alwaysShow: false
      },
      {
        id: 'results',
        label: 'Results',
        icon: ClipboardList,
        permission: 'view-results',
        alwaysShow: false
      }
    ];

    return systemItems;
  };

  const getPaymentItems = () => {
    // Only show payment sections for InstituteAdmin, Teacher, Student
    if (!['InstituteAdmin', 'Teacher', 'Student'].includes(user?.role || '')) {
      return [];
    }

    const paymentItems = [];

    // 1. When only institute is selected - show Institute Payments for all three roles
    // + My Submissions for Students only
    if (selectedInstitute && !selectedClass && !selectedSubject) {
      paymentItems.push({
        id: 'institute-payments',
        label: 'Institute Payments',
        icon: CreditCard,
        permission: 'view-profile',
        alwaysShow: false
      });

      // Add My Submissions for Students only when only institute is selected
      if (user?.role === 'Student') {
        paymentItems.push({
          id: 'my-submissions',
          label: 'My Submissions',
          icon: FileText,
          permission: 'view-profile',
          alwaysShow: false
        });
      }
    }

    // 3. When institute, class, and subject are all selected - show Subject Payments only
    if (selectedInstitute && selectedClass && selectedSubject) {
      paymentItems.push({
        id: 'subject-payments',
        label: 'Subject Payments',
        icon: CreditCard,
        permission: 'view-profile',
        alwaysShow: false
      });

      // 4. Add Subject Pay Submission for Students only when all three are selected
      if (user?.role === 'Student') {
        paymentItems.push({
          id: 'subject-pay-submission',
          label: 'Subject Pay Submission',
          icon: FileText,
          permission: 'view-profile',
          alwaysShow: false
        });
      }
    }

    return paymentItems;
  };

  const getSettingsItems = () => {
    // If organization is selected, only show Profile and Appearance
    if (selectedOrganization) {
      return [
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          permission: 'view-profile',
          alwaysShow: false
        },
        {
          id: 'appearance',
          label: 'Appearance',
          icon: Palette,
          permission: 'view-appearance',
          alwaysShow: false
        }
      ];
    }

    // For Parent - show specific settings items based on child selection
    if (user?.role === 'Parent') {
      const baseItems = [
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          permission: 'view-profile',
          alwaysShow: false
        },
        {
          id: 'appearance',
          label: 'Appearance',
          icon: Palette,
          permission: 'view-appearance',
          alwaysShow: false
        }
      ];

      // Add System Payment only when child is selected
      if (selectedChild) {
        baseItems.push({
          id: 'system-payment',
          label: 'System Payment',
          icon: CreditCard,
          permission: 'view-profile',
          alwaysShow: false
        });
      }

      return baseItems;
    }

    // For Student - always show Profile and Appearance + Payment if no institute
    if (user?.role === 'Student') {
      const baseItems = [
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          permission: 'view-profile',
          alwaysShow: false
        },
        {
          id: 'appearance',
          label: 'Appearance',
          icon: Palette,
          permission: 'view-appearance',
          alwaysShow: false
        }
      ];

      // Add System Payment only when no institute is selected
      if (!selectedInstitute) {
        baseItems.push({
          id: 'system-payment',
          label: 'System Payment',
          icon: CreditCard,
          permission: 'view-profile', // Using existing permission
          alwaysShow: false
        });
      }

      return baseItems;
    }

    // For Teacher - show specific settings items based on selection state + Payment if no institute
    if (user?.role === 'Teacher') {
      const baseItems = [
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          permission: 'view-profile',
          alwaysShow: false
        },
        {
          id: 'appearance',
          label: 'Appearance',
          icon: Palette,
          permission: 'view-appearance',
          alwaysShow: false
        }
      ];

      // Add System Payment only when no institute is selected
      if (!selectedInstitute) {
        baseItems.push({
          id: 'system-payment',
          label: 'System Payment',
          icon: CreditCard,
          permission: 'view-profile', // Using existing permission
          alwaysShow: false
        });
      }

      return baseItems;
    }

    // For InstituteAdmin - show specific settings items + Payment if no institute
    if (user?.role === 'InstituteAdmin') {
      const baseItems = [
        {
          id: 'profile',
          label: 'Profile',
          icon: User,
          permission: 'view-profile',
          alwaysShow: false
        },
        {
          id: 'appearance',
          label: 'Appearance',
          icon: Palette,
          permission: 'view-appearance',
          alwaysShow: false
        }
      ];

      // Add System Payment only when no institute is selected
      if (!selectedInstitute) {
        baseItems.push({
          id: 'system-payment',
          label: 'System Payment',
          icon: CreditCard,
          permission: 'view-profile', // Using existing permission
          alwaysShow: false
        });
      } else {
        // Add Institute Details when institute is selected
        baseItems.push({
          id: 'institute-details',
          label: 'Institute Details',
          icon: Building2,
          permission: 'view-institute-details',
          alwaysShow: false
        });
      }

      return baseItems;
    }

    // Default settings items for other roles
    const settingsItems = [
      {
        id: 'profile',
        label: 'Profile',
        icon: User,
        permission: 'view-profile',
        alwaysShow: false
      },
      {
        id: 'appearance',
        label: 'Appearance',
        icon: Palette,
        permission: 'view-appearance',
        alwaysShow: false
      },
      ...(selectedInstitute ? [{
        id: 'institute-details',
        label: 'Institute Details',
        icon: Building2,
        permission: 'view-institute-details',
        alwaysShow: false
      }] : []),
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        permission: 'view-settings',
        alwaysShow: false
      }
    ];

    return settingsItems;
  };

  const userRole = user?.role || 'Student';
  const menuItems = getMenuItems();
  const attendanceItems = getAttendanceItems();
  const systemItems = getSystemItems();
  const paymentItems = getPaymentItems();
  const settingsItems = getSettingsItems();

  const filterItemsByPermission = (items: any[]) => {
    return items.filter(item => {
      // Always show items marked as alwaysShow
      if (item.alwaysShow) {
        return true;
      }
      // Otherwise check permission
      return AccessControl.hasPermission(userRole as any, item.permission);
    });
  };

  const handleItemClick = (itemId: string) => {
    console.log('Sidebar item clicked:', itemId);
    
    // Handle System Payment click - navigate to payments page
    if (itemId === 'system-payment') {
      navigate('/payments');
      onClose();
      return;
    }
    
    // Handle Institute Payments click
    if (itemId === 'institute-payments') {
      navigate('/institute-payments');
      onClose();
      return;
    }
    
    // Handle Subject Payments click
    if (itemId === 'subject-payments') {
      navigate('/subject-payments');
      onClose();
      return;
    }
    
    // Handle Subject Submissions click (for Students only)
    if (itemId === 'subject-submissions') {
      navigate('/subject-submissions');
      onClose();
      return;
    }
    
    // Handle My Submissions click (for Students only)
    if (itemId === 'my-submissions') {
      navigate('/my-submissions');
      onClose();
      return;
    }
    
    // Handle Subject Pay Submission click (for Students only)
    if (itemId === 'subject-pay-submission') {
      navigate('/subject-pay-submission');
      onClose();
      return;
    }
    
    // Handle Enroll Class click (for Students only)
    if (itemId === 'enroll-class') {
      navigate('/enroll-class');
      onClose();
      return;
    }
    
    // Handle Enroll Subject click (for Students only) 
    if (itemId === 'enroll-subject') {
      navigate('/enroll-subject');
      onClose();
      return;
    }
    
    onPageChange(itemId);
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
  };

  const handleBackNavigation = () => {
    if (selectedOrganization) {
      // Go back from organization level to organization selection
      setSelectedOrganization(null);
    } else if (selectedChild) {
      // Go back from child level to children selection
      setSelectedChild(null);
    } else if (selectedSubject) {
      // Go back from subject level to class level
      setSelectedSubject(null);
    } else if (selectedClass) {
      // Go back from class level to institute level
      setSelectedClass(null);
    } else if (selectedInstitute) {
      // Go back from institute level to institute selection
      setSelectedInstitute(null);
    }
  };

  const SidebarSection = ({ title, items }: { title: string; items: any[] }) => {
    const filteredItems = filterItemsByPermission(items);
    
    if (filteredItems.length === 0) return null;

    return (
      <div className="mb-4 sm:mb-6">
        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 px-3">
          {title}
        </h3>
        <div className="space-y-1">
          {filteredItems.map((item) => (
            <Button
              key={item.id}
              variant={currentPage === item.id ? "secondary" : "ghost"}
              className={`w-full justify-start h-9 sm:h-10 px-3 text-sm ${
                currentPage === item.id 
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border-r-2 border-blue-600' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => handleItemClick(item.id)}
            >
              <item.icon className="mr-3 h-4 w-4 flex-shrink-0" />
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50
        w-72 sm:w-80 md:w-64 lg:w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col h-screen
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2 min-w-0">
            <School className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 flex-shrink-0" />
            <span className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">
              EduSystem
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close Sidebar"
            >
              <X className="h-4 w-4 md:hidden" />
              <Menu className="h-4 w-4 hidden md:block" />
            </Button>
          </div>
        </div>

        {/* Context Info - Only show for non-SystemAdmin users */}
        {user?.role !== 'SystemAdmin' && (selectedInstitute || selectedClass || selectedSubject || selectedChild || selectedOrganization) && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                Current Selection
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackNavigation}
                className="h-6 w-6 p-0 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-800"
                aria-label="Go Back"
              >
                <ArrowLeft className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-1 text-xs">
              {selectedOrganization && (
                <div className="text-blue-600 dark:text-blue-400">
                  <span className="font-medium">Organization:</span> 
                  <span className="ml-1 truncate">{selectedOrganization.name}</span>
                </div>
              )}
              {selectedInstitute && (
                <div className="text-blue-600 dark:text-blue-400">
                  <span className="font-medium">Institute:</span> 
                  <span className="ml-1 truncate">{selectedInstitute.name}</span>
                </div>
              )}
              {selectedClass && (
                <div className="text-blue-600 dark:text-blue-400">
                  <span className="font-medium">Class:</span> 
                  <span className="ml-1 truncate">{selectedClass.name}</span>
                </div>
              )}
              {selectedSubject && (
                <div className="text-blue-600 dark:text-blue-400">
                  <span className="font-medium">Subject:</span> 
                  <span className="ml-1 truncate">{selectedSubject.name}</span>
                </div>
              )}
              {selectedChild && (
                <div className="text-blue-600 dark:text-blue-400">
                  <span className="font-medium">Child:</span> 
                  <span className="ml-1 truncate">
                    {(selectedChild as any).name || (selectedChild.user ? `${selectedChild.user.firstName} ${selectedChild.user.lastName}` : 'Unknown Child')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 sm:px-3 py-3 sm:py-4">
          <div className="space-y-2">
            <SidebarSection title="Main" items={menuItems} />
            
            {/* Show attendance section for Teacher based on selection state */}
            {user?.role === 'Teacher' && attendanceItems.length > 0 && (
              <SidebarSection title="Attendance" items={attendanceItems} />
            )}
            
            {/* Show attendance section when institute is selected for InstituteAdmin */}
            {user?.role === 'InstituteAdmin' && selectedInstitute && (
              <SidebarSection title="Attendance" items={attendanceItems} />
            )}
            
            {/* For AttendanceMarker role, only show QR Attendance when institute is selected */}
            {user?.role === 'AttendanceMarker' && selectedInstitute && (
              <SidebarSection title="Attendance" items={attendanceItems} />
            )}
            
            {/* For other roles, show attendance navigation based on role */}
            {user?.role !== 'AttendanceMarker' && user?.role !== 'InstituteAdmin' && user?.role !== 'Teacher' && user?.role !== 'Student' && selectedInstitute && (
              <SidebarSection title="Attendance" items={attendanceItems} />
            )}
            
            {/* Show academic items for Teacher only when institute, class and subject are all selected */}
            {user?.role === 'Teacher' && systemItems.length > 0 && (
              <SidebarSection title="Academic" items={systemItems} />
            )}
            
            {/* Show academic items for InstituteAdmin only when institute, class and subject are all selected */}
            {user?.role === 'InstituteAdmin' && selectedInstitute && selectedClass && selectedSubject && (
              <SidebarSection title="Academic" items={systemItems} />
            )}
            
            {/* Show full academic section for other roles (excluding Student) */}
            {selectedInstitute && user?.role !== 'AttendanceMarker' && user?.role !== 'InstituteAdmin' && user?.role !== 'Teacher' && user?.role !== 'Student' && (
              <SidebarSection title="Academic" items={systemItems} />
            )}
            
            {/* Show Payment section for specific user types based on new rules */}
            {paymentItems.length > 0 && (
              <SidebarSection title="Payments" items={paymentItems} />
            )}
            
            <SidebarSection title="Settings" items={settingsItems} />
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 space-y-1">
            <div className="truncate">
              <span>Logged in as:</span> 
              <span className="font-medium ml-1">{user?.name}</span>
            </div>
            <div>
              <span>Role:</span> 
              <span className="font-medium ml-1">{user?.role}</span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 h-8 sm:h-9"
          >
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="text-xs sm:text-sm">Logout</span>
          </Button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
