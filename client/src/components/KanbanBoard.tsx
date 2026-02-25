import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import TaskCard from './TaskCard';
import type { Task } from '../types';
import { toast } from 'sonner';
import taskService from '../services/task.service';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskUpdated: () => void;
  onCreateTask?: (status: string) => void;
}

interface KanbanColumn {
  id: 'todo' | 'in-progress' | 'completed';
  title: string;
  dotColor: string;
  bgColor: string;
}

const columns: KanbanColumn[] = [
  { id: 'todo', title: 'To Do', dotColor: 'bg-blue-500', bgColor: 'bg-blue-500/5' },
  { id: 'in-progress', title: 'In Progress', dotColor: 'bg-amber-500', bgColor: 'bg-amber-500/5' },
  { id: 'completed', title: 'Done', dotColor: 'bg-emerald-500', bgColor: 'bg-emerald-500/5' },
];

export default function KanbanBoard({
  tasks,
  onTaskClick,
  onTaskUpdated,
  onCreateTask,
}: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const getColumnTasks = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleDragStart = (_e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null);
      return;
    }

    try {
      await taskService.updateTask(draggedTask._id, {
        status: newStatus as 'todo' | 'in-progress' | 'completed',
      });
      onTaskUpdated();
    } catch {
      toast.error('Failed to move task');
    }

    setDraggedTask(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {columns.map((column) => {
        const columnTasks = getColumnTasks(column.id);
        const isDragOver = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            className="flex flex-col"
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div
              className={`flex-1 rounded-xl border border-border p-3 transition-all ${
                isDragOver
                  ? 'bg-primary/5 ring-2 ring-primary/20 border-primary/30'
                  : column.bgColor
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${column.dotColor}`} />
                  <h3 className="font-semibold text-[13px]">{column.title}</h3>
                  <span className="text-[11px] text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded-full font-medium">
                    {columnTasks.length}
                  </span>
                </div>
                {onCreateTask && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-primary"
                    onClick={() => onCreateTask(column.id)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              {/* Tasks */}
              <div className="space-y-2 min-h-[80px]">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onClick={onTaskClick}
                    draggable
                    onDragStart={handleDragStart}
                  />
                ))}

                {columnTasks.length === 0 && (
                  <div className="flex items-center justify-center h-20 border border-dashed border-border/50 rounded-lg">
                    <p className="text-[11px] text-muted-foreground/50">
                      {isDragOver ? 'Drop here' : 'No tasks'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
