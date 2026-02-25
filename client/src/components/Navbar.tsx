import { useState, useEffect, useRef } from 'react';
import { Bell, Search, FolderKanban, CheckSquare, Command } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ThemeToggle } from './ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface SearchResult {
  projects: Array<{ _id: string; name: string; status: string }>;
  tasks: Array<{ _id: string; title: string; status: string; priority: string; project?: string }>;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Keyboard shortcut: Ctrl+K to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowResults(false);
        inputRef.current?.blur();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchQuery.trim()) {
      setSearchResults(null);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const response = await api.get('/search', { params: { q: searchQuery } });
        setSearchResults(response.data.data);
        setShowResults(true);
      } catch {
        setSearchResults(null);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  // Close search results on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResultClick = (type: 'project' | 'task', id: string, projectId?: string) => {
    setShowResults(false);
    setSearchQuery('');
    if (type === 'project') {
      navigate(`/projects/${id}`);
    } else {
      if (projectId) navigate(`/projects/${projectId}`);
      else navigate('/tasks');
    }
  };

  const totalResults = (searchResults?.projects.length || 0) + (searchResults?.tasks.length || 0);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="flex items-center justify-between px-4 h-16">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">P</span>
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:block">ProjectHub</span>
          </button>

          {/* Search Bar */}
          <div className="hidden md:flex items-center relative w-80 lg:w-96" ref={searchRef}>
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="search"
              placeholder="Search..."
              className="pl-9 pr-16 w-full h-9 bg-muted/50 border-transparent focus:bg-background focus:border-border transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchResults && setShowResults(true)}
            />
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none hidden lg:inline-flex h-5 items-center gap-0.5 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
              <Command className="h-2.5 w-2.5" />K
            </kbd>

            {/* Search Results Dropdown */}
            {showResults && searchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-xl max-h-80 overflow-y-auto z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                {totalResults === 0 ? (
                  <div className="p-6 text-center">
                    <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No results for "{searchQuery}"</p>
                  </div>
                ) : (
                  <>
                    {searchResults.projects.length > 0 && (
                      <div>
                        <div className="px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Projects
                        </div>
                        {searchResults.projects.map((project) => (
                          <button
                            key={project._id}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent/70 text-left transition-colors"
                            onClick={() => handleResultClick('project', project._id)}
                          >
                            <div className="h-7 w-7 rounded-md bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                              <FolderKanban className="h-3.5 w-3.5 text-violet-500" />
                            </div>
                            <span className="text-sm truncate flex-1">{project.name}</span>
                            <Badge variant="secondary" className="text-[10px]">
                              {project.status}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchResults.tasks.length > 0 && (
                      <div>
                        <div className="px-3 py-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-t border-border">
                          Tasks
                        </div>
                        {searchResults.tasks.map((task) => (
                          <button
                            key={task._id}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent/70 text-left transition-colors"
                            onClick={() => handleResultClick('task', task._id, task.project)}
                          >
                            <div className="h-7 w-7 rounded-md bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                              <CheckSquare className="h-3.5 w-3.5 text-blue-500" />
                            </div>
                            <span className="text-sm truncate flex-1">{task.title}</span>
                            <Badge variant="secondary" className="text-[10px]">
                              {task.priority}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-background"></span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 ml-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.name || 'User'} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {user ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>Settings</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/team')}>Team</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
