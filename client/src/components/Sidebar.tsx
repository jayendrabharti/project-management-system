import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  FolderKanban,
  Users,
  Calendar,
  CheckSquare,
  Settings,
  BarChart3,
  PanelLeftClose,
  PanelLeft,
  Plus,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import projectService from '../services/project.service';
import type { Project } from '../types';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: Home, label: 'Dashboard', path: '/' },
  { icon: CheckSquare, label: 'My Tasks', path: '/tasks' },
  { icon: Calendar, label: 'Calendar', path: '/calendar' },
  { icon: Users, label: 'Team', path: '/team' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsExpanded, setProjectsExpanded] = useState(true);

  const loadProjects = useCallback(async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data.slice(0, 8));
    } catch {
      // Silent fail for sidebar
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-16 h-[calc(100vh-4rem)] bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 ease-in-out z-30',
        collapsed ? 'w-[60px]' : 'w-[240px]'
      )}
    >
      {/* Toggle Button */}
      <div
        className={cn('flex items-center px-2 py-2', collapsed ? 'justify-center' : 'justify-end')}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={onToggle}
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md text-[13px] font-medium transition-all duration-150 relative group',
                collapsed ? 'justify-center px-2 py-2' : 'px-3 py-[7px]',
                active
                  ? 'bg-sidebar-accent text-sidebar-primary font-semibold'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 bg-sidebar-primary rounded-r-full" />
              )}
              <Icon className={cn('flex-shrink-0', collapsed ? 'h-5 w-5' : 'h-4 w-4')} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {/* Projects Section */}
        {!collapsed && (
          <div className="mt-5">
            <button
              onClick={() => setProjectsExpanded(!projectsExpanded)}
              className="flex items-center justify-between w-full px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <FolderKanban className="h-3.5 w-3.5" />
                Projects
              </span>
              <span className="flex items-center gap-1">
                <Link
                  to="/projects"
                  onClick={(e) => e.stopPropagation()}
                  className="hover:text-primary"
                  title="New project"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Link>
                {projectsExpanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </span>
            </button>

            {projectsExpanded && (
              <div className="mt-1 space-y-0.5">
                {projects.map((project) => {
                  const active = location.pathname === `/projects/${project._id}`;
                  const colors = [
                    'bg-violet-500',
                    'bg-blue-500',
                    'bg-emerald-500',
                    'bg-amber-500',
                    'bg-rose-500',
                    'bg-cyan-500',
                  ];
                  const colorIdx = project.name.charCodeAt(0) % colors.length;

                  return (
                    <Link
                      key={project._id}
                      to={`/projects/${project._id}`}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-[6px] rounded-md text-[13px] transition-all duration-150',
                        active
                          ? 'bg-sidebar-accent text-sidebar-primary font-medium'
                          : 'text-sidebar-foreground/65 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                      )}
                    >
                      <span className={cn('h-2 w-2 rounded-sm flex-shrink-0', colors[colorIdx])} />
                      <span className="truncate">{project.name}</span>
                    </Link>
                  );
                })}
                {projects.length === 0 && (
                  <p className="px-3 py-2 text-xs text-muted-foreground/50">No projects yet</p>
                )}
                <Link
                  to="/projects"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  View all projects →
                </Link>
              </div>
            )}
          </div>
        )}

        {collapsed && (
          <Link
            to="/projects"
            title="Projects"
            className={cn(
              'flex items-center justify-center px-2 py-2 rounded-md text-[13px] font-medium transition-all duration-150 mt-2',
              location.pathname.startsWith('/projects')
                ? 'bg-sidebar-accent text-sidebar-primary font-semibold'
                : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
            )}
          >
            <FolderKanban className="h-5 w-5" />
          </Link>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="p-2 border-t border-sidebar-border">
        <Link
          to="/settings"
          title={collapsed ? 'Settings' : undefined}
          className={cn(
            'flex items-center gap-3 rounded-md text-[13px] font-medium transition-all duration-150',
            collapsed ? 'justify-center px-2 py-2' : 'px-3 py-[7px]',
            location.pathname === '/settings'
              ? 'bg-sidebar-accent text-sidebar-primary font-semibold'
              : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
          )}
        >
          <Settings className={cn('flex-shrink-0', collapsed ? 'h-5 w-5' : 'h-4 w-4')} />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  );
}
