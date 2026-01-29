import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Building, BookOpen, Truck, ChevronLeft, UserCheck, Users } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useInstituteRole } from '@/hooks/useInstituteRole';
import { useAuth } from '@/contexts/AuthContext';

interface CurrentSelectionProps {
  institute?: {
    id: string;
    name: string;
  };
  class?: {
    id: string;
    name: string;
  };
  subject?: {
    id: string;
    name: string;
  };
  transport?: {
    id: string;
    vehicleModel: string;
  };
  onBack?: () => void;
  showNavigation?: boolean;
}

const CurrentSelection: React.FC<CurrentSelectionProps> = ({ 
  institute, 
  class: selectedClass, 
  subject, 
  transport,
  onBack,
  showNavigation = true
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = useInstituteRole();
  const { setSelectedClass, setSelectedSubject, setSelectedInstitute } = useAuth();
  
  // Check if institute type is tuition_institute
  const isTuitionInstitute = (institute as any)?.type === 'tuition_institute';
  const subjectLabel = isTuitionInstitute ? 'Sub Class For' : 'Subject';
  
  // Check if user is InstituteAdmin or Teacher
  const canVerifyStudents = ['InstituteAdmin', 'Teacher'].includes(userRole);
  
  if (!institute && !selectedClass && !subject && !transport) return null;

  // Determine the current step for better context
  const getCurrentStep = () => {
    if (subject) return 'subject';
    if (selectedClass) return 'class';
    if (institute) return 'institute';
    return 'none';
  };

  // Determine context-aware back navigation
  const handleContextBack = () => {
    if (onBack) {
      onBack();
      return;
    }

    const currentStep = getCurrentStep();
    
    // If we have subject selected, go back to subject selection (clear subject)
    if (currentStep === 'subject' && selectedClass && institute) {
      setSelectedSubject(null);
      navigate(`/institute/${institute.id}/class/${selectedClass.id}/select-subject`);
      return;
    }
    
    // If we have class selected, go back to class selection (clear class)
    if (currentStep === 'class' && institute) {
      setSelectedClass(null);
      navigate(`/institute/${institute.id}/select-class`);
      return;
    }
    
    // If we have institute selected, go back to institute selection (clear institute)
    if (currentStep === 'institute') {
      setSelectedInstitute(null);
      navigate('/select-institute');
      return;
    }

    // Default: go back in history
    navigate(-1);
  };

  const handleVerifyStudentsClick = () => {
    if (institute && selectedClass) {
      navigate(`/institute/${institute.id}/class/${selectedClass.id}/unverified-students`);
    } else if (institute) {
      // Navigate to class selection first if no class selected
      navigate(`/institute/${institute.id}/select-class`);
    }
  };

  // Get back button label based on current context
  const getBackLabel = () => {
    const currentStep = getCurrentStep();
    if (currentStep === 'subject') return 'Change Subject';
    if (currentStep === 'class') return 'Change Class';
    if (currentStep === 'institute') return 'Change Institute';
    return 'Back';
  };

  // Get the description of what back action will do
  const getBackDescription = () => {
    const currentStep = getCurrentStep();
    if (currentStep === 'subject') return 'Go to subject selection';
    if (currentStep === 'class') return 'Go to class selection';
    if (currentStep === 'institute') return 'Go to institute selection';
    return 'Go back';
  };

  return (
    <Card className="border-border/60 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-5">
        {/* Header with back button - More prominent */}
        <div className="flex items-center gap-3 mb-3 sm:mb-4 pb-3 border-b border-border/50">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-10 w-10 sm:h-9 sm:w-9 shrink-0 rounded-full"
            onClick={handleContextBack}
          >
            <ChevronLeft className="h-5 w-5 sm:h-4 sm:w-4" />
          </Button>
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base font-semibold text-foreground">Current Selection</p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{getBackDescription()}</p>
          </div>
        </div>
        
        {/* Selection Details - Better spacing for mobile */}
        <div className="space-y-3 sm:space-y-4">
          {institute && (
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Building className="h-4 w-4 sm:h-4 sm:w-4 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-xs text-muted-foreground font-medium uppercase tracking-wide">Institute</p>
                <p className="text-sm sm:text-base font-medium text-foreground break-words leading-relaxed line-clamp-2">
                  {institute.name}
                </p>
              </div>
            </div>
          )}
          
          {selectedClass && (
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 sm:h-8 sm:w-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                <BookOpen className="h-4 w-4 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-xs text-muted-foreground font-medium uppercase tracking-wide">Class</p>
                <p className="text-sm sm:text-base font-medium text-foreground break-words leading-relaxed line-clamp-2">
                  {selectedClass.name}
                </p>
              </div>
            </div>
          )}
          
          {subject && (
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 sm:h-8 sm:w-8 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0">
                <BookOpen className="h-4 w-4 sm:h-4 sm:w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-xs text-muted-foreground font-medium uppercase tracking-wide">{subjectLabel}</p>
                <p className="text-sm sm:text-base font-medium text-foreground break-words leading-relaxed line-clamp-2">
                  {subject.name}
                </p>
              </div>
            </div>
          )}
          
          {transport && (
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 sm:h-8 sm:w-8 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                <Truck className="h-4 w-4 sm:h-4 sm:w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-xs text-muted-foreground font-medium uppercase tracking-wide">Transport</p>
                <p className="text-sm sm:text-base font-medium text-foreground break-words leading-relaxed line-clamp-2">
                  {transport.vehicleModel}
                </p>
              </div>
            </div>
          )}

          {/* Role Badge */}
          {userRole && (
            <div className="flex items-center gap-3 pt-2">
              <div className="h-9 w-9 sm:h-8 sm:w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
              <Badge variant="secondary" className="text-xs px-3 py-1">
                {userRole}
              </Badge>
            </div>
          )}
        </div>

        {/* Navigation Links for InstituteAdmin and Teacher */}
        {showNavigation && canVerifyStudents && institute && selectedClass && (
          <>
            <Separator className="my-4" />
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium mb-2 uppercase tracking-wide">Quick Actions</p>
              <Button
                variant="outline"
                size="default"
                className="w-full justify-start gap-3 text-left h-11 sm:h-10 text-sm"
                onClick={handleVerifyStudentsClick}
              >
                <UserCheck className="h-4 w-4 text-primary" />
                <span>Verify Students</span>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrentSelection;
