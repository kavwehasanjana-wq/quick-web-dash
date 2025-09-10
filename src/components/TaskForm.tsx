import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface TaskFormProps {
  onAddTask: (text: string) => void;
}

export const TaskForm = ({ onAddTask }: TaskFormProps) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAddTask(text.trim());
      setText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <Input
        type="text"
        placeholder="What needs to be done?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 glass-card border-border/50 focus:border-primary/50 transition-smooth"
      />
      <Button 
        type="submit" 
        disabled={!text.trim()}
        className="gradient-primary hover:opacity-90 transition-smooth shadow-card hover:shadow-glow/30"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </form>
  );
};