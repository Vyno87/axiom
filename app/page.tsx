'use client';

import useSWR from 'swr';
import { Shield, Clock, AlertTriangle, Users, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Dashboard() {
  // Real-time data fetching with SWR (5 second refresh)
  const { data: attendanceData, error: attendanceError } = useSWR(
    '/api/attendance',
    fetcher,
    { refreshInterval: 5000 }
  );

  const { data: anomalyData } = useSWR('/api/anomalies', fetcher, {
    refreshInterval: 10000,
  });

  const { data: chainData } = useSWR('/api/verify-chain', fetcher, {
    refreshInterval: 15000,
  });

  const attendanceRecords = attendanceData?.data || [];
  const anomalies = anomalyData?.anomalies || [];
  const chartData = anomalyData?.hourlyDistribution?.filter((d: { count: number }) => d.count > 0) || [];

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-primary">AXIOM Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time Attendance Monitoring System
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="Total Check-ins"
            value={attendanceRecords.filter((r: { status: string }) => r.status === 'In').length}
            color="text-blue-500"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            title="Recent Activity"
            value={attendanceRecords.length}
            color="text-green-500"
          />
          <StatCard
            icon={<AlertTriangle className="w-6 h-6" />}
            title="Anomalies"
            value={anomalies.length}
            color="text-yellow-500"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Active Now"
            value={
              attendanceRecords.filter(
                (r: { status: string; timestamp: string }) =>
                  r.status === 'In' &&
                  new Date(r.timestamp) > new Date(Date.now() - 3600000)
              ).length
            }
            color="text-cyan-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Attendance Feed */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-[var(--border)] rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Live Attendance Feed
              </h2>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {attendanceError && (
                  <div className="text-sm text-destructive">
                    Failed to load attendance data
                  </div>
                )}
                {attendanceRecords.length === 0 && !attendanceError && (
                  <div className="text-sm text-muted-foreground text-center py-8">
                    No attendance records yet
                  </div>
                )}
                {attendanceRecords.map((record: {
                  _id: string;
                  name: string;
                  department: string;
                  timestamp: string;
                  status: string;
                }) => (
                  <AttendanceCard key={record._id} record={record} />
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Blockchain Integrity */}
            <div className="bg-card border border-[var(--border)] rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Security Integrity
              </h2>
              <div className="flex flex-col items-center py-4">
                <div
                  className={`relative ${chainData?.valid ? 'text-green-500' : 'text-red-500'
                    }`}
                >
                  <Shield className="w-24 h-24" strokeWidth={1.5} />
                  {chainData?.valid && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
                <p className="mt-4 font-semibold text-lg">
                  {chainData?.valid === undefined
                    ? 'Checking...'
                    : chainData.valid
                      ? 'Chain Valid'
                      : 'Chain Compromised'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {chainData?.totalRecords || 0} records verified
                </p>
              </div>
            </div>

            {/* AI Anomaly Detection */}
            <div className="bg-card border border-[var(--border)] rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-primary" />
                AI Anomaly Detection
              </h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="hour"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      label={{ value: 'Hour', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No anomalies detected
                </div>
              )}
              <div className="mt-4 text-sm text-muted-foreground">
                Unusual check-ins: <span className="font-semibold text-foreground">{anomalies.length}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: number; color: string }) {
  return (
    <div className="bg-card border border-[var(--border)] rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={color}>{icon}</div>
      </div>
    </div>
  );
}

function AttendanceCard({ record }: { record: { name: string; department: string; timestamp: string; status: string } }) {
  const timeAgo = getTimeAgo(new Date(record.timestamp));
  const isCheckIn = record.status === 'In';

  return (
    <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${isCheckIn ? 'bg-green-500' : 'bg-red-500'}`} />
        <div>
          <p className="font-semibold">{record.name}</p>
          <p className="text-sm text-muted-foreground">{record.department}</p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold ${isCheckIn ? 'text-green-500' : 'text-red-500'}`}>
          {record.status}
        </p>
        <p className="text-xs text-muted-foreground">{timeAgo}</p>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
