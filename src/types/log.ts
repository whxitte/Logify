export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  source?: string;
  stackTrace?: string;
  ipAddress?: string;
  geoLocation?: {
    country: string;
    city: string;
    coordinates: [number, number];
  };
  userAgent?: {
    browser: string;
    os: string;
    device: string;
  };
}

export interface LogFilter {
  level?: string[];
  timeRange?: {
    start: Date;
    end: Date;
  };
  searchTerm?: string;
  ipAddress?: string;
}