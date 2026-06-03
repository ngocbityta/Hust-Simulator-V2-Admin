import React from 'react';
import { useFetch } from '../hooks/useFetch';
import { Loader2 } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
export const DashboardPage: React.FC = () => {
  const [timeRange, setTimeRange] = React.useState('1d');
  const { data: dashboardData, isLoading: dashboardLoading } = useFetch<any>(`/dashboard/stats?timeRange=${timeRange}`);
  const { data: userStatsData, isLoading: userStatsLoading } = useFetch<any>('/users/stats');

  if (dashboardLoading || userStatsLoading) {
    return (
      <div className="flex justify-center items-center h-full text-zinc-500">
        <Loader2 className="animate-spin mr-3" size={24} />
        Loading dashboard analytics...
      </div>
    );
  }

  const d = dashboardData || {};
  const u = userStatsData || {};

  // Use pre-computed backend data for charts
  const studentBehaviorData = d.studentBehaviorDistribution || [];
  const topNodesData = d.topNodes || [];
  const roomOccupancyData = d.roomOccupancyByBuilding || [];
  const heatmapData = d.heatmapDensityTimeline || [];
  return (
    <div className="p-8">
      <div className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Phân Tích Hệ Thống
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Các chỉ số mô phỏng theo thời gian thực và dữ liệu lịch sử</p>
        </div>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-white text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block p-2.5 outline-none cursor-pointer"
        >
          <option value="1d">24 Giờ Qua</option>
          <option value="1w">1 Tuần Qua</option>
          <option value="1m">1 Tháng Qua</option>
          <option value="1y">1 Năm Qua</option>
          <option value="all">Từ Trước Đến Nay</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard title="Tổng số người dùng" value={u.totalUsers || 0} />
        <StatCard title="Đang Online" value={u.onlineUsers || 0} />
        <StatCard title="Số Tòa nhà" value={d.totalBuildings || 0} />
        <StatCard title="Phòng đang bận" value={`${d.roomsBusy || 0} / ${d.totalRooms || 0}`} />
        <StatCard title="Sự kiện hoạt động" value={d.eventsOngoing || 0} />
        <StatCard title="Lớp học hoạt động" value={d.recurringEventsOngoing || 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Heatmap Density Timeline */}
        <div className="bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Mật độ bản đồ</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={heatmapData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="time" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#e4e4e7' }}
                />
                <Area type="monotone" dataKey="totalCount" name="Mật độ" stroke="#10b981" fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Activity Distribution */}
        <div className="bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Hành vi sinh viên</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={studentBehaviorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {studentBehaviorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                  itemStyle={{ color: '#e4e4e7' }}
                />
                <Legend verticalAlign="middle" align="right" layout="vertical" wrapperStyle={{ color: '#a1a1aa', fontSize: '14px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Top 5 Busiest Nodes */}
        <div className="bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-xl lg:col-span-1">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Top 5 Nút giao Đông nhất</h2>
          <div className="space-y-4">
            {topNodesData.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-zinc-800/50">
                <div>
                  <h3 className="text-zinc-800 dark:text-zinc-200 font-medium text-sm">{item.name}</h3>
                  <span className="text-xs text-zinc-500 mt-1 block">Khung giờ: {item.time}</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-400 font-bold">{item.estimate}</span>
                  <span className="text-xs text-zinc-500 block">người</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Room Occupancy By Building */}
        <div className="bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-xl lg:col-span-2">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Công suất Phòng học theo Giảng đường</h2>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomOccupancyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="buildingName" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{fill: '#27272a', opacity: 0.4}}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                />
                <Legend wrapperStyle={{ color: '#a1a1aa', fontSize: '12px' }} />
                <Bar dataKey="busyCount" name="Phòng có lớp (Busy)" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} maxBarSize={40} />
                <Bar dataKey="emptyCount" name="Phòng trống (Empty)" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Upcoming Timeline */}
        <div className="bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-6">Sắp tới & Đang diễn ra</h2>
          <div className="space-y-4">
            {(d.eventsTimeline || []).slice(0, 5).map((event: any) => (
              <div key={event.id} className="relative pl-6 pb-4 border-l border-zinc-200 dark:border-zinc-800 last:border-0 last:pb-0">
                <div className={`absolute left-[-5px] top-1.5 w-2.5 h-2.5 rounded-full ${event.status === 'ONGOING' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-blue-500'}`} />
                <div className="bg-white/50 dark:bg-zinc-950/50 border border-zinc-200/80 dark:border-zinc-800/50 rounded-xl p-3">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-zinc-800 dark:text-zinc-200 font-medium">{event.name}</h3>
                    <span className="text-xs text-zinc-500">{event.startTime}</span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-3">
                    <span>Đến: {event.endTime}</span>
                    <span className="flex items-center gap-1">{event.estimatedParticipants} dự kiến</span>
                  </p>
                </div>
              </div>
            ))}
             {(!d.eventsTimeline || d.eventsTimeline.length === 0) && (
              <div className="text-center text-zinc-500 py-6">Không có sự kiện nào sắp tới.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value }: { title: string, value: string | number }) => (
  <div className="bg-zinc-50/80 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-6 shadow-lg flex flex-col justify-center items-center text-center transition-all hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 cursor-default">
    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2">{title}</p>
    <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-800 to-zinc-500 dark:from-zinc-100 dark:to-zinc-400">{value}</h3>
  </div>
);

