import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  FolderKanban,
  LayoutGrid,
  List,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
} from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
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
import CreateProjectDialog from '../components/CreateProjectDialog';
import EditProjectDialog from '../components/EditProjectDialog';
import projectService from '../services/project.service';
import type { Project, User } from '../types';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    try {
      await projectService.deleteProject(projectId);
      toast.success('Project deleted');
      loadProjects();
    } catch {
      toast.error('Failed to delete project');
    }
  };

  const handleEditClick = (project: Project, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditProject(project);
    setEditOpen(true);
  };

  const filteredProjects = projects.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      active: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      completed: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
      archived: 'bg-muted text-muted-foreground border-border',
    };
    return map[status] || '';
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-44 rounded-xl" />
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
            <FolderKanban className="h-6 w-6 text-primary" />
            Projects
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{projects.length} projects total</p>
        </div>
        <Button className="gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border border-border rounded-lg overflow-hidden">
          <Button
            variant={view === 'grid' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-9 w-9 rounded-none"
            onClick={() => setView('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="icon"
            className="h-9 w-9 rounded-none"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Projects Grid/List */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16">
          <FolderKanban className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <h3 className="text-lg font-medium">No projects found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {searchQuery
              ? 'Try a different search term'
              : 'Create your first project to get started'}
          </p>
          {!searchQuery && (
            <Button className="mt-4 gap-1.5" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" /> Create Project
            </Button>
          )}
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in-list">
          {filteredProjects.map((project) => {
            const progress =
              project.taskCount && project.taskCount > 0
                ? Math.round(((project.completedTaskCount || 0) / project.taskCount) * 100)
                : 0;
            const memberCount = Array.isArray(project.members) ? project.members.length : 0;

            return (
              <Card
                key={project._id}
                className="card-hover border-border/50 cursor-pointer group overflow-hidden"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <div className="h-1.5" style={{ backgroundColor: project.color || '#7c3aed' }} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-10 w-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                        style={{ backgroundColor: (project.color || '#7c3aed') + '20' }}
                      >
                        {project.icon || '📁'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                          {project.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className={`text-[10px] capitalize mt-1 ${getStatusBadge(project.status)}`}
                        >
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e: any) => handleEditClick(project, e)}
                          className="gap-2"
                        >
                          <Edit className="h-3.5 w-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e: any) => handleDeleteProject(project._id, e)}
                          className="gap-2 text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="text-xs text-muted-foreground mt-3 line-clamp-2 min-h-[32px]">
                    {project.description || 'No description'}
                  </p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {project.completedTaskCount || 0}/{project.taskCount || 0} tasks
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex -space-x-1.5">
                      {(project.members as User[]).slice(0, 3).map((member, i) => (
                        <div
                          key={i}
                          className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[9px] font-semibold ring-2 ring-card"
                          title={typeof member === 'object' ? member.name : ''}
                        >
                          {typeof member === 'object' ? member.name?.[0] : '?'}
                        </div>
                      ))}
                      {memberCount > 3 && (
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[9px] font-semibold ring-2 ring-card">
                          +{memberCount - 3}
                        </div>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      {format(new Date(project.createdAt), 'MMM d')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2 animate-in-list">
          {filteredProjects.map((project) => {
            const progress =
              project.taskCount && project.taskCount > 0
                ? Math.round(((project.completedTaskCount || 0) / project.taskCount) * 100)
                : 0;
            return (
              <div
                key={project._id}
                className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:bg-muted/30 cursor-pointer transition-colors group"
                onClick={() => navigate(`/projects/${project._id}`)}
              >
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: (project.color || '#7c3aed') + '20' }}
                >
                  {project.icon || '📁'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                      {project.name}
                    </h3>
                    <Badge
                      variant="outline"
                      className={`text-[10px] capitalize ${getStatusBadge(project.status)}`}
                    >
                      {project.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {project.description}
                  </p>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-medium">{progress}%</p>
                    <Progress value={progress} className="h-1 w-20 mt-1" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {project.taskCount || 0} tasks
                  </span>
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
                        onClick={(e: any) => handleEditClick(project, e)}
                        className="gap-2"
                      >
                        <Edit className="h-3.5 w-3.5" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e: any) => handleDeleteProject(project._id, e)}
                        className="gap-2 text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={loadProjects}
      />
      <EditProjectDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        project={editProject}
        onSuccess={loadProjects}
      />
    </div>
  );
}
