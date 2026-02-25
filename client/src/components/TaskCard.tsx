import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Calendar, AlertTriangle } from 'lucide-react';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
}

export default function TaskCard({ task, onClick, draggable, onDragStart }: TaskCardProps) {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return { label: 'High', class: 'text-red-600 bg-red-500/10 border-red-500/20' };
      case 'medium':
        return { label: 'Medium', class: 'text-amber-600 bg-amber-500/10 border-amber-500/20' };
      case 'low':
        return { label: 'Low', class: 'text-blue-600 bg-blue-500/10 border-blue-500/20' };
      default:
        return { label: priority, class: 'text-muted-foreground bg-muted' };
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getAssigneeInitials = (assignedTo: any) => {
    if (!assignedTo || typeof assignedTo === 'string') return null;
    return assignedTo.name
      ?.split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  const priorityStyle = getPriorityStyle(task.priority);

  return (
    <div
      className="p-3 bg-card border border-border rounded-xl cursor-pointer hover:shadow-md hover:border-border/80 transition-all group active:scale-[0.98]"
      onClick={() => onClick?.(task)}
      draggable={draggable}
      onDragStart={(e) => onDragStart?.(e, task)}
    >
      {/* Priority indicator dot */}
      <div className="flex items-start gap-2">
        <div
          className={`h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0 ${
            task.priority === 'high'
              ? 'bg-red-500'
              : task.priority === 'medium'
                ? 'bg-amber-500'
                : 'bg-blue-500'
          }`}
        />
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-[13px] text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
            {task.title}
          </h4>

          {task.description && (
            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
              {task.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
        <Badge
          className={`text-[10px] px-1.5 py-0 h-[18px] font-normal ${priorityStyle.class}`}
          variant="outline"
        >
          {priorityStyle.label}
        </Badge>

        {task.dueDate && (
          <span
            className={`inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0 h-[18px] rounded-md ${
              isOverdue
                ? 'text-red-600 bg-red-500/10 font-medium'
                : 'text-muted-foreground bg-muted/50'
            }`}
          >
            {isOverdue ? (
              <AlertTriangle className="h-2.5 w-2.5" />
            ) : (
              <Calendar className="h-2.5 w-2.5" />
            )}
            {formatDate(task.dueDate)}
          </span>
        )}

        <div className="flex-1" />

        {getAssigneeInitials(task.assignedTo) && (
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
              {getAssigneeInitials(task.assignedTo)}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
}
