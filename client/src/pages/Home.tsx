import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  TrendingUp,
  FolderKanban,
  CheckCircle,
  Clock,
  ArrowRight,
  AlertTriangle,
  Sparkles,
  ListTodo,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { Skeleton } from '../components/ui/skeleton';
import CreateProjectDialog from '../components/CreateProjectDialog';
import projectService from '../services/project.service';
import taskService from '../services/task.service';
import type { Project, Task } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, tasksData] = await Promise.all([
        projectService.getProjects(),
        taskService.getTasks({}),
      ]);
      setProjects(projectsData);
      setTasks(tasksData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const firstName = user?.name?.split(' ')[0] || 'there';
  const activeTasks = tasks.filter((t) => t.status !== 'completed').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
  );
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const recentTasks = tasks
    .filter((t) => t.status !== 'completed')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const recentProjects = projects.slice(0, 4);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-500 bg-red-500/10';
      case 'medium':
        return 'text-amber-500 bg-amber-500/10';
      case 'low':
        return 'text-blue-500 bg-blue-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-progress':
        return <Clock className="h-3.5 w-3.5 text-amber-500" />;
      case 'completed':
        return <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />;
      default:
        return <ListTodo className="h-3.5 w-3.5 text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 rounded-xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-border p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">{getGreeting()}</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{firstName}!</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {activeTasks > 0
                ? `You have ${activeTasks} active task${activeTasks !== 1 ? 's' : ''} across ${projects.length} project${projects.length !== 1 ? 's' : ''}.`
                : 'No active tasks. Create a project to get started!'}
            </p>
          </div>
          <Button onClick={() => setCreateProjectOpen(true)} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card
          className="group hover:shadow-md transition-shadow duration-200 cursor-pointer"
          onClick={() => navigate('/projects')}
        >
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <FolderKanban className="h-4.5 w-4.5 text-violet-500" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-all" />
            </div>
            <p className="text-2xl font-bold">{projects.length}</p>
            <p className="text-xs text-muted-foreground">
              {projects.filter((p) => p.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card
          className="group hover:shadow-md transition-shadow duration-200 cursor-pointer"
          onClick={() => navigate('/tasks')}
        >
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <ListTodo className="h-4.5 w-4.5 text-blue-500" />
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-all" />
            </div>
            <p className="text-2xl font-bold">{activeTasks}</p>
            <p className="text-xs text-muted-foreground">{inProgressTasks} in progress</p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-shadow duration-200">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="h-9 w-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <TrendingUp className="h-4.5 w-4.5 text-emerald-500" />
              </div>
            </div>
            <p className="text-2xl font-bold">{completionRate}%</p>
            <p className="text-xs text-muted-foreground">{completedTasks} completed</p>
          </CardContent>
        </Card>

        <Card
          className={`group hover:shadow-md transition-shadow duration-200 ${overdueTasks.length > 0 ? 'border-red-500/30' : ''}`}
        >
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-2">
              <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center ${overdueTasks.length > 0 ? 'bg-red-500/10' : 'bg-muted'}`}
              >
                <AlertTriangle
                  className={`h-4.5 w-4.5 ${overdueTasks.length > 0 ? 'text-red-500' : 'text-muted-foreground'}`}
                />
              </div>
            </div>
            <p className="text-2xl font-bold">{overdueTasks.length}</p>
            <p className="text-xs text-muted-foreground">overdue tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Tasks</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1"
                onClick={() => navigate('/tasks')}
              >
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <div className="text-center py-8">
                <ListTodo className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No active tasks</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentTasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer group"
                    onClick={() => navigate('/tasks')}
                  >
                    {getStatusIcon(task.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {task.project && typeof task.project === 'object' && (
                          <span className="text-[11px] text-muted-foreground truncate">
                            {(task.project as any).name}
                          </span>
                        )}
                        {task.dueDate && (
                          <span
                            className={`text-[11px] ${new Date(task.dueDate) < new Date() && task.status !== 'completed' ? 'text-red-500' : 'text-muted-foreground'}`}
                          >
                            {new Date(task.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                    <Badge
                      className={`text-[10px] ${getPriorityColor(task.priority)}`}
                      variant="secondary"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Projects Overview */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Projects</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1"
                onClick={() => navigate('/projects')}
              >
                View all <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentProjects.length === 0 ? (
              <div className="text-center py-8">
                <FolderKanban className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No projects yet</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 gap-1.5 text-xs"
                  onClick={() => setCreateProjectOpen(true)}
                >
                  <Plus className="h-3 w-3" /> Create project
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => {
                  const projectTasks = tasks.filter(
                    (t) =>
                      (typeof t.project === 'string' ? t.project : (t.project as any)?._id) ===
                      project._id
                  );
                  const done = projectTasks.filter((t) => t.status === 'completed').length;
                  const progress =
                    projectTasks.length > 0 ? Math.round((done / projectTasks.length) * 100) : 0;

                  return (
                    <div
                      key={project._id}
                      className="p-3 rounded-lg border border-border hover:bg-accent/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/projects/${project._id}`)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium truncate">{project.name}</h3>
                        <Badge variant="secondary" className="text-[10px]">
                          {project.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="h-1.5 flex-1" />
                        <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                          {progress}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex -space-x-1.5">
                          {Array.isArray(project.members) &&
                            project.members.slice(0, 3).map((member, i) => (
                              <Avatar key={i} className="h-5 w-5 border border-background">
                                <AvatarFallback className="text-[9px]">
                                  {typeof member === 'string' ? 'U' : member.name?.charAt(0) || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {projectTasks.length} tasks
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        onSuccess={loadData}
      />
    </div>
  );
}
