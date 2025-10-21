import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function ConfigModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [baseUrl, setBaseUrl] = useState(localStorage.getItem('api_base_url') || 'http://localhost:3000');
  const [secondBaseUrl, setSecondBaseUrl] = useState(localStorage.getItem('api_second_base_url') || 'http://localhost:3001');
  const { toast } = useToast();

  const handleSave = () => {
    localStorage.setItem('api_base_url', baseUrl);
    localStorage.setItem('api_second_base_url', secondBaseUrl);
    toast({
      title: "Configuration saved",
      description: "Backend URLs have been updated successfully.",
    });
    setIsOpen(false);
    window.location.reload(); // Reload to apply new config
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          Backend URL
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Backend Configuration</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="baseUrl">First Backend Base URL</Label>
            <Input
              id="baseUrl"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://localhost:3000"
            />
            <p className="text-sm text-muted-foreground">
              Enter the base URL for your primary backend API
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="secondBaseUrl">Second Backend Base URL</Label>
            <Input
              id="secondBaseUrl"
              value={secondBaseUrl}
              onChange={(e) => setSecondBaseUrl(e.target.value)}
              placeholder="http://localhost:3001"
            />
            <p className="text-sm text-muted-foreground">
              Enter the base URL for your secondary backend API
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Configuration
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}