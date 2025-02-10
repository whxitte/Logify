import React from 'react';
import { format } from 'date-fns';
import { LogEntry } from '../types/log';
import { MapPin, Globe, Monitor, AlertTriangle } from 'lucide-react';

interface LogDetailsProps {
  log: LogEntry;
  isDarkMode: boolean;
  logColors: Record<string, string>;
}

const HexView: React.FC<{ text: string; isDarkMode: boolean }> = ({ text, isDarkMode }) => {
  const bytes = new TextEncoder().encode(text);
  const chunks: number[][] = [];
  
  for (let i = 0; i < bytes.length; i += 16) {
    chunks.push(Array.from(bytes.slice(i, i + 16)));
  }

  return (
    <div className="font-mono text-xs">
      {chunks.map((chunk, i) => (
        <div key={i} className="flex">
          <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>
            {(i * 16).toString(16).padStart(8, '0')}
          </span>
          <span className="flex-1 space-x-1">
            {chunk.map((byte, j) => (
              <span key={j} className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>
                {byte.toString(16).padStart(2, '0')}
              </span>
            ))}
          </span>
          <span className={`w-16 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} pl-4`}>
            {chunk.map(byte => byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.').join('')}
          </span>
        </div>
      ))}
    </div>
  );
};

export const LogDetails: React.FC<LogDetailsProps> = ({ log, isDarkMode, logColors }) => {
  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">Log Entry Details</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div>
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Timestamp</span>
              <p className="font-mono">
                {format(new Date(log.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS')}
              </p>
            </div>
            
            <div>
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Level</span>
              <p
                className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-sm`}
                style={{
                  backgroundColor: `${logColors[log.level]}20`,
                  color: logColors[log.level]
                }}
              >
                <AlertTriangle className="w-4 h-4" />
                <span>{log.level}</span>
              </p>
            </div>

            {log.source && (
              <div>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Source</span>
                <p className="font-mono">{log.source}</p>
              </div>
            )}
          </div>

          {log.ipAddress && (
            <div className="space-y-2">
              <div>
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>IP Address</span>
                <p className="font-mono">{log.ipAddress}</p>
              </div>
              
              {log.geoLocation && (
                <div>
                  <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} flex items-center space-x-1`}>
                    <MapPin className="w-4 h-4" />
                    <span>Location</span>
                  </span>
                  <p>
                    {log.geoLocation.city}, {log.geoLocation.country}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {log.userAgent && (
        <div>
          <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2 flex items-center space-x-1`}>
            <Monitor className="w-4 h-4" />
            <span>User Agent</span>
          </h4>
          <div className={`grid grid-cols-3 gap-4 ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'} p-3 rounded-lg`}>
            <div>
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Browser</span>
              <p>{log.userAgent.browser}</p>
            </div>
            <div>
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>OS</span>
              <p>{log.userAgent.os}</p>
            </div>
            <div>
              <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Device</span>
              <p>{log.userAgent.device || 'Unknown'}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Message</h4>
        <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'} p-3 rounded-lg`}>
          <p className="whitespace-pre-wrap font-mono text-sm">{log.message}</p>
        </div>
      </div>

      {log.stackTrace && (
        <div>
          <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Stack Trace</h4>
          <pre className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'} p-3 rounded-lg overflow-x-auto text-sm font-mono`}>
            {log.stackTrace}
          </pre>
        </div>
      )}

      <div>
        <h4 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Hex View</h4>
        <div className={`${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100'} p-3 rounded-lg overflow-x-auto`}>
          <HexView text={log.message} isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
};