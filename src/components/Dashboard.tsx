import React, { useState, useEffect } from 'react';
import { AlertTriangle, Search, Shield, Activity, Clock, Filter, BarChart2, PieChart, LineChart as LineChartIcon, 
         AreaChart, Settings, Sun, Moon, Palette, Sliders, Database, BellRing, Eye, EyeOff } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart as RechartsAreaChart, 
         Area, PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { format, isValid, parseISO } from 'date-fns';
import { LogEntry, LogFilter } from '../types/log';
import { LogStream } from './LogStream';
import { LogDetails } from './LogDetails';
import { SettingsPanel } from './SettingsPanel';
import { parseLogLine } from '../utils/logParser';

interface DashboardProps {
  logFile: File;
}

type ChartType = 'line' | 'area' | 'pie' | 'bar';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const formatSafeDate = (dateStr: string, formatStr: string = 'HH:00'): string => {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) {
      return 'Invalid Date';
    }
    return format(date, formatStr);
  } catch {
    return 'Invalid Date';
  }
};

export const Dashboard: React.FC<DashboardProps> = ({ logFile }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [filters, setFilters] = useState<LogFilter>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string[]>([]);
  const [chartType, setChartType] = useState<ChartType>('line');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [logColors, setLogColors] = useState({
    ERROR: '#EF4444',
    WARN: '#F59E0B',
    INFO: '#3B82F6',
    DEBUG: '#8B5CF6'
  });

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split(/\r?\n/);
      const parsedLogs: LogEntry[] = [];
      
      for (const line of lines) {
        if (line.trim()) {
          const parsedLog = parseLogLine(line);
          if (parsedLog) {
            parsedLogs.push(parsedLog);
          }
        }
      }
      
      setLogs(parsedLogs);
      setFilteredLogs(parsedLogs);
      if (parsedLogs.length > 0) {
        setSelectedLog(parsedLogs[0]);
      }
    };
    reader.readAsText(logFile);
  }, [logFile]);

  useEffect(() => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.ipAddress?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedLevel.length > 0) {
      filtered = filtered.filter(log => selectedLevel.includes(log.level));
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, selectedLevel]);

  const chartData = React.useMemo(() => {
    const hourlyData: Record<string, { errors: number, warnings: number, info: number }> = {};
    
    logs.forEach(log => {
      const hour = formatSafeDate(log.timestamp);
      if (hour === 'Invalid Date') return;
      
      if (!hourlyData[hour]) {
        hourlyData[hour] = { errors: 0, warnings: 0, info: 0 };
      }
      
      if (log.level === 'ERROR') hourlyData[hour].errors++;
      else if (log.level === 'WARN') hourlyData[hour].warnings++;
      else hourlyData[hour].info++;
    });

    return Object.entries(hourlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([time, data]) => ({
        time,
        ...data
      }));
  }, [logs]);

  const pieData = React.useMemo(() => {
    const counts = logs.reduce((acc, log) => {
      acc[log.level] = (acc[log.level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value
    }));
  }, [logs]);

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
            <Line type="monotone" dataKey="errors" stroke="#EF4444" strokeWidth={2} />
            <Line type="monotone" dataKey="warnings" stroke="#F59E0B" strokeWidth={2} />
            <Line type="monotone" dataKey="info" stroke="#3B82F6" strokeWidth={2} />
          </LineChart>
        );
      case 'area':
        return (
          <RechartsAreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
            <Area type="monotone" dataKey="errors" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.5} />
            <Area type="monotone" dataKey="warnings" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.5} />
            <Area type="monotone" dataKey="info" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.5} />
          </RechartsAreaChart>
        );
      case 'pie':
        return (
          <RechartsPieChart>
            <Pie
              data={pieData}
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
          </RechartsPieChart>
        );
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none' }} />
            <Bar dataKey="errors" fill="#EF4444" />
            <Bar dataKey="warnings" fill="#F59E0B" />
            <Bar dataKey="info" fill="#3B82F6" />
          </BarChart>
        );
      default:
        return null;
    }
  };

  const getLogStats = () => {
    const stats = {
      ERROR: 0,
      WARN: 0,
      INFO: 0,
      DEBUG: 0
    };

    logs.forEach(log => {
      stats[log.level]++;
    });

    return stats;
  };

  const logStats = getLogStats();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 shadow-lg sticky top-0 z-50`}>
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className={`w-6 h-6 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <h1 className="text-xl font-bold">Log Analysis Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg px-3 py-1`}>
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                className={`bg-transparent border-none focus:outline-none text-sm ${
                  isDarkMode ? 'text-white placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
              } transition-colors duration-200`}
            >
              <Settings className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Analyzing: {logFile.name}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Stats Grid */}
        <div className="col-span-1 lg:col-span-12 grid grid-cols-1 md:grid-cols-7 gap-4">
          {/* Main Stats */}
          <div className={`col-span-1 md:col-span-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Error Rate</p>
                <h3 className="text-2xl font-bold">
                  {((logs.filter(l => l.level === 'ERROR').length / logs.length) * 100).toFixed(1)}%
                </h3>
              </div>
              <AlertTriangle className={`${isDarkMode ? 'text-red-400' : 'text-red-600'}`} />
            </div>
          </div>
          <div className={`col-span-1 md:col-span-2 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Log Volume</p>
                <h3 className="text-2xl font-bold">{logs.length}</h3>
              </div>
              <Activity className={`${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
          </div>
          <div className={`col-span-1 md:col-span-3 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Time Span</p>
                <h3 className="text-2xl font-bold">
                  {logs.length > 0 ? format(new Date(logs[logs.length - 1].timestamp), 'HH:mm:ss') : '-'}
                </h3>
              </div>
              <Clock className={`${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            </div>
          </div>
        </div>

        {/* Log Level Stats */}
        <div className="col-span-1 lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(logStats).map(([level, count]) => (
            <div
              key={level}
              className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 transform hover:scale-105 transition-transform duration-200`}
            >
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{level}</span>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: logColors[level] }}
                  />
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-3xl font-bold">{count}</span>
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {((count / logs.length) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-1">
                  <div
                    className="h-1 rounded-full"
                    style={{
                      width: `${(count / logs.length) * 100}%`,
                      backgroundColor: logColors[level]
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="col-span-1 lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Panel - Log Stream */}
          <div className={`col-span-1 lg:col-span-7 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg overflow-hidden h-[calc(100vh-32rem)]`}>
            <LogStream
              logs={filteredLogs}
              selectedLog={selectedLog}
              onSelectLog={setSelectedLog}
              isDarkMode={isDarkMode}
              logColors={logColors}
            />
          </div>

          {/* Right Panel - Log Details & Charts */}
          <div className="col-span-1 lg:col-span-5 space-y-4">
            {/* Chart Section */}
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Log Analysis</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setChartType('line')}
                    className={`p-2 rounded ${
                      chartType === 'line'
                        ? 'bg-blue-500 text-white'
                        : isDarkMode
                        ? 'bg-gray-700'
                        : 'bg-gray-200'
                    }`}
                  >
                    <LineChartIcon size={16} />
                  </button>
                  <button
                    onClick={() => setChartType('area')}
                    className={`p-2 rounded ${
                      chartType === 'area'
                        ? 'bg-blue-500 text-white'
                        : isDarkMode
                        ? 'bg-gray-700'
                        : 'bg-gray-200'
                    }`}
                  >
                    <AreaChart size={16} />
                  </button>
                  <button
                    onClick={() => setChartType('pie')}
                    className={`p-2 rounded ${
                      chartType === 'pie'
                        ? 'bg-blue-500 text-white'
                        : isDarkMode
                        ? 'bg-gray-700'
                        : 'bg-gray-200'
                    }`}
                  >
                    <PieChart size={16} />
                  </button>
                  <button
                    onClick={() => setChartType('bar')}
                    className={`p-2 rounded ${
                      chartType === 'bar'
                        ? 'bg-blue-500 text-white'
                        : isDarkMode
                        ? 'bg-gray-700'
                        : 'bg-gray-200'
                    }`}
                  >
                    <BarChart2 size={16} />
                  </button>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  {renderChart()}
                </ResponsiveContainer>
              </div>
            </div>

            {/* Log Details */}
            {selectedLog && (
              <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg overflow-hidden h-[calc(100vh-52rem)] overflow-y-auto`}>
                <LogDetails log={selectedLog} isDarkMode={isDarkMode} logColors={logColors} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg w-full max-w-2xl p-6 m-4`}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Dashboard Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Theme Settings */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Theme</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setIsDarkMode(true)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                      isDarkMode ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    <span>Dark</span>
                  </button>
                  <button
                    onClick={() => setIsDarkMode(false)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                      !isDarkMode ? 'bg-blue-500 text-white' : 'bg-gray-200'
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    <span>Light</span>
                  </button>
                </div>
              </div>

              {/* Log Level Colors */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Log Level Colors</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(logColors).map(([level, color]) => (
                    <div key={level} className="flex items-center space-x-2">
                      <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{level}</span>
                      <input
                        type="color"
                        value={color}
                        onChange={(e) =>
                          setLogColors((prev) => ({
                            ...prev,
                            [level]: e.target.value,
                          }))
                        }
                        className="w-8 h-8 rounded cursor-pointer"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Analysis Settings */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Analysis Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="autoRefresh" className="rounded" />
                    <label htmlFor="autoRefresh" className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Auto-refresh Analysis
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="alerts" className="rounded" />
                    <label htmlFor="alerts" className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Enable Alerts
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="geoip" className="rounded" />
                    <label htmlFor="geoip" className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      GeoIP Lookup
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="stackTrace" className="rounded" />
                    <label htmlFor="stackTrace" className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>
                      Expand Stack Traces
                    </label>
                  </div>
                </div>
              </div>

              {/* Chart Settings */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Chart Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Time Range
                    </label>
                    <select className={`w-full rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} p-2`}>
                      <option>Last Hour</option>
                      <option>Last 24 Hours</option>
                      <option>Last 7 Days</option>
                      <option>Custom Range</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Aggregation
                    </label>
                    <select className={`w-full rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} p-2`}>
                      <option>Minute</option>
                      <option>Hour</option>
                      <option>Day</option>
                      <option>Week</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};