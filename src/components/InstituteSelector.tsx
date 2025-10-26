
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useInstituteRole } from '@/hooks/useInstituteRole';
import { Building, Users, CheckCircle, RefreshCw, MapPin, Mail, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cachedApiClient } from '@/api/cachedClient';

interface InstituteApiResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  type: string;
  isActive: boolean;
  createdAt: string;
  imageUrl: string;
}

interface InstituteSelectorProps {
  useChildId?: boolean;
}

const InstituteSelector = ({ useChildId = false }: InstituteSelectorProps) => {
  const { user, setSelectedInstitute, selectedChild } = useAuth();
  const { toast } = useToast();
  const [institutes, setInstitutes] = useState<InstituteApiResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const userRole = useInstituteRole();

  const handleLoadInstitutes = async () => {
    // For Parent role, use the selected child's ID instead of the parent's ID
    const userId = useChildId && selectedChild ? selectedChild.id : user?.id;
    
    if (!userId) {
      toast({
        title: "Error",
        description: useChildId ? "No child selected" : "No user ID available",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Loading institutes for user ID:', userId, useChildId ? '(child)' : '(user)');

      // Try multiple possible endpoints to support different backends
      const endpoints = useChildId
        ? [`/children/${userId}/institutes`, `/users/${userId}/institutes`]
        : [`/users/${userId}/institutes`];

      let result: InstituteApiResponse[] | null = null;
      let lastErr: any = null;

      for (const ep of endpoints) {
        try {
          console.log('Trying endpoint:', ep);
          
          // Use cachedApiClient instead of direct fetch
          const data = await cachedApiClient.get(
            ep,
            { page: 1, limit: 10 },
            {
              ttl: 30, // Cache for 30 minutes
              forceRefresh: false,
              userId: userId,
              role: userRole || 'User'
            }
          );

          // Handle response - data might be array or wrapped in data property
          if (Array.isArray(data)) {
            result = data;
            console.log('✅ Successful endpoint (cached):', ep);
            break;
          }
          if (data?.data && Array.isArray(data.data)) {
            result = data.data;
            console.log('✅ Successful endpoint (wrapped, cached):', ep);
            break;
          }

          console.warn(`Endpoint ${ep} returned unexpected response shape`);
          lastErr = new Error('Unexpected response shape');
        } catch (e) {
          console.error(`Error calling ${ep}:`, e);
          lastErr = e;
        }
      }

      if (!result) {
        throw lastErr || new Error('No valid endpoint available for institutes');
      }

      console.log('Institutes API Response:', result);
      
      // Normalize API response to expected shape
      const normalized = (result as any[]).map((raw: any) => ({
        id: raw.id || raw.instituteId || '',
        name: raw.name || raw.instituteName || '',
        email: raw.email || raw.instituteEmail || '',
        phone: raw.phone || raw.institutePhone || '',
        address: raw.address || raw.instituteAddress || '',
        city: raw.city || raw.instituteCity || '',
        state: raw.state || raw.instituteState || '',
        country: raw.country || raw.instituteCountry || '',
        type: raw.type || raw.instituteType || '',
        isActive: raw.isActive !== undefined ? raw.isActive : (raw.instituteIsActive !== undefined ? raw.instituteIsActive : true),
        createdAt: raw.createdAt || '',
        imageUrl: raw.imageUrl || raw.instituteLogo || '',
        instituteUserType: raw.instituteUserType || '',
        userIdByInstitute: raw.userIdByInstitute || '',
        status: raw.status || ''
      }));
      
      // Filter out any invalid institute data
      const validInstitutes = normalized.filter(inst => inst && inst.id && inst.name);
      
      setInstitutes(validInstitutes);
      
      toast({
        title: "Data Loaded",
        description: `Successfully loaded ${validInstitutes.length} institutes.`
      });
    } catch (error) {
      console.error('Error loading institutes:', error);
      toast({
        title: "Error",
        description: "Failed to load institutes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectInstitute = (institute: InstituteApiResponse) => {
    if (!institute || !institute.id) {
      toast({
        title: "Error",
        description: "Invalid institute data",
        variant: "destructive",
      });
      return;
    }

    const selectedInstitute = {
      id: institute.id,
      name: institute.name,
      code: institute.id, // Using id as code since it's not in the API response
      description: `${institute.address || ''}, ${institute.city || ''}`.trim(),
      isActive: institute.isActive,
      type: institute.type,
      userRole: (institute as any).instituteUserType || '',
      userIdByInstitute: (institute as any).userIdByInstitute || '',
      shortName: (institute as any).instituteShortName || institute.name,
      logo: (institute as any).instituteLogo || institute.imageUrl || ''
    };
    setSelectedInstitute(selectedInstitute);
    
    toast({
      title: "Institute Selected",
      description: `Selected institute: ${selectedInstitute.name}`
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Select Institute
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose an institute to continue to your dashboard
        </p>
      </div>

      {institutes.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
            Click the button below to load your institutes.
          </p>
          <Button 
            onClick={handleLoadInstitutes}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Load Institutes
          </Button>
        </div>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading institutes...</p>
        </div>
      )}

      {institutes.length > 0 && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Your Institutes ({institutes.length})
            </h2>
            <Button 
              onClick={handleLoadInstitutes}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="space-y-4">
            {institutes.map((institute) => {
              return (
                <Card 
                  key={institute.id} 
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-2 hover:border-blue-500"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Institute Image */}
                    <div className="md:w-48 h-48 md:h-auto flex-shrink-0">
                      <img
                        src={institute.imageUrl || '/placeholder.svg'}
                        alt={institute.name || 'Institute'}
                        className="w-full h-full object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    </div>

                    {/* Institute Details */}
                    <div className="flex-1 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Building className="h-6 w-6 text-blue-600" />
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                              {institute.name}
                            </h3>
                            {institute.isActive && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Active
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mb-1">
                            ID: {institute.id}
                          </p>
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                              <Users className="h-4 w-4 mr-2" />
                              <span>Type: {institute.type}</span>
                            </div>
                            {(institute as any).instituteUserType && (
                              <Badge variant="outline" className="text-xs">
                                Role: {(institute as any).instituteUserType}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {institute.email && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Mail className="h-4 w-4 mr-2" />
                            <span>{institute.email}</span>
                          </div>
                        )}
                        {institute.phone && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Phone className="h-4 w-4 mr-2" />
                            <span>{institute.phone}</span>
                          </div>
                        )}
                        {(institute.address || institute.city || institute.state || institute.country) && (
                          <div className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                            <span>
                              {[
                                institute.address,
                                institute.city,
                                institute.state,
                                institute.country
                              ].filter(Boolean).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      <Button 
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                        onClick={() => handleSelectInstitute(institute)}
                      >
                        Select Institute
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default InstituteSelector;
