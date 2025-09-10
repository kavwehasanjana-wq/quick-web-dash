import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Building2, Users, BookOpen, Camera, Presentation, Link, Upload, Image as ImageIcon, Settings, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Organization } from '@/api/organization.api';
import OrganizationGallery from './OrganizationGallery';
import OrganizationCourses from './OrganizationCourses';
import OrganizationCourseLectures from './OrganizationCourseLectures';
import OrganizationMembers from './OrganizationMembers';
import OrganizationUnverifiedMembers from './OrganizationUnverifiedMembers';
import AssignInstituteDialog from './AssignInstituteDialog';
import OrganizationImageUpload from './OrganizationImageUpload';
import UpdateOrganizationDialog from './forms/UpdateOrganizationDialog';

interface OrganizationDetailsProps {
  organization: Organization;
  userRole: string;
  onBack: () => void;
}

type NavigationTab = 'gallery' | 'courses' | 'lectures' | 'members' | 'unverified';

const OrganizationDetails = ({ organization, userRole, onBack }: OrganizationDetailsProps) => {
  // Use organization-specific role if available, fallback to general userRole
  const effectiveUserRole = organization.userRole || userRole;
  const [activeTab, setActiveTab] = useState<NavigationTab>('gallery');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { toast } = useToast();

  // Define navigation tabs based on user role
  const getNavigationTabs = () => {
    const commonTabs = [
      { id: 'gallery' as NavigationTab, label: 'Gallery', icon: Camera },
      { id: 'courses' as NavigationTab, label: 'Courses', icon: BookOpen },
    ];

    if (userRole === 'OrganizationManager') {
      return [
        ...commonTabs,
        { id: 'lectures' as NavigationTab, label: 'Lectures', icon: Presentation },
        { id: 'members' as NavigationTab, label: 'Members', icon: Users },
        { id: 'unverified' as NavigationTab, label: 'Unverified Members', icon: UserX },
      ];
    }

    // Add Members tab for ADMIN/PRESIDENT users
    if (effectiveUserRole === 'ADMIN' || effectiveUserRole === 'PRESIDENT') {
      return [
        ...commonTabs,
        { id: 'lectures' as NavigationTab, label: 'Lectures', icon: Presentation },
        { id: 'members' as NavigationTab, label: 'Members', icon: Users },
        { id: 'unverified' as NavigationTab, label: 'Unverified Members', icon: UserX },
      ];
    }

    return commonTabs;
  };

  const handleCourseSelect = (course: any) => {
    setSelectedCourse(course);
    setActiveTab('lectures');
  };

  const handleBackToCourses = () => {
    setSelectedCourse(null);
    setActiveTab('courses');
  };


  const renderContent = () => {
    if (activeTab === 'lectures' && selectedCourse) {
      return (
        <OrganizationCourseLectures 
          course={selectedCourse} 
          onBack={handleBackToCourses}
          organization={organization}
        />
      );
    }

    switch (activeTab) {
      case 'gallery':
        return <OrganizationGallery organizationId={organization.organizationId} />;
      case 'courses':
        return (
          <OrganizationCourses 
            organizationId={organization.organizationId}
            onSelectCourse={handleCourseSelect}
            organization={organization}
          />
        );
      case 'lectures':
        return <OrganizationCourseLectures course={null} onBack={() => {}} organization={organization} />;
      case 'members':
        return <OrganizationMembers organizationId={organization.organizationId} userRole={effectiveUserRole} />;
      case 'unverified':
        return <OrganizationUnverifiedMembers organizationId={organization.organizationId} userRole={effectiveUserRole} />;
      default:
        return <OrganizationGallery organizationId={organization.organizationId} />;
    }
  };

  const navigationTabs = getNavigationTabs();

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <Button variant="outline" onClick={onBack} className="w-fit">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              {organization.name}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {(userRole === 'OrganizationManager' || effectiveUserRole === 'ADMIN' || effectiveUserRole === 'PRESIDENT')
                ? 'Manage organization details and content' 
                : 'View organization content'
              }
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          {/* Assign to Institute Button for OrganizationManager */}
          {userRole === 'OrganizationManager' && (
            <Button onClick={() => setShowAssignDialog(true)} className="flex items-center gap-2 w-full sm:w-auto">
              <Link className="h-4 w-4" />
              Assign to Institute
            </Button>
          )}
          
          {/* Update Organization Button for PRESIDENT users only */}
          {effectiveUserRole === 'PRESIDENT' && (
            <Button onClick={() => setShowUpdateDialog(true)} className="flex items-center gap-2 w-full sm:w-auto">
              <Settings className="h-4 w-4" />
              Update Organization
            </Button>
          )}
        </div>
      </div>

      {/* Image Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Organization Image
          </CardTitle>
          <CardDescription>
            Upload an image to represent your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Upload Component - Only for OrganizationManager */}
          {userRole === 'OrganizationManager' ? (
            <OrganizationImageUpload
              currentImageUrl={selectedImage}
              onImageUpdate={setSelectedImage}
              organizationName={organization.name}
            />
          ) : (
            <div className="space-y-4">
              {/* Image Display Area for non-managers */}
              <div className="relative w-full h-48 sm:h-56 md:h-64 bg-muted rounded-lg border-2 border-dashed border-border overflow-hidden">
                {selectedImage ? (
                  <img
                    src={selectedImage}
                    alt="Organization image"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mb-2" />
                    <p className="text-sm">No image uploaded</p>
                  </div>
                )}
              </div>
              
              {/* View-only message for non-managers */}
              {!selectedImage && (
                <p className="text-sm text-muted-foreground">
                  Only organization managers can upload images
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b overflow-x-auto">
        {navigationTabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 sm:px-4 sm:py-2 whitespace-nowrap border-b-2 transition-colors text-base sm:text-base ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <IconComponent className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div>
        {renderContent()}
      </div>

      {/* Assign Institute Dialog */}
      <AssignInstituteDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        organizationId={organization.organizationId}
      />

      {/* Update Organization Dialog */}
      <UpdateOrganizationDialog
        open={showUpdateDialog}
        onOpenChange={setShowUpdateDialog}
        organization={organization}
        onUpdate={(updatedOrg) => {
          // Handle organization update if needed
          toast({
            title: "Success",
            description: "Organization updated successfully",
          });
        }}
      />
    </div>
  );
};

export default OrganizationDetails;
