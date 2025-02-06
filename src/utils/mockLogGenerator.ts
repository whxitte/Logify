import { LogEntry } from '../types/log';

const SAMPLE_IPS = [
  '192.168.1.100',
  '10.0.0.50',
  '172.16.0.25',
  '8.8.8.8',
  '1.1.1.1'
];

const SAMPLE_MESSAGES = {
  ERROR: [
    'Connection refused to database',
    'NullPointerException in UserService',
    'Failed to authenticate user',
    'OutOfMemoryError: Java heap space',
    'Deadlock detected in thread pool'
  ],
  WARN: [
    'High CPU usage detected',
    'Database connection pool running low',
    'Slow query execution detected',
    'Multiple failed login attempts',
    'Cache miss rate exceeding threshold'
  ],
  INFO: [
    'Application started successfully',
    'User logged in successfully',
    'Database backup completed',
    'Cache refresh completed',
    'Scheduled maintenance started'
  ]
};

const SAMPLE_STACK_TRACES = [
  [
    'at com.example.UserService.authenticate(UserService.java:125)',
    'at com.example.LoginController.doLogin(LoginController.java:50)',
    'at javax.servlet.http.HttpServlet.service(HttpServlet.java:707)'
  ],
  [
    'at org.hibernate.internal.SessionImpl.fireMerge(SessionImpl.java:915)',
    'at org.hibernate.internal.SessionImpl.merge(SessionImpl.java:897)',
    'at com.example.DataService.saveEntity(DataService.java:234)'
  ]
];

export function generateMockLog(): LogEntry {
  const levels = ['INFO', 'WARN', 'ERROR'] as const;
  const level = levels[Math.floor(Math.random() * levels.length)];
  const ip = SAMPLE_IPS[Math.floor(Math.random() * SAMPLE_IPS.length)];
  const messages = SAMPLE_MESSAGES[level];
  const message = messages[Math.floor(Math.random() * messages.length)];

  const log: LogEntry = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    level,
    message,
    ip,
    source: 'catalina.out',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    geoLocation: {
      country: 'United States',
      city: 'New York',
      coordinates: [-74.006, 40.7128]
    }
  };

  if (level === 'ERROR') {
    log.stackTrace = SAMPLE_STACK_TRACES[Math.floor(Math.random() * SAMPLE_STACK_TRACES.length)];
  }

  return log;
}

export function startMockLogGeneration(store: any) {
  // Generate initial logs
  Array.from({ length: 50 }).forEach(() => {
    store.addLog(generateMockLog());
  });

  // Generate new logs periodically
  setInterval(() => {
    if (store.isMonitoring) {
      store.addLog(generateMockLog());
    }
  }, 2000);
}