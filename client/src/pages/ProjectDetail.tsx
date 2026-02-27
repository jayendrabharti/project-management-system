import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Activity,
  LayoutGrid,
  List,
  Trash2,
  Edit,
  Plus,
  UserPlus,
  UserMinus,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Skeleton } from '../components/ui/skeleton';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import KanbanBoard from '../components/KanbanBoard';
import CreateTaskDialog from '../components/CreateTaskDialog';
import EditProjectDialog from '../components/EditProjectDialog';
import TaskDetailDrawer from '../components/TaskDetailDrawer';
import projectService from '../services/project.service';
import taskService from '../services/task.service';
import activityService from '../services/activity.service';
import userService from '../services/user.service';
import type { Project, Task, User, ActivityLog } from '../types';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskView, setTaskView] = useState<'board' | 'list'>('board');

  // Dialogs
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Member management
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [p, t, a] = await Promise.all([
        projectService.getProject(id!),
        taskService.getTasks({ project: id }),
        activityService.getProjectActivity(id!),
      ]);
      setProject(p);
      setTasks(t);
      setActivities(a);
    } catch {
      toast.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const users = await userService.getUsers();
      setAllUsers(users);
    } catch {
      // silent
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await projectService.deleteProject(id!);
      toast.success('Project deleted');
      navigate('/projects');
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!project) return;
    setAddingMember(true);
    try {
      const currentMemberIds = (project.members as User[]).map((m: any) => m._id || m);
      await projectService.updateProject(project._id, {
        members: [...currentMemberIds, userId],
      });
      toast.success('Member added');
      loadData();
      setMemberSearch('');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!project || !confirm('Remove this member from the project?')) return;
    try {
      const currentMemberIds = (project.members as User[])
        .map((m: any) => m._id || m)
        .filter((mid: string) => mid !== userId);
      await projectService.updateProject(project._id, {
        members: currentMemberIds,
      });
      toast.success('Member removed');
      loadData();
    } catch {
      toast.error('Failed to remove member');
    }
  };

  const handleTaskClick = (task: Task) => {
    setDetailTask(task);
    setDetailOpen(true);
  };

  const getPriorityDot = (p: string) => {
    const m: Record<string, string> = {
      urgent: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-blue-500',
      none: 'bg-muted-foreground/30',
    };
    return m[p] || m.none;
  };

  const getStatusBadge = (s: string) => {
    const map: Record<string, string> = {
      todo: 'bg-muted text-muted-foreground',
      'in-progress': 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
      'in-review': 'bg-amber-500/15 text-amber-600',
      completed: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    };
    return map[s] || '';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  if (!project) {
    return <div className="p-6 text-center text-muted-foreground">Project not found</div>;
  }

  const progress =
    project.taskCount && project.taskCount > 0
      ? Math.round(((project.completedTaskCount || 0) / project.taskCount) * 100)
      : 0;

  const members = (project.members || []) as User[];
  const owner = project.owner as User;
  const existingMemberIds = new Set([...members.map((m: any) => m._id || m), (owner as any)?._id]);
  const filteredUsers = allUsers.filter(
    (u) =>
      !existingMemberIds.has(u._id) && u.name?.toLowerCase().includes(memberSearch.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="mt-0.5"
            onClick={() => navigate('/projects')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
              style={{ backgroundColor: (project.color || '#7c3aed') + '20' }}
            >
              {project.icon || '📁'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{project.name}</h1>
                <Badge
                  variant="outline"
                  className={`capitalize text-xs ${
                    project.status === 'active'
                      ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : project.status === 'completed'
                        ? 'border-blue-500/30 text-blue-600'
                        : 'text-muted-foreground'
                  }`}
                >
                  {project.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setEditProjectOpen(true)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2 text-sm">
            <span className="text-muted-foreground">Overall Progress</span>
            <span className="font-semibold">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
            <span>{project.completedTaskCount || 0} completed</span>
            <span>{(project.taskCount || 0) - (project.completedTaskCount || 0)} remaining</span>
            <span>{members.length + 1} members</span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks" className="gap-1.5 text-xs">
            <LayoutGrid className="h-3.5 w-3.5" /> Tasks
          </TabsTrigger>
          <TabsTrigger
            value="members"
            className="gap-1.5 text-xs"
            onClick={() => allUsers.length === 0 && loadUsers()}
          >
            <Users className="h-3.5 w-3.5" /> Members
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5 text-xs">
            <Activity className="h-3.5 w-3.5" /> Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex border border-border rounded-lg overflow-hidden">
              <Button
                variant={taskView === 'board' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-none h-8 text-xs gap-1"
                onClick={() => setTaskView('board')}
              >
                <LayoutGrid className="h-3.5 w-3.5" /> Board
              </Button>
              <Button
                variant={taskView === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                className="rounded-none h-8 text-xs gap-1"
                onClick={() => setTaskView('list')}
              >
                <List className="h-3.5 w-3.5" /> List
              </Button>
            </div>
            <Badge variant="secondary" className="text-xs">
              {tasks.length} tasks
            </Badge>
            <Button size="sm" className="ml-auto gap-1" onClick={() => setCreateTaskOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Add Task
            </Button>
          </div>

          {taskView === 'board' ? (
            <KanbanBoard tasks={tasks} onTaskUpdate={loadData} onTaskClick={handleTaskClick} />
          ) : (
            <div className="space-y-2">
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">No tasks yet.</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 gap-1"
                    onClick={() => setCreateTaskOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" /> Create First Task
                  </Button>
                </div>
              ) : (
                tasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group"
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className={`h-2.5 w-2.5 rounded-full ${getPriorityDot(task.priority)}`} />
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium truncate ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                        {task.dueDate && <span>Due {format(new Date(task.dueDate), 'MMM d')}</span>}
                        {task.subtasks && task.subtasks?.length > 0 && (
                          <span>
                            {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}{' '}
                            subtasks
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] capitalize ${getStatusBadge(task.status)}`}
                    >
                      {task.status.replace('-', ' ')}
                    </Badge>
                    {task.assignedTo && typeof task.assignedTo === 'object' && (
                      <div
                        className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-semibold text-primary"
                        title={(task.assignedTo as User).name}
                      >
                        {(task.assignedTo as User).name?.[0]}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="members">
          <div className="space-y-4">
            {/* Add member */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users to add..."
                  className="pl-9 h-9"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  onFocus={() => allUsers.length === 0 && loadUsers()}
                />
              </div>
            </div>

            {/* Search results */}
            {memberSearch && filteredUsers.length > 0 && (
              <div className="border border-border rounded-lg p-2 max-h-40 overflow-y-auto space-y-1">
                {filteredUsers.slice(0, 5).map((user) => (
                  <button
                    key={user._id}
                    className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors text-left"
                    onClick={() => handleAddMember(user._id)}
                    disabled={addingMember}
                  >
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary">
                      {user.name?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto text-[10px]">
                      Add
                    </Badge>
                  </button>
                ))}
              </div>
            )}

            {/* Members list */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Owner */}
              <Card className="border-primary/30">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-semibold text-primary">
                    {owner?.name?.[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{owner?.name}</p>
                    <p className="text-xs text-muted-foreground">{owner?.email}</p>
                    <Badge
                      variant="outline"
                      className="text-[10px] mt-1 border-primary/30 text-primary"
                    >
                      Owner
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              {/* Members */}
              {members.map((member: any) => (
                <Card key={member._id || member.id} className="border-border/50 group">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-lg font-semibold">
                      {member.name?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                      <Badge variant="secondary" className="text-[10px] mt-1">
                        Member
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                      onClick={() => handleRemoveMember(member._id || member.id)}
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-3">
              {activities.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
              ) : (
                activities.map((a) => (
                  <div key={a._id} className="flex items-start gap-3 text-sm">
                    <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary flex-shrink-0 mt-0.5">
                      {a.user?.name?.[0] || '?'}
                    </div>
                    <div>
                      <p>
                        <span className="font-medium">{a.user?.name}</span>
                        <span className="text-muted-foreground"> {a.action} </span>
                        <span className="font-medium">{a.entityName}</span>
                      </p>
                      {a.details && (
                        <p className="text-xs text-muted-foreground mt-0.5">{a.details}</p>
                      )}
                      <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                        {format(new Date(a.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        onSuccess={loadData}
        preselectedProjectId={id}
      />
      <EditProjectDialog
        open={editProjectOpen}
        onOpenChange={setEditProjectOpen}
        project={project}
        onSuccess={loadData}
      />
      <TaskDetailDrawer
        task={detailTask}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onTaskUpdate={loadData}
      />
    </div>
  );
}
