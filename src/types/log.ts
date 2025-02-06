export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  source?: string;
  ip?: string;
  userAgent?: string;
  stackTrace?: string[];
  geoLocation?: {
    country: string;
    city: string;
    coordinates: [number, number];
  };
  metadata?: Record<string, any>;
}

export interface LogFilter {
  level?: LogEntry['level'][];
  search?: string;
  timeRange?: {
    start: Date;
    end: Date;
  };
  ip?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: {
    field: keyof LogEntry;
    operator: 'equals' | 'contains' | 'regex' | 'threshold';
    value: any;
    threshold?: number;
    timeWindow?: number;
  };
  action: {
    type: 'notification' | 'email' | 'webhook';
    target: string;
  };
}