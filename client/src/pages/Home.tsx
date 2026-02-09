import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Users, FolderKanban, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import projectService from '../services/project.service';
import taskService from '../services/task.service';
import type { Project, Task } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: _user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [projectsData, tasksData] = await Promise.all([
        projectService.getProjects(),
        taskService.getTasks(),
      ]);
      setProjects(projectsData);
      setTasks(tasksData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: 'Total Projects',
      value: projects.length.toString(),
      icon: FolderKanban,
      change: projects.filter((p) => p.status === 'active').length + ' active',
      trend: 'up',
    },
    {
      label: 'Active Tasks',
      value: tasks.filter((t) => t.status !== 'completed').length.toString(),
      icon: CheckCircle,
      change: tasks.filter((t) => t.status === 'in-progress').length + ' in progress',
      trend: 'up',
    },
    {
      label: 'Completed Tasks',
      value: tasks.filter((t) => t.status === 'completed').length.toString(),
      icon: TrendingUp,
      change:
        Math.round((tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100) +
        '%',
      trend: 'up',
    },
    {
      label: 'Total Tasks',
      value: tasks.length.toString(),
      icon: Users,
      change: 'All tasks',
      trend: 'up',
    },
  ];

  const recentProjects = projects.slice(0, 3);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back, John!</h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your projects today.
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-chart-1 mt-1">{stat.change} from last month</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>Your active projects and their progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div
                key={project.name}
                className="flex items-center justify-between p-4 rounded-lg border border-border"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FolderKanban className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{project.name}</h3>
                      <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex -space-x-2">
                        {Array.isArray(project.members) &&
                          project.members.slice(0, 3).map((member, i) => (
                            <Avatar key={i} className="h-6 w-6 border-2 border-background">
                              <AvatarFallback>
                                {typeof member === 'string' ? 'U' : member.name?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Created {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="sm">
                    View Project
                  </Button>
                </div>
              </div>
            ))}

            {recentProjects.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No recent projects. Create your first project to get started!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
