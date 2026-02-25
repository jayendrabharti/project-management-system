import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, ListFilter, Clock, CheckCircle, ListTodo } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import CreateTaskDialog from '../components/CreateTaskDialog';
import EditTaskDialog from '../components/EditTaskDialog';
import taskService from '../services/task.service';
import type { Task } from '../types';

const statusFilters = [
  { value: 'all', label: 'All', icon: ListFilter },
  { value: 'todo', label: 'To Do', icon: ListTodo },
  { value: 'in-progress', label: 'In Progress', icon: Clock },
  { value: 'completed', label: 'Done', icon: CheckCircle },
] as const;

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'todo' | 'in-progress' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasks(filter === 'all' ? {} : { status: filter });
      setTasks(data);
    } catch (err: any) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleToggleComplete = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    try {
      await taskService.updateTask(task._id, { status: newStatus });
      loadTasks();
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setEditDialogOpen(true);
  };

  const handleDelete = async (task: Task) => {
    if (!confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    try {
      await taskService.deleteTask(task._id);
      toast.success('Task deleted');
      loadTasks();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-500/10 border-red-500/20';
      case 'medium':
        return 'text-amber-600 bg-amber-500/10 border-amber-500/20';
      case 'low':
        return 'text-blue-600 bg-blue-500/10 border-blue-500/20';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-emerald-600 bg-emerald-500/10';
      case 'in-progress':
        return 'text-amber-600 bg-amber-500/10';
      default:
        return 'text-blue-600 bg-blue-500/10';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === now.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (task: Task) =>
    task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

  const getProjectName = (project: any) => (typeof project === 'string' ? '' : project?.name || '');

  const getAssigneeInitials = (assignedTo: any) => {
    if (!assignedTo || typeof assignedTo === 'string') return 'U';
    return (
      assignedTo.name
        ?.split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U'
    );
  };

  // Filter by search query
  const filteredTasks = tasks.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Stats
  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-28" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filter === 'all' ? `${tasks.length} total` : `${tasks.length} ${filter}`}
            {filter === 'all' && ` · ${inProgressCount} in progress · ${completedCount} done`}
          </p>
        </div>
        <Button className="gap-2" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
          {statusFilters.map((f) => {
            const Icon = f.icon;
            const count =
              f.value === 'all'
                ? tasks.length
                : f.value === 'todo'
                  ? todoCount
                  : f.value === 'in-progress'
                    ? inProgressCount
                    : completedCount;
            return (
              <Button
                key={f.value}
                variant={filter === f.value ? 'default' : 'ghost'}
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => setFilter(f.value as any)}
              >
                <Icon className="h-3.5 w-3.5" />
                {f.label}
                <span className="ml-0.5 text-[10px] opacity-60">{count}</span>
              </Button>
            );
          })}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="pl-9 h-8 text-sm bg-muted/50 border-transparent focus:bg-background focus:border-border"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <ListTodo className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              {searchQuery ? 'No matching tasks' : 'No tasks yet'}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {searchQuery
                ? 'Try a different search term'
                : 'Create your first task to get started'}
            </p>
            {!searchQuery && (
              <Button className="mt-4 gap-2" size="sm" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-3.5 w-3.5" />
                Create Task
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1.5">
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-accent/30 hover:border-border/80 transition-all group cursor-pointer"
              onClick={() => handleEdit(task)}
            >
              {/* Checkbox */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleComplete(task);
                }}
                className={`h-[18px] w-[18px] rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  task.status === 'completed'
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-muted-foreground/30 hover:border-primary'
                }`}
              >
                {task.status === 'completed' && <CheckCircle className="h-3 w-3 text-white" />}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium truncate ${
                      task.status === 'completed'
                        ? 'line-through text-muted-foreground'
                        : 'text-foreground'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {getProjectName(task.project) && (
                    <span className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                      {getProjectName(task.project)}
                    </span>
                  )}
                  {task.dueDate && (
                    <>
                      {getProjectName(task.project) && (
                        <span className="text-muted-foreground/30">·</span>
                      )}
                      <span
                        className={`text-[11px] ${isOverdue(task) ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}
                      >
                        {formatDate(task.dueDate)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-2">
                <Badge
                  className={`text-[10px] px-1.5 py-0 h-5 ${getPriorityStyle(task.priority)}`}
                  variant="outline"
                >
                  {task.priority}
                </Badge>
                <Badge
                  className={`text-[10px] px-1.5 py-0 h-5 ${getStatusStyle(task.status)}`}
                  variant="secondary"
                >
                  {task.status === 'in-progress'
                    ? 'In Progress'
                    : task.status === 'todo'
                      ? 'To Do'
                      : 'Done'}
                </Badge>
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-[10px]">
                    {getAssigneeInitials(task.assignedTo)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(task);
                    }}
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(task);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadTasks}
      />
      <EditTaskDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={loadTasks}
        task={selectedTask}
      />
    </div>
  );
}
