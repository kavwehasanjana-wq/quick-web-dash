import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAttendanceUrl } from '@/contexts/utils/auth.api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Video, FileText, User, Calendar, ExternalLink, Download, ChevronDown, ChevronUp, Play } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { format } from 'date-fns';
import VideoPreviewDialog from '@/components/VideoPreviewDialog';

interface Document {
  documentName: string;
  documentUrl: string;
  uploadedAt: string;
  _id: string;
}

interface Lecture {
  _id: string;
  id?: string;
  subjectId: string;
  grade: number;
  title: string;
  description: string;
  lessonNumber: number;
  lectureNumber: number;
  provider: string;
  lectureLink: string;
  meetingLink?: string;
  coverImageUrl?: string | null;
  documents: Document[];
  isActive: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  status?: string;
  instructorId?: string;
  instructor?: string;
}

interface Lesson {
  lessonNumber: number;
  lessonName: string;
  lectures: Lecture[];
  isExpanded?: boolean;
}

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  const regexes = [
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/,
    /(?:youtube\.com\/watch\?v=)([^"&?\/\s]{11})/,
    /(?:youtu\.be\/)([^"&?\/\s]{11})/
  ];
  
  for (const regex of regexes) {
    const match = url.match(regex);
    if (match) return match[1];
  }
  
  return null;
};

interface FreeLecturesResponse {
  success: boolean;
  message: string;
  subjectInfo: {
    subjectId: string;
    grade: number;
    totalLectures: number;
    totalLessons: number;
    activeLectures: number;
  };
  data: Lesson[];
}

const FreeLectures = () => {
  const { selectedInstitute, selectedClass, selectedSubject, selectedClassGrade, user } = useAuth();
  const [lectures, setLectures] = useState<Lesson[]>([]);
  const [subjectInfo, setSubjectInfo] = useState<FreeLecturesResponse['subjectInfo'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedLectures, setExpandedLectures] = useState<Record<string, boolean>>({});
  const [videoPreview, setVideoPreview] = useState<{ open: boolean; url: string; title: string }>({ 
    open: false, 
    url: '', 
    title: '' 
  });

  const handleLoadLectures = () => {
    if (selectedSubject && (selectedClassGrade !== null && selectedClassGrade !== undefined)) {
      fetchFreeLectures();
    }
  };

  const fetchFreeLectures = async () => {
    if (!selectedSubject || selectedClassGrade === null || selectedClassGrade === undefined) return;

    setLoading(true);
    setError(null);

    try {
      const baseUrl = getAttendanceUrl() || 'http://localhost:3003';
      
      // Use the structured lectures API endpoint
      const params = new URLSearchParams({
        page: '1',
        limit: '50'
      });

      const response = await fetch(
        `${baseUrl}/api/structured-lectures/subject/${selectedSubject.id}/grade/${selectedClassGrade || selectedClass?.grade || 10}?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          // Handle 404 specifically - no lectures found for this subject
          setLectures([]);
          setSubjectInfo(null);
          setError(null);
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: FreeLecturesResponse = await response.json();
      
      if (data.success && data.data) {
        // The API already returns data in the correct format, no transformation needed
        setLectures(data.data.map(lesson => ({ ...lesson, isExpanded: false })));
        setSubjectInfo(data.subjectInfo);
      } else {
        setError(data.message || 'Failed to load free lectures');
      }
    } catch (err) {
      console.error('Error fetching free lectures:', err);
      setError('Error loading free lectures. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLecture = (lectureLink: string, title: string) => {
    setVideoPreview({ open: true, url: lectureLink, title });
  };

  const handleDownloadDocument = (documentUrl: string, documentName: string) => {
    window.open(documentUrl, '_blank');
  };

  const toggleLessonExpansion = (lessonNumber: number) => {
    setLectures(prevLectures => 
      prevLectures.map(lesson => 
        lesson.lessonNumber === lessonNumber 
          ? { ...lesson, isExpanded: !lesson.isExpanded }
          : lesson
      )
    );
  };

  const toggleLectureExpansion = (lectureId: string) => {
    setExpandedLectures(prev => ({
      ...prev,
      [lectureId]: !prev[lectureId]
    }));
  };

  if (!selectedSubject || selectedClassGrade === null || selectedClassGrade === undefined) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please select a subject to view free lectures.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">Free Lectures</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {selectedInstitute?.name} • {selectedClass?.name} • {selectedSubject.name}
          </p>
        </div>
        
        {/* Load Lectures Button */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4 flex justify-center">
            <Button 
              onClick={handleLoadLectures}
              disabled={loading}
              size="sm"
            >
              {loading ? (
                <>
                  <Video className="h-4 w-4 mr-2 animate-pulse" />
                  Loading Lectures...
                </>
              ) : (
                <>
                  <Video className="h-4 w-4 mr-2" />
                  Load Free Lectures
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Subject Info Summary */}
      {subjectInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" />
              Subject Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{subjectInfo.totalLectures}</div>
                <div className="text-sm text-muted-foreground">Total Lectures</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{subjectInfo.totalLessons}</div>
                <div className="text-sm text-muted-foreground">Total Lessons</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{subjectInfo.activeLectures}</div>
                <div className="text-sm text-muted-foreground">Active Lectures</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{subjectInfo.grade}</div>
                <div className="text-sm text-muted-foreground">Grade Level</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lessons and Lectures */}
      {lectures.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>There are no free lectures for this subject!</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {lectures.map((lesson) => (
            <Card key={lesson.lessonNumber} className="overflow-hidden">
              <Collapsible 
                open={lesson.isExpanded} 
                onOpenChange={() => toggleLessonExpansion(lesson.lessonNumber)}
              >
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="shrink-0">
                          Lesson {lesson.lessonNumber}
                        </Badge>
                        <div>
                          <CardTitle className="text-left">{lesson.lessonName}</CardTitle>
                          <CardDescription className="text-left">
                            {lesson.lectures.length} lecture{lesson.lectures.length !== 1 ? 's' : ''} available
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {lesson.lectures.filter(l => l.isActive).length} Active
                        </Badge>
                        {lesson.isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-6">
                      {lesson.lectures.map((lecture, index) => {
                        const youtubeId = getYouTubeVideoId(lecture.lectureLink || lecture.meetingLink || '');
                        const isExpanded = expandedLectures[lecture._id];
                        
                        return (
                          <div key={lecture._id} className="border rounded-lg overflow-hidden">
                            {/* Cover Image */}
                            {lecture.coverImageUrl && (
                              <div className="relative w-full h-48 md:h-56 lg:h-48 bg-muted">
                                <img
                                  src={lecture.coverImageUrl}
                                  alt={lecture.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            
                            {/* Mobile View (< 768px) */}
                            <div className="md:hidden p-4 space-y-3">
                              <div className="flex items-start gap-3">
                                <Badge variant="outline" className="shrink-0 mt-1">
                                  {index + 1}
                                </Badge>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm line-clamp-2">{lecture.title}</h4>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(lecture.createdAt), 'MMM dd, yyyy')}
                                  </div>
                                </div>
                              </div>
                              
                              <Button
                                onClick={() => handleJoinLecture(lecture.lectureLink || lecture.meetingLink || '', lecture.title)}
                                disabled={!lecture.isActive}
                                className="w-full"
                                size="sm"
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Watch Lecture
                              </Button>

                              <Button
                                variant="outline"
                                onClick={() => toggleLectureExpansion(lecture._id)}
                                className="w-full"
                                size="sm"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="h-4 w-4 mr-2" />
                                    View Less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="h-4 w-4 mr-2" />
                                    View More
                                  </>
                                )}
                              </Button>

                              {/* Expanded Content on Mobile */}
                              {isExpanded && (
                                <div className="space-y-3 pt-2">
                                  <p className="text-sm text-muted-foreground">{lecture.description}</p>
                                  
                                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {lecture.provider}
                                    </div>
                                    <Badge variant={lecture.isActive ? "default" : "secondary"} className="text-xs">
                                      {lecture.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                    {lecture.status && (
                                      <Badge variant="outline" className="text-xs">
                                        {lecture.status}
                                      </Badge>
                                    )}
                                  </div>

                                  {/* YouTube Embed */}
                                  {youtubeId && (
                                    <>
                                      <Separator />
                                      <div className="space-y-2">
                                        <h5 className="text-sm font-medium flex items-center gap-2">
                                          <Play className="h-3 w-3" />
                                          Lecture Video
                                        </h5>
                                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                          <iframe
                                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                                            src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                                            title={lecture.title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                          />
                                        </div>
                                      </div>
                                    </>
                                  )}

                                  {/* Documents */}
                                  {lecture.documents && lecture.documents.length > 0 && (
                                    <>
                                      <Separator />
                                      <div className="space-y-2">
                                        <h5 className="text-sm font-medium flex items-center gap-2">
                                          <FileText className="h-3 w-3" />
                                          Documents ({lecture.documents.length})
                                        </h5>
                                        <div className="grid gap-2">
                                          {lecture.documents.map((doc) => (
                                            <div
                                              key={doc._id}
                                              className="flex items-center justify-between p-2 border rounded bg-muted/50"
                                            >
                                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <FileText className="h-3 w-3 shrink-0" />
                                                <span className="text-xs truncate">{doc.documentName}</span>
                                              </div>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownloadDocument(doc.documentUrl, doc.documentName)}
                                                className="shrink-0 ml-2"
                                              >
                                                View
                                              </Button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Tablet View (768px - 1023px) */}
                            <div className="hidden md:block lg:hidden p-5 space-y-4">
                              {/* Lecture Header */}
                              <div className="flex flex-col gap-4">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Badge variant="outline" className="shrink-0">
                                      {index + 1}
                                    </Badge>
                                    <h4 className="font-semibold text-base truncate">{lecture.title}</h4>
                                  </div>
                                  <Badge variant={lecture.isActive ? "default" : "secondary"} className="shrink-0">
                                    {lecture.isActive ? 'Active' : 'Inactive'}
                                  </Badge>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-3">{lecture.description}</p>
                                
                                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1.5">
                                    <User className="h-4 w-4" />
                                    <span className="truncate">{lecture.provider}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(lecture.createdAt), 'MMM dd, yyyy')}
                                  </div>
                                  {lecture.status && (
                                    <Badge variant="outline">
                                      {lecture.status}
                                    </Badge>
                                  )}
                                </div>

                                <div className="flex gap-3">
                                  <Button
                                    onClick={() => handleJoinLecture(lecture.lectureLink || lecture.meetingLink || '', lecture.title)}
                                    disabled={!lecture.isActive}
                                    className="flex-1"
                                  >
                                    <Play className="h-4 w-4 mr-2" />
                                    Watch Lecture
                                  </Button>
                                  
                                  <Button
                                    variant="outline"
                                    onClick={() => toggleLectureExpansion(lecture._id)}
                                    className="flex-1"
                                  >
                                    {isExpanded ? (
                                      <>
                                        <ChevronUp className="h-4 w-4 mr-2" />
                                        View Less
                                      </>
                                    ) : (
                                      <>
                                        <ChevronDown className="h-4 w-4 mr-2" />
                                        View More
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>

                              {/* Expanded Content on Tablet */}
                              {isExpanded && (
                                <>
                                  {/* YouTube Embed */}
                                  {youtubeId && (
                                    <>
                                      <Separator />
                                      <div className="space-y-3">
                                        <h5 className="font-medium flex items-center gap-2">
                                          <Play className="h-4 w-4" />
                                          Lecture Video
                                        </h5>
                                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                          <iframe
                                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                                            src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                                            title={lecture.title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                          />
                                        </div>
                                      </div>
                                    </>
                                  )}

                                  {/* Documents */}
                                  {lecture.documents && lecture.documents.length > 0 && (
                                    <>
                                      <Separator />
                                      <div className="space-y-3">
                                        <h5 className="font-medium flex items-center gap-2">
                                          <FileText className="h-4 w-4" />
                                          Documents ({lecture.documents.length})
                                        </h5>
                                        <div className="grid grid-cols-1 gap-2">
                                          {lecture.documents.map((doc) => (
                                            <div
                                              key={doc._id}
                                              className="flex items-center justify-between p-3 border rounded bg-muted/50"
                                            >
                                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                                <FileText className="h-4 w-4 shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                  <span className="text-sm truncate block">{doc.documentName}</span>
                                                  <span className="text-xs text-muted-foreground">
                                                    {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}
                                                  </span>
                                                </div>
                                              </div>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleDownloadDocument(doc.documentUrl, doc.documentName)}
                                                className="shrink-0 ml-3"
                                              >
                                                <Download className="h-4 w-4 mr-1" />
                                                View
                                              </Button>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Desktop View (>= 1024px) */}
                            <div className="hidden lg:block p-4 space-y-4">
                              {/* Lecture Header */}
                              <div className="flex items-start justify-between">
                                <div className="space-y-2 flex-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">
                                      {index + 1}
                                    </Badge>
                                    <h4 className="font-semibold">{lecture.title}</h4>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{lecture.description}</p>
                                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <User className="h-4 w-4" />
                                      {lecture.provider}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {format(new Date(lecture.createdAt), 'MMM dd, yyyy')}
                                    </div>
                                    <Badge variant={lecture.isActive ? "default" : "secondary"}>
                                      {lecture.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                    {lecture.status && (
                                      <Badge variant="outline">
                                        {lecture.status}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  onClick={() => handleJoinLecture(lecture.lectureLink || lecture.meetingLink || '', lecture.title)}
                                  disabled={!lecture.isActive}
                                  className="shrink-0 ml-4"
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  Watch Lecture
                                </Button>
                              </div>

                              {/* YouTube Embed */}
                              {youtubeId && (
                                <>
                                  <Separator />
                                  <div className="space-y-2">
                                    <h5 className="font-medium flex items-center gap-2">
                                      <Play className="h-4 w-4" />
                                      Lecture Video
                                    </h5>
                                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                                      <iframe
                                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                                        src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                                        title={lecture.title}
                                        frameBorder="0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                      />
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* Documents */}
                              {lecture.documents && lecture.documents.length > 0 && (
                                <>
                                  <Separator />
                                  <div className="space-y-2">
                                    <h5 className="font-medium flex items-center gap-2">
                                      <FileText className="h-4 w-4" />
                                      Documents ({lecture.documents.length})
                                    </h5>
                                    <div className="grid gap-2">
                                      {lecture.documents.map((doc) => (
                                        <div
                                          key={doc._id}
                                          className="flex items-center justify-between p-2 border rounded bg-muted/50"
                                        >
                                          <div className="flex items-center gap-2">
                                            <FileText className="h-4 w-4" />
                                            <span className="text-sm">{doc.documentName}</span>
                                            <span className="text-xs text-muted-foreground">
                                              • {format(new Date(doc.uploadedAt), 'MMM dd, yyyy')}
                                            </span>
                                          </div>
                                           <Button
                                             variant="outline"
                                             size="sm"
                                             onClick={() => handleDownloadDocument(doc.documentUrl, doc.documentName)}
                                           >
                                             View
                                           </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}

      <VideoPreviewDialog
        open={videoPreview.open}
        onOpenChange={(open) => setVideoPreview({ ...videoPreview, open })}
        url={videoPreview.url}
        title={videoPreview.title}
      />
    </div>
  );
};

export default FreeLectures;