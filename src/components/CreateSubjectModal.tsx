import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import ApiService from '@/services/api';
import { Switch } from '@/components/ui/switch';

interface CreateSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (created?: any) => void;
}

export function CreateSubjectModal({ isOpen, onClose, onSuccess }: CreateSubjectModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    code: '',
    name: '',
    description: '',
    category: '',
    creditHours: 0,
    isActive: true,
    basketCategory: 'COMMON',
    instituteId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        code: form.code,
        name: form.name,
        description: form.description,
        category: form.category,
        creditHours: Number(form.creditHours),
        isActive: Boolean(form.isActive),
        basketCategory: form.basketCategory,
        instituteId: form.instituteId,
      };

      const created = await ApiService.createSubject(payload as any);
      toast({ title: 'Subject created', description: `${created.name} has been added.` });
      onSuccess(created);
      onClose();
      setForm({
        code: '',
        name: '',
        description: '',
        category: '',
        creditHours: 0,
        isActive: true,
        basketCategory: 'COMMON',
        instituteId: '',
      });
    } catch (error: any) {
      toast({ title: 'Failed to create subject', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Subject</DialogTitle>
          <DialogDescription>Fill in the details to create a new subject.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input id="code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="creditHours">Credit Hours</Label>
              <Input id="creditHours" type="number" min={0} value={form.creditHours} onChange={(e) => setForm({ ...form, creditHours: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="basketCategory">Basket Category</Label>
              <Input id="basketCategory" value={form.basketCategory} onChange={(e) => setForm({ ...form, basketCategory: e.target.value })} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="instituteId">Institute ID</Label>
              <Input id="instituteId" value={form.instituteId} onChange={(e) => setForm({ ...form, instituteId: e.target.value })} required />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch id="isActive" checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Subject'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
