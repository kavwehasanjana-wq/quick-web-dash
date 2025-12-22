import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PageHeader, ActionButton } from "@/components/shared/PageComponents";
import { BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { DataTable, Column, PaginationMeta } from "@/components/shared/DataTable";
import { ViewDetailsDialog } from "@/components/shared/ViewDetailsDialog";
import { CreateSubjectForm } from "@/components/forms/CreateSubjectForm";

interface Subject {
  id: string;
  code: string;
  name: string;
  description: string;
  category: string;
  creditHours: number;
  isActive: boolean;
  subjectType: string;
  basketCategory: string;
  instituteType: string;
  imgUrl: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export default function SubjectsPage() {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  useEffect(() => {
    fetchSubjects();
  }, [page, limit]);

  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      const response = await api.getSubjects(page, limit);
      // Response could be an array directly or have meta
      if (Array.isArray(response)) {
        setSubjects(response);
        setPagination({
          page: page,
          limit: limit,
          total: response.length,
          totalPages: 1,
        });
      } else {
        setSubjects(response.data || []);
        if (response.meta) {
          setPagination({
            page: response.meta.page,
            limit: response.meta.limit,
            total: response.meta.total,
            totalPages: response.meta.totalPages,
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch subjects:", error);
      toast({
        title: "Error",
        description: "Failed to load subjects",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSubject = () => {
    setCreateDialogOpen(true);
  };

  const handleView = (subject: Subject) => {
    setSelectedSubject(subject);
    setViewDialogOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const columns: Column[] = [
    { key: "imgUrl", label: "Image", type: "image" },
    { key: "id", label: "ID" },
    { key: "code", label: "Code" },
    { key: "subjectType", label: "Subject Type", type: "badge" },
    { key: "basketCategory", label: "Basket Category", type: "badge" },
    { key: "instituteType", label: "Institute Type", type: "badge" },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Subjects"
        description="Manage all subjects and courses"
        icon={BookOpen}
        actions={<ActionButton label="Create Subject" onClick={handleCreateSubject} />}
      />
      
      <DataTable
        columns={columns}
        data={subjects}
        isLoading={isLoading}
        onView={handleView}
        pagination={pagination || undefined}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />

      <ViewDetailsDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        data={selectedSubject}
        title={selectedSubject?.name || "Subject Details"}
        imageKey="imgUrl"
      />

      <CreateSubjectForm
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={fetchSubjects}
      />
    </DashboardLayout>
  );
}
