import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2 } from 'lucide-react';
import { Task } from './TaskManager';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskItem = ({ task, onToggle, onDelete }: TaskItemProps) => {
  return (
    <Card className="glass-card shadow-card transition-smooth hover:shadow-glow/20 group">
      <div className="p-4 flex items-center gap-4">
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm transition-smooth",
            task.completed 
              ? "line-through text-muted-foreground" 
              : "text-foreground"
          )}>
            {task.text}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {task.createdAt.toLocaleDateString()}
          </p>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(task.id)}
          className="opacity-0 group-hover:opacity-100 transition-smooth text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};