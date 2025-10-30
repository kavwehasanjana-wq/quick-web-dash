
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import surakshaLogo from '@/assets/suraksha-logo.png';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header = ({ onMenuClick }: HeaderProps) => {
  const { user, logout, selectedInstitute } = useAuth();

  // Map backend instituteUserType to display role
  const mapInstituteRoleToDisplayRole = (raw?: string) => {
    switch (raw) {
      case 'INSTITUTE_ADMIN':
        return 'InstituteAdmin';
      case 'STUDENT':
        return 'Student';
      case 'TEACHER':
        return 'Teacher';
      case 'ATTENDANCE_MARKER':
        return 'AttendanceMarker';
      default:
        return undefined;
    }
  };

  // Display role: use institute-specific role if available, otherwise global role
  const displayRole = selectedInstitute?.userRole 
    ? mapInstituteRoleToDisplayRole(selectedInstitute.userRole) 
    : user?.role;

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-3 sticky top-0 z-40">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuClick}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <img 
            src={selectedInstitute?.logo || surakshaLogo} 
            alt={selectedInstitute?.shortName ? "Institute logo" : "SurakshaLMS logo"}
            className="h-8 w-8 object-contain rounded"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
            {selectedInstitute?.shortName || 'SurakshaLMS'}
          </h1>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2 hover:bg-gray-100"
                aria-label="User menu"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 bg-white border border-gray-200"
            >
              <DropdownMenuItem disabled className="cursor-default">
                <span className="font-medium text-gray-900 truncate">
                  {user?.name}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="cursor-default">
                <span className="text-sm text-gray-500">
                  {displayRole}
                </span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="cursor-pointer hover:bg-gray-100"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
