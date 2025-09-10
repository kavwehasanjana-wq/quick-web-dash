import { useState, useEffect } from 'react';
import { TaskForm } from './TaskForm';
import { TaskItem } from './TaskItem';
import { Card } from '@/components/ui/card';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
}

export const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
      }));
      setTasks(parsedTasks);
    }
  }, []);

  // Save tasks to localStorage when tasks change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (text: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: new Date(),
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const completedTasks = tasks.filter(task => task.completed);
  const pendingTasks = tasks.filter(task => !task.completed);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-block gradient-accent p-[2px] rounded-2xl shadow-glow">
          <div className="bg-background rounded-2xl px-6 py-3">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Task Manager
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground text-lg">
          Stay organized and productive
        </p>
      </div>

      {/* Add Task Form */}
      <Card className="glass-card shadow-card transition-smooth hover:shadow-glow/20">
        <div className="p-6">
          <TaskForm onAddTask={addTask} />
        </div>
      </Card>

      {/* Tasks Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="glass-card shadow-card p-4 text-center">
          <div className="text-2xl font-bold text-primary">{pendingTasks.length}</div>
          <div className="text-sm text-muted-foreground">Pending</div>
        </Card>
        <Card className="glass-card shadow-card p-4 text-center">
          <div className="text-2xl font-bold text-accent">{completedTasks.length}</div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </Card>
      </div>

      {/* Task Lists */}
      <div className="space-y-6">
        {/* Pending Tasks */}
        {pendingTasks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              Pending Tasks
            </h2>
            <div className="space-y-3">
              {pendingTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent"></div>
              Completed Tasks
            </h2>
            <div className="space-y-3">
              {completedTasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && (
          <Card className="glass-card shadow-card p-12 text-center">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">No tasks yet</h3>
            <p className="text-muted-foreground">
              Add your first task above to get started!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};