import React from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { LogEntry } from '../types/log';
import { AlertCircle, AlertTriangle, Info, Bug } from 'lucide-react';

interface LogStreamProps {
  logs: LogEntry[];
  selectedLog: LogEntry | null;
  onSelectLog: (log: LogEntry) => void;
  isDarkMode: boolean;
  logColors: Record<string, string>;
}

const formatSafeDate = (dateStr: string, formatStr: string = 'HH:mm:ss.SSS'): string => {
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

const getLevelIcon = (level: string) => {
  switch (level) {
    case 'ERROR':
      return <AlertCircle className="w-4 h-4" />;
    case 'WARN':
      return <AlertTriangle className="w-4 h-4" />;
    case 'DEBUG':
      return <Bug className="w-4 h-4" />;
    default:
      return <Info className="w-4 h-4" />;
  }
};

export const LogStream: React.FC<LogStreamProps> = ({
  logs,
  selectedLog,
  onSelectLog,
  isDarkMode,
  logColors
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} p-2 sticky top-0 bg-inherit z-10`}>
        <table className="w-full">
          <thead>
            <tr className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <th className="w-16 text-left">#</th>
              <th className="w-40 text-left">Timestamp</th>
              <th className="w-24 text-left">Level</th>
              <th className="w-32 text-left">Source</th>
              <th className="text-left">Message</th>
            </tr>
          </thead>
        </table>
      </div>
      <div className="overflow-y-auto flex-1">
        <table className="w-full">
          <tbody className="font-mono text-sm">
            {logs.map((log, index) => (
              <tr
                key={index}
                onClick={() => onSelectLog(log)}
                className={`
                  cursor-pointer border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}
                  ${selectedLog === log
                    ? isDarkMode
                      ? 'bg-gray-700'
                      : 'bg-blue-50'
                    : ''
                  }
                  hover:${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'}
                `}
              >
                <td className="w-16 p-2 text-gray-500 whitespace-nowrap">{index + 1}</td>
                <td className="w-40 p-2 text-gray-400 whitespace-nowrap">
                  {formatSafeDate(log.timestamp)}
                </td>
                <td className="w-24 p-2 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <div style={{ color: logColors[log.level] }}>
                      {getLevelIcon(log.level)}
                    </div>
                    <span style={{ color: logColors[log.level] }}>
                      {log.level}
                    </span>
                  </div>
                </td>
                <td className="w-32 p-2 text-gray-400 truncate">
                  {log.source || '-'}
                </td>
                <td className={`p-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} truncate max-w-0`}>
                  {log.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};