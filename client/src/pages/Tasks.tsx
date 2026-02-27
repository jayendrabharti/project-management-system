import { useState, useEffect } from 'react';
import {
  Plus,
  ListTodo,
  Search,
  LayoutGrid,
  List,
  Table2,
  MoreHorizontal,
  Edit,
  Trash2,
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import CreateTaskDialog from '../components/CreateTaskDialog';
import EditTaskDialog from '../components/EditTaskDialog';
import TaskDetailDrawer from '../components/TaskDetailDrawer';
import KanbanBoard from '../components/KanbanBoard';
import taskService from '../services/task.service';
import type { Task, User } from '../types';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'board' | 'table'>('list');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const data = await taskService.getTasks();
      setTasks(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm('Delete this task?')) return;
    try {
      await taskService.deleteTask(taskId);
      toast.success('Task deleted');
      loadTasks();
    } catch {
      toast.error('Failed to delete task');
    }
  };

  const handleEditClick = (task: Task, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditTask(task);
    setEditOpen(true);
  };

  const handleTaskClick = (task: Task) => {
    setDetailTask(task);
    setDetailOpen(true);
  };

  const filteredTasks = tasks.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (searchQuery && !t.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getPriorityBadge = (priority: string) => {
    const map: Record<string, string> = {
      urgent: 'bg-red-500/15 text-red-600 dark:text-red-400',
      high: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
      medium: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
      low: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
      none: 'bg-muted text-muted-foreground',
    };
    return map[priority] || '';
  };

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      todo: 'bg-muted text-muted-foreground',
      'in-progress': 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
      'in-review': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
      completed: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    };
    return map[status] || '';
  };

  const statusLabels: Record<string, string> = {
    todo: 'To Do',
    'in-progress': 'In Progress',
    'in-review': 'In Review',
    completed: 'Completed',
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ListTodo className="h-6 w-6 text-primary" />
            My Tasks
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{tasks.length} tasks total</p>
        </div>
        <Button className="gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="in-review">In Review</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[140px] h-9">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="none">None</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border border-border rounded-lg overflow-hidden ml-auto">
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-9 w-9 rounded-none"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'board' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-9 w-9 rounded-none"
            onClick={() => setView('board')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'table' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-9 w-9 rounded-none"
            onClick={() => setView('table')}
          >
            <Table2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* View content */}
      {view === 'board' ? (
        <KanbanBoard tasks={filteredTasks} onTaskUpdate={loadTasks} onTaskClick={handleTaskClick} />
      ) : view === 'table' ? (
        <Card className="border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Title</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Priority
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Project</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Assignee
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                    Due Date
                  </th>
                  <th className="text-right py-3 px-4 font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr
                    key={task._id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => handleTaskClick(task)}
                  >
                    <td className="py-3 px-4 font-medium">{task.title}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize ${getStatusBadge(task.status)}`}
                      >
                        {statusLabels[task.status] || task.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize ${getPriorityBadge(task.priority)}`}
                      >
                        {task.priority}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {typeof task.project === 'object' ? task.project?.name : '—'}
                    </td>
                    <td className="py-3 px-4">
                      {task.assignedTo && typeof task.assignedTo === 'object' ? (
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-semibold text-primary">
                            {(task.assignedTo as User).name?.[0]}
                          </div>
                          <span className="text-xs">{(task.assignedTo as User).name}</span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e: any) => handleEditClick(task, e)}
                            className="gap-2"
                          >
                            <Edit className="h-3.5 w-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e: any) => handleDeleteTask(task._id, e)}
                            className="gap-2 text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="space-y-2 animate-in-list">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16">
              <ListTodo className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
              <h3 className="text-lg font-medium">No tasks found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery
                  ? 'Try a different search term'
                  : 'Create your first task to get started'}
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task._id}
                className="flex items-center gap-4 p-3.5 rounded-lg border border-border/50 hover:bg-muted/30 cursor-pointer transition-colors group"
                onClick={() => handleTaskClick(task)}
              >
                <div
                  className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                    task.priority === 'urgent'
                      ? 'bg-red-500'
                      : task.priority === 'high'
                        ? 'bg-orange-500'
                        : task.priority === 'medium'
                          ? 'bg-yellow-500'
                          : task.priority === 'low'
                            ? 'bg-blue-500'
                            : 'bg-muted-foreground/30'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`font-medium text-sm truncate ${
                        task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.labels?.slice(0, 2).map((label, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] flex-shrink-0">
                        {label}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {typeof task.project === 'object' && task.project && (
                      <span className="flex items-center gap-1">
                        <span className="text-sm">{task.project.icon || '📁'}</span>
                        {task.project.name}
                      </span>
                    )}
                    {task.dueDate && <span>Due {format(new Date(task.dueDate), 'MMM d')}</span>}
                    {task.subtasks?.length > 0 && (
                      <span>
                        {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}{' '}
                        subtasks
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge
                    variant="outline"
                    className={`text-[10px] capitalize ${getStatusBadge(task.status)}`}
                  >
                    {statusLabels[task.status] || task.status}
                  </Badge>
                  {task.assignedTo && typeof task.assignedTo === 'object' && (
                    <div
                      className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-semibold text-primary"
                      title={(task.assignedTo as User).name}
                    >
                      {(task.assignedTo as User).name?.[0]}
                    </div>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e: any) => handleEditClick(task, e)}
                        className="gap-2"
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e: any) => handleDeleteTask(task._id, e)}
                        className="gap-2 text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <CreateTaskDialog open={createOpen} onOpenChange={setCreateOpen} onSuccess={loadTasks} />
      <EditTaskDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        task={editTask}
        onSuccess={loadTasks}
      />
      <TaskDetailDrawer
        task={detailTask}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onTaskUpdate={loadTasks}
      />
    </div>
  );
}
