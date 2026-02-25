import { useState, useEffect } from 'react';
import {
  Search,
  Mail,
  FolderKanban,
  CheckCircle,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import userService from '../services/user.service';
import type { User } from '../types';

interface UserStats {
  projectCount: number;
  taskCount: number;
  completedTaskCount: number;
}

interface TeamMember extends User {
  stats?: UserStats;
}

const avatarColors = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-cyan-500',
  'bg-pink-500',
  'bg-indigo-500',
];

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<Record<string, UserStats>>({});

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setMembers(data);
    } catch (err) {
      console.error('Failed to load team members:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async (userId: string) => {
    if (userStats[userId]) return;
    try {
      const data = await userService.getUserById(userId);
      setUserStats((prev) => ({ ...prev, [userId]: data.stats }));
    } catch (err) {
      console.error('Failed to load user stats:', err);
    }
  };

  const handleUserClick = (userId: string) => {
    if (selectedUser === userId) {
      setSelectedUser(null);
    } else {
      setSelectedUser(userId);
      loadUserStats(userId);
    }
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const getAvatarColor = (name: string) => avatarColors[name.charCodeAt(0) % avatarColors.length];

  const filteredMembers = members.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
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
          <h1 className="text-2xl font-bold text-foreground">Team</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search members..."
          className="pl-9 h-8 text-sm bg-muted/50 border-transparent focus:bg-background focus:border-border"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Members Grid */}
      {filteredMembers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-medium">
              {searchQuery ? 'No matching members' : 'No team members found'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => {
            const isSelected = selectedUser === member.id;
            const stats = userStats[member.id];

            return (
              <Card
                key={member.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md overflow-hidden ${
                  isSelected ? 'ring-2 ring-primary border-primary/30' : 'hover:border-border/80'
                }`}
                onClick={() => handleUserClick(member.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className={`h-10 w-10 ${getAvatarColor(member.name)}`}>
                      <AvatarFallback className="text-white font-semibold text-sm">
                        {getInitials(member.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate">
                        {member.name}
                      </h3>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        <p className="text-[11px] text-muted-foreground truncate">{member.email}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                          Member
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">
                          Joined{' '}
                          {new Date(member.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="text-muted-foreground/50">
                      {isSelected ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  {/* Stats - shown when selected */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-border animate-in fade-in-0 slide-in-from-top-2 duration-200">
                      {stats ? (
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-2 rounded-lg bg-muted/50">
                            <FolderKanban className="h-3.5 w-3.5 text-violet-500 mx-auto mb-1" />
                            <p className="text-lg font-bold leading-none">{stats.projectCount}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Projects</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-muted/50">
                            <Clock className="h-3.5 w-3.5 text-blue-500 mx-auto mb-1" />
                            <p className="text-lg font-bold leading-none">{stats.taskCount}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Tasks</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-muted/50">
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mx-auto mb-1" />
                            <p className="text-lg font-bold leading-none">
                              {stats.completedTaskCount}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">Done</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center py-2">
                          <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
