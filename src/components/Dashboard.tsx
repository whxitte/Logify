import React, { useState, useEffect } from 'react';
import { useLogStore } from '../store/logStore';
import { Shield, AlertTriangle, AlertCircle, BarChart as BarChartIcon, PieChart as PieChartIcon, LineChart as LineChartIcon, Activity, AudioWaveform as Waveform } from 'lucide-react';
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell,
  AreaChart, Area,
  LineChart, Line,
  XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer,
  Legend
} from 'recharts';
import { format, subHours, subSeconds } from 'date-fns';

const COLORS = {
  ERROR: '#ef4444',
  WARN: '#eab308',
  INFO: '#22c55e'
};

const MAX_MONITORING_POINTS = 100;

export const Dashboard = () => {
  const logs = useLogStore((state) => state.logs);
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'area' | 'line' | 'monitor'>('monitor');
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h'>('1h');
  const [monitoringData, setMonitoringData] = useState<any[]>([]);

  useEffect(() => {
    // Update monitoring data when new logs come in
    const now = new Date();
    const last30Seconds = subSeconds(now, 30);
    const recentLogs = logs.filter(log => new Date(log.timestamp) >= last30Seconds);
    
    const newPoint = {
      time: format(now, 'HH:mm:ss'),
      value: recentLogs.length,
      ERROR: recentLogs.filter(log => log.level === 'ERROR').length * 3, // Amplify errors
      WARN: recentLogs.filter(log => log.level === 'WARN').length * 2,   // Amplify warnings
      INFO: recentLogs.filter(log => log.level === 'INFO').length
    };

    setMonitoringData(prev => {
      const updated = [...prev, newPoint];
      return updated.slice(-MAX_MONITORING_POINTS);
    });
  }, [logs]);

  const errorCount = logs.filter(log => log.level === 'ERROR').length;
  const warnCount = logs.filter(log => log.level === 'WARN').length;
  const infoCount = logs.filter(log => log.level === 'INFO').length;

  const getTimeRangeData = () => {
    const now = new Date();
    const hours = timeRange === '1h' ? 1 : timeRange === '6h' ? 6 : 24;
    const startTime = subHours(now, hours);
    return logs.filter(log => new Date(log.timestamp) >= startTime);
  };

  const logsByTime = getTimeRangeData().reduce((acc: any[], log) => {
    const hour = format(new Date(log.timestamp), 'HH:mm');
    const existing = acc.find(x => x.hour === hour);
    if (existing) {
      existing[log.level]++;
      existing.total++;
    } else {
      acc.push({
        hour,
        ERROR: log.level === 'ERROR' ? 1 : 0,
        WARN: log.level === 'WARN' ? 1 : 0,
        INFO: log.level === 'INFO' ? 1 : 0,
        total: 1
      });
    }
    return acc;
  }, []);

  const pieData = [
    { name: 'ERROR', value: errorCount },
    { name: 'WARN', value: warnCount },
    { name: 'INFO', value: infoCount }
  ];

  const renderChart = () => {
    switch (chartType) {
      case 'monitor':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monitoringData}>
              <XAxis 
                dataKey="time" 
                interval="preserveStartEnd"
                stroke="#4b5563"
              />
              <YAxis stroke="#4b5563" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '0.375rem',
                  color: '#f3f4f6'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="ERROR" 
                stroke={COLORS.ERROR}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="WARN" 
                stroke={COLORS.WARN}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="INFO" 
                stroke={COLORS.INFO}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#374151"
                vertical={false}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={logsByTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="ERROR" stackId="1" stroke={COLORS.ERROR} fill={COLORS.ERROR} />
              <Area type="monotone" dataKey="WARN" stackId="1" stroke={COLORS.WARN} fill={COLORS.WARN} />
              <Area type="monotone" dataKey="INFO" stackId="1" stroke={COLORS.INFO} fill={COLORS.INFO} />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={logsByTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="ERROR" stroke={COLORS.ERROR} />
              <Line type="monotone" dataKey="WARN" stroke={COLORS.WARN} />
              <Line type="monotone" dataKey="INFO" stroke={COLORS.INFO} />
            </LineChart>
          </ResponsiveContainer>
        );

      default: // bar
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={logsByTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="ERROR" fill={COLORS.ERROR} stackId="stack" />
              <Bar dataKey="WARN" fill={COLORS.WARN} stackId="stack" />
              <Bar dataKey="INFO" fill={COLORS.INFO} stackId="stack" />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-100">Errors</h3>
        </div>
        <p className="text-3xl font-bold text-red-500 mt-2">{errorCount}</p>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-100">Warnings</h3>
        </div>
        <p className="text-3xl font-bold text-yellow-500 mt-2">{warnCount}</p>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold text-gray-100">Info Logs</h3>
        </div>
        <p className="text-3xl font-bold text-green-500 mt-2">{infoCount}</p>
      </div>

      <div className="col-span-1 md:col-span-3 bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-100">Log Activity Analysis</h3>
          <div className="flex gap-2">
            <div className="flex items-center bg-gray-900 rounded-lg p-1">
              <button
                onClick={() => setChartType('monitor')}
                className={`p-1.5 rounded ${chartType === 'monitor' ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
                title="Monitor View"
              >
                <Waveform className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`p-1.5 rounded ${chartType === 'bar' ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
                title="Bar Chart"
              >
                <BarChartIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`p-1.5 rounded ${chartType === 'pie' ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
                title="Pie Chart"
              >
                <PieChartIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`p-1.5 rounded ${chartType === 'area' ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
                title="Area Chart"
              >
                <Activity className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('line')}
                className={`p-1.5 rounded ${chartType === 'line' ? 'bg-gray-700' : 'hover:bg-gray-800'}`}
                title="Line Chart"
              >
                <LineChartIcon className="w-4 h-4" />
              </button>
            </div>
            <select
              className="bg-gray-900 border border-gray-700 rounded px-2 text-sm"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
            >
              <option value="1h">Last Hour</option>
              <option value="6h">Last 6 Hours</option>
              <option value="24h">Last 24 Hours</option>
            </select>
          </div>
        </div>
        <div className="h-64">
          {renderChart()}
        </div>
      </div>
    </div>
  );
};