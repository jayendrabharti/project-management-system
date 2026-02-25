import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
  Edit,
  Archive,
  FolderKanban,
  LayoutGrid,
  List,
  ArrowRight,
  Users,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Progress } from '../components/ui/progress';
import { Skeleton } from '../components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { toast } from 'sonner';
import CreateProjectDialog from '../components/CreateProjectDialog';
import EditProjectDialog from '../components/EditProjectDialog';
import projectService from '../services/project.service';
import taskService from '../services/task.service';
import type { Project, Task } from '../types';

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [projectsData, tasksData] = await Promise.all([
        projectService.getProjects(filter === 'all' ? undefined : filter),
        taskService.getTasks({}),
      ]);
      setProjects(projectsData);
      setTasks(tasksData);
    } catch {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setEditDialogOpen(true);
  };

  const handleArchive = async (project: Project) => {
    try {
      await projectService.updateProject(project._id, { status: 'archived' });
      toast.success('Project archived');
      loadData();
    } catch {
      toast.error('Failed to archive project');
    }
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    try {
      await projectService.deleteProject(project._id);
      toast.success('Project deleted');
      loadData();
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-emerald-600 bg-emerald-500/10';
      case 'completed':
        return 'text-blue-600 bg-blue-500/10';
      case 'archived':
        return 'text-muted-foreground bg-muted';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const projectColors = [
    'bg-violet-500',
    'bg-blue-500',
    'bg-emerald-500',
    'bg-amber-500',
    'bg-rose-500',
    'bg-cyan-500',
    'bg-pink-500',
    'bg-indigo-500',
  ];
  const getProjectColor = (name: string) =>
    projectColors[name.charCodeAt(0) % projectColors.length];

  const getProjectTasks = (projectId: string) =>
    tasks.filter(
      (t) => (typeof t.project === 'string' ? t.project : (t.project as any)?._id) === projectId
    );

  const getMemberInitials = (member: any) => {
    if (typeof member === 'string') return 'U';
    return (
      member.name
        ?.split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U'
    );
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
            {' · '}
            {projects.filter((p) => p.status === 'active').length} active
          </p>
        </div>
        <Button className="gap-2" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex gap-1 p-1 bg-muted/50 rounded-lg">
          {(['all', 'active', 'completed', 'archived'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'ghost'}
              size="sm"
              className="h-8 text-xs capitalize"
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              className="pl-9 h-8 text-sm bg-muted/50 border-transparent focus:bg-background focus:border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-0.5 border border-border rounded-lg p-0.5">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              className="h-7 w-7"
              onClick={() => setViewMode('list')}
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Projects */}
      {filteredProjects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <FolderKanban className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              {searchQuery ? 'No matching projects' : 'No projects yet'}
            </p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {searchQuery
                ? 'Try a different search term'
                : 'Create your first project to get started'}
            </p>
            {!searchQuery && (
              <Button className="mt-4 gap-2" size="sm" onClick={() => setCreateDialogOpen(true)}>
                <Plus className="h-3.5 w-3.5" /> Create Project
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const pTasks = getProjectTasks(project._id);
            const done = pTasks.filter((t) => t.status === 'completed').length;
            const progress = pTasks.length > 0 ? Math.round((done / pTasks.length) * 100) : 0;

            return (
              <Card
                key={project._id}
                className="group hover:shadow-md hover:border-border/80 transition-all duration-200 cursor-pointer overflow-hidden"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                {/* Color Strip */}
                <div className={`h-1 ${getProjectColor(project.name)}`} />

                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{project.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {project.description || 'No description'}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => handleEdit(project)}>
                          <Edit className="h-3.5 w-3.5 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleArchive(project)}>
                          <Archive className="h-3.5 w-3.5 mr-2" /> Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(project)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Progress */}
                  <div className="flex items-center gap-2 mb-3">
                    <Progress value={progress} className="h-1.5 flex-1" />
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {progress}%
                    </span>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge
                        className={`text-[10px] px-1.5 py-0 h-5 ${getStatusStyle(project.status)}`}
                        variant="secondary"
                      >
                        {project.status}
                      </Badge>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {(Array.isArray(project.members) ? project.members.length : 0) + 1}
                      </div>
                    </div>
                    <div className="flex -space-x-1.5">
                      {Array.isArray(project.members) &&
                        project.members.slice(0, 3).map((member, i) => (
                          <Avatar key={i} className="h-5 w-5 border border-background">
                            <AvatarFallback className="text-[8px]">
                              {getMemberInitials(member)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-1.5">
          {filteredProjects.map((project) => {
            const pTasks = getProjectTasks(project._id);
            const done = pTasks.filter((t) => t.status === 'completed').length;
            const progress = pTasks.length > 0 ? Math.round((done / pTasks.length) * 100) : 0;

            return (
              <div
                key={project._id}
                className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card hover:bg-accent/30 transition-all group cursor-pointer"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getProjectColor(project.name)}`}
                >
                  <FolderKanban className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">{project.name}</h3>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {project.description || 'No description'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    className={`text-[10px] px-1.5 py-0 h-5 ${getStatusStyle(project.status)}`}
                    variant="secondary"
                  >
                    {project.status}
                  </Badge>
                  <div className="flex items-center gap-1.5 w-24">
                    <Progress value={progress} className="h-1.5 flex-1" />
                    <span className="text-[11px] text-muted-foreground w-8">{progress}%</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {pTasks.length} tasks
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground/60 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      <CreateProjectDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={loadData}
      />
      <EditProjectDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={loadData}
        project={selectedProject}
      />
    </div>
  );
}
