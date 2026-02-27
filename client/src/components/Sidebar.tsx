import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  FolderKanban,
  ListTodo,
  CalendarDays,
  Users,
  BarChart3,
  Settings,
  ChevronLeft,
} from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { cn } from '../lib/utils';
import projectService from '../services/project.service';
import type { Project } from '../types';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/tasks', icon: ListTodo, label: 'Tasks' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendar' },
  { to: '/team', icon: Users, label: 'Team' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectService.getProjects();
      setProjects(data.slice(0, collapsed ? 5 : 8));
    } catch {
      // silent
    }
  };

  const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => {
    const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

    const link = (
      <NavLink
        to={to}
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          collapsed && 'justify-center px-2'
        )}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        {!collapsed && <span>{label}</span>}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            {label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return link;
  };

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex flex-col h-[calc(100vh-56px)] border-r border-border/50 bg-sidebar transition-all duration-200',
          collapsed ? 'w-[60px]' : 'w-[240px]'
        )}
      >
        {/* Nav items */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}

          {!collapsed && projects.length > 0 && (
            <>
              <div className="pt-4 pb-1 px-3">
                <p className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider">
                  Projects
                </p>
              </div>
              {projects.map((project) => (
                <NavLink
                  key={project._id}
                  to={`/projects/${project._id}`}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-sm transition-colors',
                    location.pathname === `/projects/${project._id}`
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: project.color || '#7c3aed' }}
                  />
                  <span className="truncate text-[13px]">{project.name}</span>
                </NavLink>
              ))}
            </>
          )}

          {collapsed && projects.length > 0 && (
            <>
              <div className="pt-3 space-y-0.5">
                {projects.slice(0, 5).map((project) => (
                  <Tooltip key={project._id}>
                    <TooltipTrigger asChild>
                      <NavLink
                        to={`/projects/${project._id}`}
                        className={cn(
                          'flex items-center justify-center px-2 py-2 rounded-lg transition-colors',
                          location.pathname === `/projects/${project._id}`
                            ? 'bg-primary/10'
                            : 'hover:bg-muted'
                        )}
                      >
                        <span
                          className="h-5 w-5 rounded flex items-center justify-center text-[10px]"
                          style={{ backgroundColor: (project.color || '#7c3aed') + '30' }}
                        >
                          {project.icon || '📁'}
                        </span>
                      </NavLink>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={8}>
                      {project.name}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </>
          )}
        </nav>

        {/* Bottom */}
        <div className="p-2 border-t border-border/50 space-y-0.5">
          <NavItem to="/settings" icon={Settings} label="Settings" />
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'w-full justify-start gap-2 text-muted-foreground',
              collapsed && 'justify-center px-2'
            )}
            onClick={onToggle}
          >
            <ChevronLeft
              className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
            />
            {!collapsed && <span className="text-xs">Collapse</span>}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
