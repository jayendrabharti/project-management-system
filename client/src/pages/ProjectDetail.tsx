import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, LayoutGrid, List, Plus, Users, Calendar, Edit } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import { Progress } from '../components/ui/progress';
import { toast } from 'sonner';
import KanbanBoard from '../components/KanbanBoard';
import TaskCard from '../components/TaskCard';
import CreateTaskDialog from '../components/CreateTaskDialog';
import EditTaskDialog from '../components/EditTaskDialog';
import EditProjectDialog from '../components/EditProjectDialog';
import projectService from '../services/project.service';
import taskService from '../services/task.service';
import type { Project, Task } from '../types';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskView, setTaskView] = useState<'kanban' | 'list'>('kanban');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [projectData, tasksData] = await Promise.all([
        projectService.getProject(id),
        taskService.getTasks({ project: id }),
      ]);
      setProject(projectData);
      setTasks(tasksData);
    } catch (err: any) {
      console.error('Failed to load project:', err);
      toast.error('Error', { description: 'Failed to load project details' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setEditTaskOpen(true);
  };

  const handleDeleteTask = async (task: Task) => {
    if (!confirm(`Delete "${task.title}"?`)) return;
    try {
      await taskService.deleteTask(task._id);
      toast.success('Task deleted');
      loadData();
    } catch (error: any) {
      toast.error('Error', { description: error.message || 'Failed to delete task' });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary'> = {
      active: 'default',
      completed: 'secondary',
      archived: 'secondary',
    };
    return variants[status] || 'secondary';
  };

  // Stats
  const todoCount = tasks.filter((t) => t.status === 'todo').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  if (loading) {
    return (
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96 mb-6" />
        <div className="grid grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-foreground mb-2">Project not found</h2>
        <p className="text-muted-foreground mb-4">
          The project you're looking for doesn't exist or you don't have access.
        </p>
        <Link to="/projects">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  const members = Array.isArray(project.members) ? project.members : [];

  return (
    <div>
      {/* Breadcrumb / Back Navigation */}
      <div className="flex items-center gap-2 mb-4 text-sm">
        <Link
          to="/projects"
          className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Projects
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground font-medium">{project.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
            <Badge variant={getStatusBadge(project.status)}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Badge>
          </div>
          {project.description && (
            <p className="text-muted-foreground mt-1 max-w-2xl">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditProjectOpen(true)}>
            <Edit className="h-4 w-4 mr-1" /> Edit
          </Button>
          <Button size="sm" onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" /> Add Task
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Total Tasks</p>
            <p className="text-2xl font-bold">{tasks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">To Do</p>
            <p className="text-2xl font-bold text-blue-500">{todoCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold text-yellow-500">{inProgressCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-muted-foreground">Completed</p>
            <p className="text-2xl font-bold text-green-500">{completedCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Progress</span>
          <span className="text-sm font-bold text-foreground">{progressPercent}%</span>
        </div>
        <Progress value={progressPercent} className="h-2" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Tasks ({tasks.length})</h2>
            <div className="flex gap-1 border border-border rounded-lg p-1">
              <Button
                variant={taskView === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-2"
                onClick={() => setTaskView('kanban')}
              >
                <LayoutGrid className="h-3.5 w-3.5 mr-1" />
                Board
              </Button>
              <Button
                variant={taskView === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-2"
                onClick={() => setTaskView('list')}
              >
                <List className="h-3.5 w-3.5 mr-1" />
                List
              </Button>
            </div>
          </div>

          {taskView === 'kanban' ? (
            <KanbanBoard
              tasks={tasks}
              onTaskClick={handleTaskClick}
              onTaskUpdated={loadData}
              onCreateTask={() => setCreateDialogOpen(true)}
            />
          ) : (
            <Card>
              <CardContent className="pt-4">
                {tasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No tasks yet. Create your first task!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div
                        key={task._id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors group"
                      >
                        <div className="flex-1">
                          <TaskCard task={task} onClick={handleTaskClick} />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTask(task);
                          }}
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Members ({members.length + 1})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Owner */}
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {typeof project.owner === 'string'
                        ? 'O'
                        : project.owner.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {typeof project.owner === 'string' ? 'Owner' : project.owner.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {typeof project.owner === 'string' ? '' : project.owner.email}
                    </p>
                  </div>
                  <Badge>Owner</Badge>
                </div>

                {/* Members */}
                {members.map((member, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {typeof member === 'string'
                          ? 'M'
                          : member.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">
                        {typeof member === 'string' ? 'Member' : member.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {typeof member === 'string' ? '' : member.email}
                      </p>
                    </div>
                    <Badge variant="secondary">Member</Badge>
                  </div>
                ))}

                {members.length === 0 && (
                  <p className="text-muted-foreground text-sm text-center py-4">
                    No other members. Add members to collaborate!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={getStatusBadge(project.status)}>
                    {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="flex items-center gap-1 text-sm">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(project.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="text-sm">
                    {new Date(project.updatedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Members</span>
                  <span className="text-sm">{members.length + 1} people</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-blue-500">To Do</span>
                    <span>{todoCount}</span>
                  </div>
                  <Progress
                    value={tasks.length ? (todoCount / tasks.length) * 100 : 0}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-yellow-500">In Progress</span>
                    <span>{inProgressCount}</span>
                  </div>
                  <Progress
                    value={tasks.length ? (inProgressCount / tasks.length) * 100 : 0}
                    className="h-2"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-green-500">Completed</span>
                    <span>{completedCount}</span>
                  </div>
                  <Progress
                    value={tasks.length ? (completedCount / tasks.length) * 100 : 0}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <CreateTaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadData}
        preselectedProjectId={id}
      />
      <EditTaskDialog
        open={editTaskOpen}
        onOpenChange={setEditTaskOpen}
        onSuccess={loadData}
        task={selectedTask}
      />
      <EditProjectDialog
        open={editProjectOpen}
        onOpenChange={setEditProjectOpen}
        onSuccess={loadData}
        project={project}
      />
    </div>
  );
}
