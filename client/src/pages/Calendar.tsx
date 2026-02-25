import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { toast } from 'sonner';
import taskService from '../services/task.service';
import type { Task } from '../types';

export default function CalendarPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await taskService.getTasks({});
      setTasks(data);
    } catch (err: any) {
      console.error('Failed to load tasks:', err);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const monthName = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const getTasksForDate = (day: number) => {
    const dateStr = new Date(year, month, day).toDateString();
    return tasks.filter((t) => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate).toDateString() === dateStr;
    });
  };

  const today = new Date();
  const isToday = (day: number) =>
    today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;

  const getPriorityDot = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-400';
    }
  };

  // Build calendar grid cells
  const calendarCells = [];
  // Empty cells for days before month start
  for (let i = 0; i < startDay; i++) {
    calendarCells.push(
      <div key={`empty-${i}`} className="min-h-[100px] border border-border/50 bg-muted/20" />
    );
  }
  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dayTasks = getTasksForDate(day);
    const todayClass = isToday(day);

    calendarCells.push(
      <div
        key={day}
        className={`min-h-[100px] border border-border/50 p-1.5 transition-colors hover:bg-accent/30 ${
          todayClass ? 'bg-primary/5 border-primary/30' : ''
        }`}
      >
        <div className="flex items-center justify-between mb-1">
          <span
            className={`text-xs font-medium inline-flex items-center justify-center h-6 w-6 rounded-full ${
              todayClass ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
            }`}
          >
            {day}
          </span>
          {dayTasks.length > 0 && (
            <span className="text-[10px] text-muted-foreground">{dayTasks.length}</span>
          )}
        </div>
        <div className="space-y-0.5">
          {dayTasks.slice(0, 3).map((task) => (
            <div
              key={task._id}
              className="flex items-center gap-1 px-1 py-0.5 rounded text-[10px] truncate bg-card border border-border/50 hover:bg-accent cursor-pointer"
              title={task.title}
            >
              <div
                className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${getPriorityDot(task.priority)}`}
              />
              <span className="truncate">{task.title}</span>
            </div>
          ))}
          {dayTasks.length > 3 && (
            <div className="text-[10px] text-muted-foreground text-center">
              +{dayTasks.length - 3} more
            </div>
          )}
        </div>
      </div>
    );
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
          <p className="text-sm text-muted-foreground mt-0.5">View your tasks by date</p>
        </div>
        <Skeleton className="h-[600px] rounded-xl" />
      </div>
    );
  }

  // Summary counts
  const tasksThisMonth = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    return d.getFullYear() === year && d.getMonth() === month;
  });
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < today && t.status !== 'completed'
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Calendar</h1>
        <p className="text-sm text-muted-foreground mt-0.5">View your tasks by date</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">This Month</p>
            <p className="text-xl font-bold">{tasksThisMonth.length}</p>
          </CardContent>
        </Card>
        <Card className={overdueTasks.length > 0 ? 'border-red-500/30' : ''}>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Overdue</p>
            <p className={`text-xl font-bold ${overdueTasks.length > 0 ? 'text-red-500' : ''}`}>
              {overdueTasks.length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <p className="text-xs text-muted-foreground">Total Tasks</p>
            <p className="text-xl font-bold">{tasks.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Navigation */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-bold ml-2">{monthName}</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToday}>
                Today
              </Button>
              {/* Priority legend */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground ml-4">
                <span className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  High
                </span>
                <span className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  Medium
                </span>
                <span className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  Low
                </span>
              </div>
            </div>
          </div>

          {/* Week day headers */}
          <div className="grid grid-cols-7 mb-1">
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-xs font-semibold text-muted-foreground py-2 border-b border-border"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">{calendarCells}</div>

          {/* Upcoming badge */}
          {overdueTasks.length > 0 && (
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="destructive">{overdueTasks.length} overdue</Badge>
              <span className="text-xs text-muted-foreground">
                {overdueTasks.length === 1
                  ? `"${overdueTasks[0].title}" is past due`
                  : `${overdueTasks.length} tasks are past their due dates`}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
