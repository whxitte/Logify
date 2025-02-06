import React, { useEffect, useRef } from 'react';
import { useLogStore } from '../store/logStore';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { format } from 'date-fns';

const LogLevelIcon = ({ level }: { level: string }) => {
  switch (level) {
    case 'ERROR':
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    case 'WARN':
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    case 'INFO':
      return <Info className="w-4 h-4 text-blue-500" />;
    default:
      return null;
  }
};

export const LogViewer = () => {
  const logs = useLogStore((state) => state.logs);
  const filters = useLogStore((state) => state.filters);
  const [selectedLog, setSelectedLog] = React.useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filteredLogs = logs.filter(log => {
    if (filters.level && !filters.level.includes(log.level)) return false;
    if (filters.search && !log.message.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.ip && log.ip !== filters.ip) return false;
    if (filters.timeRange) {
      const logTime = new Date(log.timestamp);
      if (logTime < filters.timeRange.start || logTime > filters.timeRange.end) return false;
    }
    return true;
  });

  const selectedLogData = selectedLog ? logs.find(log => log.id === selectedLog) : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr,400px] gap-4">
      <div className="h-[calc(100vh-12rem)] overflow-y-auto bg-gray-900 rounded-lg font-mono text-sm">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 bg-gray-800">
            <tr className="text-left">
              <th className="p-2 border-b border-gray-700">No.</th>
              <th className="p-2 border-b border-gray-700">Time</th>
              <th className="p-2 border-b border-gray-700">Level</th>
              <th className="p-2 border-b border-gray-700">Source IP</th>
              <th className="p-2 border-b border-gray-700">Message</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map((log, index) => (
              <tr 
                key={log.id}
                onClick={() => setSelectedLog(log.id)}
                className={`
                  cursor-pointer
                  ${selectedLog === log.id ? 'bg-blue-900/30' : 'hover:bg-gray-800/50'}
                  ${log.level === 'ERROR' ? 'text-red-400' : 
                    log.level === 'WARN' ? 'text-yellow-400' : 
                    'text-gray-300'}
                `}
              >
                <td className="p-2 border-b border-gray-800 text-gray-500">{index + 1}</td>
                <td className="p-2 border-b border-gray-800 whitespace-nowrap">
                  {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
                </td>
                <td className="p-2 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <LogLevelIcon level={log.level} />
                    {log.level}
                  </div>
                </td>
                <td className="p-2 border-b border-gray-800">{log.ip}</td>
                <td className="p-2 border-b border-gray-800 truncate max-w-[400px]">
                  {log.message}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div ref={bottomRef} />
      </div>

      <div className="h-[calc(100vh-12rem)] bg-gray-900 rounded-lg overflow-y-auto">
        {selectedLogData ? (
          <div className="p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2">
              Log Details
            </h3>
            
            <div className="space-y-2">
              <div>
                <span className="text-gray-400 text-sm">Timestamp:</span>
                <div className="font-mono text-gray-200">
                  {format(new Date(selectedLogData.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS')}
                </div>
              </div>

              <div>
                <span className="text-gray-400 text-sm">Level:</span>
                <div className="font-mono text-gray-200">{selectedLogData.level}</div>
              </div>

              <div>
                <span className="text-gray-400 text-sm">Source:</span>
                <div className="font-mono text-gray-200">{selectedLogData.source}</div>
              </div>

              <div>
                <span className="text-gray-400 text-sm">IP Address:</span>
                <div className="font-mono text-gray-200">{selectedLogData.ip}</div>
              </div>

              <div>
                <span className="text-gray-400 text-sm">User Agent:</span>
                <div className="font-mono text-gray-200 text-sm break-all">
                  {selectedLogData.userAgent}
                </div>
              </div>

              <div>
                <span className="text-gray-400 text-sm">Location:</span>
                <div className="font-mono text-gray-200">
                  {selectedLogData.geoLocation?.city}, {selectedLogData.geoLocation?.country}
                  <br />
                  Coordinates: {selectedLogData.geoLocation?.coordinates.join(', ')}
                </div>
              </div>

              <div>
                <span className="text-gray-400 text-sm">Message:</span>
                <div className="font-mono text-gray-200 whitespace-pre-wrap break-all bg-gray-800 p-2 rounded mt-1">
                  {selectedLogData.message}
                </div>
              </div>

              {selectedLogData.stackTrace && (
                <div>
                  <span className="text-gray-400 text-sm">Stack Trace:</span>
                  <div className="font-mono text-red-400 text-sm bg-gray-800/50 p-2 rounded mt-1">
                    {selectedLogData.stackTrace.map((line, i) => (
                      <div key={i} className="ml-4">{line}</div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4">
                <span className="text-gray-400 text-sm">Hex View:</span>
                <div className="font-mono text-xs bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
                  {Array.from(new TextEncoder().encode(selectedLogData.message)).reduce((acc, byte, i) => {
                    const hex = byte.toString(16).padStart(2, '0');
                    const ascii = byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.';
                    
                    if (i % 16 === 0) {
                      acc.push([]);
                    }
                    acc[acc.length - 1].push(hex);
                    
                    if (i % 16 === 15 || i === selectedLogData.message.length - 1) {
                      const hexLine = acc[acc.length - 1].join(' ').padEnd(48, ' ');
                      const asciiLine = acc[acc.length - 1].map((_, j) => {
                        const charIndex = i - (i % 16) + j;
                        if (charIndex >= selectedLogData.message.length) return ' ';
                        const byte = new TextEncoder().encode(selectedLogData.message)[charIndex];
                        return byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.';
                      }).join('');
                      
                      acc[acc.length - 1] = `${(i - (i % 16)).toString(16).padStart(8, '0')}  ${hexLine}  |${asciiLine}|`;
                    }
                    return acc;
                  }, [] as string[][]).map((line, i) => (
                    <div key={i} className="text-gray-300">{line}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a log entry to view details
          </div>
        )}
      </div>
    </div>
  );
};