import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Sparkles, LogOut, User, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from './ui/dropdown-menu';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import type { Project, Task } from '../types';

// We'll create this service below
const quickSearch = async (q: string) => {
  try {
    const response = await import('../services/api').then((m) =>
      m.default.get('/search', { params: { q } })
    );
    return response.data.data as { projects: Project[]; tasks: Task[] };
  } catch {
    return { projects: [], tasks: [] };
  }
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    projects: Project[];
    tasks: Task[];
  } | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleSearch = async (value: string) => {
    setSearchQuery(value);
    if (value.length >= 2) {
      const results = await quickSearch(value);
      setSearchResults(results);
      setSearchOpen(true);
    } else {
      setSearchResults(null);
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold gradient-text hidden sm:inline">ProjectHub</span>
          </Link>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md mx-4 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects and tasks... (⌘K)"
              className="pl-9 h-9 bg-muted/50 border-border/50 text-sm"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery.length >= 2 && setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
            />
          </div>

          {/* Search dropdown */}
          {searchOpen && searchResults && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-popover border border-border rounded-lg shadow-lg p-2 z-50 max-h-80 overflow-y-auto">
              {searchResults.projects.length === 0 && searchResults.tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No results found</p>
              ) : (
                <>
                  {searchResults.projects.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                        Projects
                      </p>
                      {searchResults.projects.map((p: any) => (
                        <button
                          key={p._id}
                          className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-sm transition-colors"
                          onMouseDown={() => navigate(`/projects/${p._id}`)}
                        >
                          <span className="text-base">{p.icon || '📁'}</span>
                          <span className="truncate">{p.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.tasks.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 py-1">
                        Tasks
                      </p>
                      {searchResults.tasks.map((t: any) => (
                        <button
                          key={t._id}
                          className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted text-sm transition-colors"
                          onMouseDown={() => navigate('/tasks')}
                        >
                          <span
                            className={`h-2 w-2 rounded-full flex-shrink-0 ${
                              t.priority === 'urgent'
                                ? 'bg-red-500'
                                : t.priority === 'high'
                                  ? 'bg-orange-500'
                                  : t.priority === 'medium'
                                    ? 'bg-yellow-500'
                                    : 'bg-blue-500'
                            }`}
                          />
                          <span className="truncate">{t.title}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center pulse-glow">
              3
            </span>
          </Button>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
                <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-semibold text-primary">
                  {initials || '?'}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => navigate('/settings')}
                className="cursor-pointer gap-2"
              >
                <User className="h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate('/settings')}
                className="cursor-pointer gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer gap-2 text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
