import { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  FolderKanban,
  CheckCircle,
  ListTodo,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import analyticsService from '../services/analytics.service';

const STATUS_COLORS: Record<string, string> = {
  todo: '#3b82f6',
  'in-progress': '#eab308',
  completed: '#22c55e',
};

const PRIORITY_COLORS: Record<string, string> = {
  low: '#3b82f6',
  medium: '#f97316',
  high: '#ef4444',
};

const PIE_COLORS = ['#3b82f6', '#eab308', '#22c55e', '#ef4444', '#8b5cf6'];

interface AnalyticsData {
  tasksByStatus: Array<{ name: string; value: number }>;
  tasksByPriority: Array<{ name: string; value: number }>;
  projectsByStatus: Array<{ name: string; value: number }>;
  completionTrend: Array<{ date: string; completed: number }>;
  totals: { tasks: number; projects: number; overdue: number };
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const analyticsData = await analyticsService.getAnalytics();
      setData(analyticsData);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const formatLabel = (name: string) => {
    switch (name) {
      case 'todo':
        return 'To Do';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return name.charAt(0).toUpperCase() + name.slice(1);
    }
  };

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track your project performance</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const completedTasks = data.tasksByStatus.find((s) => s.name === 'completed')?.value || 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Track your project performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-3xl font-bold">{data.totals.tasks}</p>
              </div>
              <ListTodo className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Projects</p>
                <p className="text-3xl font-bold">{data.totals.projects}</p>
              </div>
              <FolderKanban className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-green-500">{completedTasks}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-3xl font-bold text-red-500">{data.totals.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tasks by Status - Donut */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4" /> Tasks by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.tasksByStatus.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-muted-foreground">
                No task data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={data.tasksByStatus.map((s) => ({
                      ...s,
                      displayName: formatLabel(s.name),
                    }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="displayName"
                    label={(props: any) => `${props.displayName}: ${props.value}`}
                  >
                    {data.tasksByStatus.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || PIE_COLORS[0]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Tasks by Priority - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4" /> Tasks by Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.tasksByPriority.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-muted-foreground">
                No task data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={data.tasksByPriority.map((p) => ({
                    ...p,
                    displayName: formatLabel(p.name),
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="displayName" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {data.tasksByPriority.map((entry) => (
                      <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] || PIE_COLORS[3]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Completion Trend - Line Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4" /> Task Completion Trend (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.completionTrend.length === 0 ? (
              <div className="h-52 flex items-center justify-center text-muted-foreground">
                No completion data for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data.completionTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(d) => {
                      const date = new Date(d);
                      return date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      });
                    }}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
