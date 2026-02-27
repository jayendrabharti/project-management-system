import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Trash2,
  Edit2,
  Save,
  X,
  MessageSquare,
  CheckSquare,
  Clock,
  Tag,
  Send,
  Square,
  CheckSquare2,
  Loader2,
  User as UserIcon,
} from 'lucide-react';
import taskService from '../services/task.service';
import commentService from '../services/comment.service';
import type { Comment } from '../services/comment.service';
import type { Task, User } from '../types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

interface TaskDetailDrawerProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdate: () => void;
}

export default function TaskDetailDrawer({
  task,
  open,
  onOpenChange,
  onTaskUpdate,
}: TaskDetailDrawerProps) {
  const { user: currentUser } = useAuth();
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [savingComment, setSavingComment] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [fullTask, setFullTask] = useState<Task | null>(null);

  useEffect(() => {
    if (task && open) {
      setFullTask(task);
      setTitle(task.title);
      setDescription(task.description || '');
      setEditingTitle(false);
      setEditingDesc(false);
      loadComments(task._id);
    }
  }, [task, open]);

  const loadComments = async (taskId: string) => {
    setLoadingComments(true);
    try {
      const data = await commentService.getComments(taskId);
      setComments(data);
    } catch {
      // silent
    } finally {
      setLoadingComments(false);
    }
  };

  const handleUpdateField = async (field: string, value: any) => {
    if (!fullTask) return;
    try {
      const updated = await taskService.updateTask(fullTask._id, { [field]: value });
      setFullTask((prev) => (prev ? { ...prev, ...updated } : prev));
      onTaskUpdate();
      toast.success('Task updated');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to update');
    }
  };

  const handleSaveTitle = async () => {
    if (title.trim() && title !== fullTask?.title) {
      await handleUpdateField('title', title.trim());
    }
    setEditingTitle(false);
  };

  const handleSaveDescription = async () => {
    if (description !== (fullTask?.description || '')) {
      await handleUpdateField('description', description);
    }
    setEditingDesc(false);
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    if (!fullTask) return;
    try {
      const updated = await taskService.toggleSubtask(fullTask._id, subtaskId);
      setFullTask(updated);
      onTaskUpdate();
    } catch {
      toast.error('Failed to toggle subtask');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !fullTask) return;
    setSavingComment(true);
    try {
      const comment = await commentService.createComment(fullTask._id, newComment.trim());
      setComments((prev) => [...prev, comment]);
      setNewComment('');
    } catch {
      toast.error('Failed to add comment');
    } finally {
      setSavingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const handleDelete = async () => {
    if (!fullTask || !confirm('Delete this task permanently?')) return;
    setDeleting(true);
    try {
      await taskService.deleteTask(fullTask._id);
      toast.success('Task deleted');
      onOpenChange(false);
      onTaskUpdate();
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setDeleting(false);
    }
  };

  const statusOptions = [
    { value: 'todo', label: 'To Do', color: 'bg-muted-foreground/30' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
    { value: 'in-review', label: 'In Review', color: 'bg-amber-500' },
    { value: 'completed', label: 'Completed', color: 'bg-emerald-500' },
  ];

  const priorityOptions = [
    { value: 'urgent', label: 'Urgent', color: 'text-red-500' },
    { value: 'high', label: 'High', color: 'text-orange-500' },
    { value: 'medium', label: 'Medium', color: 'text-yellow-500' },
    { value: 'low', label: 'Low', color: 'text-blue-500' },
    { value: 'none', label: 'None', color: 'text-muted-foreground' },
  ];

  if (!fullTask) return null;

  const assignee =
    fullTask.assignedTo && typeof fullTask.assignedTo === 'object'
      ? (fullTask.assignedTo as User)
      : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className="text-base sr-only">Task Details</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </SheetHeader>

        <div className="space-y-5">
          {/* Title */}
          <div>
            {editingTitle ? (
              <div className="flex items-center gap-2">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="font-semibold text-lg h-9"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle()}
                />
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={handleSaveTitle}>
                  <Save className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => {
                    setTitle(fullTask.title);
                    setEditingTitle(false);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <h2
                className="font-semibold text-lg cursor-pointer hover:text-primary transition-colors flex items-center gap-2"
                onClick={() => setEditingTitle(true)}
              >
                {fullTask.title}
                <Edit2 className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
              </h2>
            )}
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={fullTask.status}
                onValueChange={(value) => handleUpdateField('status', value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${opt.color}`} />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Priority</Label>
              <Select
                value={fullTask.priority}
                onValueChange={(value) => handleUpdateField('priority', value)}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${opt.color}`}>●</span>
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Assignee & Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <UserIcon className="h-3 w-3" /> Assignee
              </Label>
              {assignee ? (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                    {assignee.name?.[0]}
                  </div>
                  <span className="text-sm">{assignee.name}</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground p-2">Unassigned</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" /> Due Date
              </Label>
              <p className="text-sm p-2">
                {fullTask.dueDate ? (
                  format(new Date(fullTask.dueDate), 'MMM d, yyyy')
                ) : (
                  <span className="text-muted-foreground">No due date</span>
                )}
              </p>
            </div>
          </div>

          {/* Labels */}
          {fullTask.labels && fullTask.labels.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Tag className="h-3 w-3" /> Labels
              </Label>
              <div className="flex gap-1.5 flex-wrap">
                {fullTask.labels.map((label, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Description</Label>
            {editingDesc ? (
              <div className="space-y-2">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveDescription}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setDescription(fullTask.description || '');
                      setEditingDesc(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 p-2 rounded-lg min-h-[40px] transition-colors"
                onClick={() => setEditingDesc(true)}
              >
                {fullTask.description || 'Click to add description...'}
              </div>
            )}
          </div>

          <Separator />

          {/* Subtasks */}
          {fullTask.subtasks && fullTask.subtasks.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckSquare className="h-3 w-3" />
                Subtasks ({fullTask.subtasks.filter((s) => s.completed).length}/
                {fullTask.subtasks.length})
              </Label>
              <div className="space-y-1">
                {fullTask.subtasks.map((subtask) => (
                  <button
                    key={subtask._id}
                    className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                    onClick={() => handleToggleSubtask(subtask._id)}
                  >
                    {subtask.completed ? (
                      <CheckSquare2 className="h-4 w-4 text-primary flex-shrink-0" />
                    ) : (
                      <Square className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}
                    >
                      {subtask.title}
                    </span>
                  </button>
                ))}
              </div>
              <Separator />
            </div>
          )}

          {/* Comments */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              Comments ({comments.length})
            </Label>

            {loadingComments ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading...
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment._id} className="flex items-start gap-2.5 group">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary flex-shrink-0 mt-0.5">
                      {comment.author?.name?.[0] || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{comment.author?.name}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">{comment.content}</p>
                    </div>
                    {comment.author?._id === (currentUser as any)?._id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteComment(comment._id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add comment */}
            <div className="flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="h-9 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
              />
              <Button
                size="icon"
                className="h-9 w-9 flex-shrink-0"
                onClick={handleAddComment}
                disabled={!newComment.trim() || savingComment}
              >
                {savingComment ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
