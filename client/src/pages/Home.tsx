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
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Skeleton } from '../components/ui/skeleton';
import projectService from '../services/project.service';
import taskService from '../services/task.service';
import activityService from '../services/activity.service';
import type { Project, Task, ActivityLog } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { format, isAfter, isBefore, addDays } from 'date-fns';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [p, t, a] = await Promise.all([
        projectService.getProjects(),
        taskService.getTasks(),
        activityService.getActivity(15),
      ]);
      setProjects(p);
      setTasks(t);
      setActivities(a);
    } catch {
      // fail silently
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && isBefore(new Date(t.dueDate), new Date()) && t.status !== 'completed'
  ).length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
  const activeProjects = projects.filter((p) => p.status === 'active').length;

  const upcomingTasks = tasks
    .filter(
      (t) =>
        t.dueDate &&
        t.status !== 'completed' &&
        isBefore(new Date(t.dueDate), addDays(new Date(), 7)) &&
        isAfter(new Date(t.dueDate), new Date())
    )
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const recentProjects = projects.slice(0, 4);

  const getPriorityColor = (priority: string) => {
    const map: Record<string, string> = {
      urgent: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20',
      high: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20',
      medium: 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
      low: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
      none: 'bg-muted text-muted-foreground border-border',
    };
    return map[priority] || map.none;
  };

  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      todo: 'bg-muted text-muted-foreground',
      'in-progress': 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
      'in-review': 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
      completed: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    };
    return map[status] || '';
  };

  const stats = [
    {
      title: 'Total Tasks',
      value: totalTasks,
      icon: ListTodo,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      title: 'Completed',
      value: completedTasks,
      icon: CheckCircle,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
    },
    {
      title: 'In Progress',
      value: inProgressTasks,
      icon: TrendingUp,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      title: 'Overdue',
      value: overdueTasks,
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {getGreeting()}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's what's happening across your projects today.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => navigate('/projects')}
          >
            <FolderKanban className="h-4 w-4" />
            New Project
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => navigate('/tasks')}>
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in-list">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="card-hover border-border/50">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div
                    className={`h-11 w-11 rounded-xl ${stat.bg} flex items-center justify-center`}
                  >
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
                {stat.title === 'Total Tasks' && totalTasks > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Progress</span>
                      <span>{Math.round((completedTasks / totalTasks) * 100)}%</span>
                    </div>
                    <Progress value={(completedTasks / totalTasks) * 100} className="h-1.5" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects */}
        <Card className="lg:col-span-2 border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-primary" />
                Active Projects
                <Badge variant="secondary" className="text-xs">
                  {activeProjects}
                </Badge>
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1"
                onClick={() => navigate('/projects')}
              >
                View All <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentProjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <FolderKanban className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No projects yet. Create your first project!
              </div>
            ) : (
              recentProjects.map((project) => {
                const progress =
                  project.taskCount && project.taskCount > 0
                    ? Math.round(((project.completedTaskCount || 0) / project.taskCount) * 100)
                    : 0;
                return (
                  <div
                    key={project._id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                    onClick={() => navigate(`/projects/${project._id}`)}
                  >
                    <div
                      className="h-10 w-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: project.color + '20' }}
                    >
                      {project.icon || '📁'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                          {project.name}
                        </p>
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize ${project.status === 'active' ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400' : ''}`}
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {project.completedTaskCount || 0}/{project.taskCount || 0} tasks
                        </span>
                        <Progress value={progress} className="h-1 flex-1 max-w-[100px]" />
                        <span className="text-xs text-muted-foreground">{progress}%</span>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                No upcoming deadlines. You're all caught up!
              </div>
            ) : (
              upcomingTasks.map((task) => (
                <div
                  key={task._id}
                  className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate('/tasks')}
                >
                  <div
                    className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${
                      task.priority === 'urgent'
                        ? 'bg-red-500'
                        : task.priority === 'high'
                          ? 'bg-orange-500'
                          : task.priority === 'medium'
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Due {format(new Date(task.dueDate!), 'MMM d')}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] ${getPriorityColor(task.priority)}`}
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Feed */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {activities.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No activity yet. Start creating tasks and projects!
            </div>
          ) : (
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {activities.slice(0, 10).map((activity) => (
                <div key={activity._id} className="flex items-start gap-3 text-sm">
                  <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary flex-shrink-0 mt-0.5">
                    {activity.user?.name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user?.name}</span>
                      <span className="text-muted-foreground"> {activity.action} </span>
                      <span className="font-medium">{activity.entityName}</span>
                    </p>
                    {activity.details && (
                      <p className="text-xs text-muted-foreground mt-0.5">{activity.details}</p>
                    )}
                    <p className="text-[11px] text-muted-foreground/60 mt-0.5">
                      {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
