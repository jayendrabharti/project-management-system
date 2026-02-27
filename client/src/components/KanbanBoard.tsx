import { Badge } from './ui/badge';
import type { Task, User } from '../types';
import { format } from 'date-fns';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: () => void;
  onTaskClick?: (task: Task) => void;
}

const columns = [
  { id: 'todo', label: 'To Do', color: 'bg-muted-foreground/30' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
  { id: 'in-review', label: 'In Review', color: 'bg-amber-500' },
  { id: 'completed', label: 'Completed', color: 'bg-emerald-500' },
];

export default function KanbanBoard({
  tasks,
  onTaskUpdate: _onTaskUpdate,
  onTaskClick,
}: KanbanBoardProps) {
  const getPriorityDot = (priority: string) => {
    const map: Record<string, string> = {
      urgent: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500',
      none: 'bg-muted-foreground/30',
    };
    return map[priority] || map.none;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {columns.map((column) => {
        const columnTasks = tasks.filter((t) => t.status === column.id);

        return (
          <div key={column.id} className="space-y-3">
            {/* Column header */}
            <div className="flex items-center gap-2 px-1">
              <div className={`h-2.5 w-2.5 rounded-full ${column.color}`} />
              <h3 className="text-sm font-semibold">{column.label}</h3>
              <Badge
                variant="secondary"
                className="text-[10px] h-5 min-w-[20px] flex items-center justify-center"
              >
                {columnTasks.length}
              </Badge>
            </div>

            {/* Tasks */}
            <div className="space-y-2 min-h-[200px] p-2 rounded-xl bg-muted/30 border border-border/30">
              {columnTasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-card border border-border/50 rounded-lg p-3 space-y-2 hover:shadow-md transition-shadow cursor-pointer group"
                  onClick={() => onTaskClick?.(task)}
                >
                  {/* Labels */}
                  {task.labels && task.labels.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {task.labels.slice(0, 3).map((label, i) => (
                        <Badge key={i} variant="secondary" className="text-[9px] px-1.5 py-0">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Title */}
                  <h4 className="text-sm font-medium leading-snug">{task.title}</h4>

                  {/* Subtask progress */}
                  {task.subtasks && task.subtasks.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{
                            width: `${(task.subtasks.filter((s) => s.completed).length / task.subtasks.length) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                      </span>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${getPriorityDot(task.priority)}`}
                        title={task.priority}
                      />
                      {task.dueDate && (
                        <span className="text-[11px] text-muted-foreground">
                          {format(new Date(task.dueDate), 'MMM d')}
                        </span>
                      )}
                    </div>
                    {task.assignedTo && typeof task.assignedTo === 'object' && (
                      <div
                        className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-semibold text-primary"
                        title={(task.assignedTo as User).name}
                      >
                        {(task.assignedTo as User).name?.[0]}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {columnTasks.length === 0 && (
                <div className="flex items-center justify-center py-8 text-xs text-muted-foreground/50">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
