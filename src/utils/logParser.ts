import { LogEntry } from '../types/log';

// Common log format patterns
const LOG_PATTERNS = {
  // Apache/Nginx Access Log
  // Example: 192.168.1.1 - - [14/Mar/2024:12:34:56 +0000] "GET /api/users HTTP/1.1" 200 1234 "https://example.com" "Mozilla/5.0..."
  APACHE_NGINX_ACCESS: /^(\S+)\s+-\s+(\S+)\s+\[([^\]]+)\]\s+"([^"]*?)"\s+(\d{3})\s+(\d+)\s+"([^"]+)"\s+"([^"]+)"$/,

  // Apache/Nginx Error Log
  // Example: [Wed Mar 14 12:34:56.789123 2024] [error] [pid 1234] [client 192.168.1.1] PHP Fatal error: Uncaught Error...
  APACHE_NGINX_ERROR: /^\[([^\]]+)\]\s+\[([^\]]+)\]\s+(?:\[pid\s+(\d+)\]\s+)?(?:\[client\s+([^\]]+)\]\s+)?(.+)$/,

  // Syslog
  // Example: Mar 14 12:34:56 hostname sshd[1234]: Failed password for invalid user admin from 192.168.1.1 port 22 ssh2
  SYSLOG: /^(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+([^:]+)\[(\d+)\]:\s+(.+)$/,

  // SSH Log
  // Example: Mar 14 12:34:56 hostname sshd[1234]: Accepted password for user from 192.168.1.1 port 22 ssh2
  SSH: /^(\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+sshd\[(\d+)\]:\s+(.+)$/,

  // Docker Log
  // Example: 2024-03-14T12:34:56.789123456Z stdout F This is a log message
  DOCKER: /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)\s+(\w+)\s+([A-Z])\s+(.+)$/
};

// Helper function to safely parse date
function safeParseDateString(dateStr: string): string {
  try {
    // Handle Apache/Nginx style dates [14/Mar/2024:12:34:56 +0000]
    if (dateStr.includes('/')) {
      const parsed = dateStr.replace(/(\d{2})\/(\w{3})\/(\d{4}):(\d{2}:\d{2}:\d{2})/, '$2 $1 $3 $4');
      const date = new Date(parsed);
      if (isValidDate(date)) {
        return date.toISOString();
      }
    }

    // Handle syslog style dates (Mar 14 12:34:56)
    if (/^\w{3}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}/.test(dateStr)) {
      const currentYear = new Date().getFullYear();
      const date = new Date(`${dateStr} ${currentYear}`);
      if (isValidDate(date)) {
        return date.toISOString();
      }
    }

    // Try direct parsing
    const date = new Date(dateStr);
    if (isValidDate(date)) {
      return date.toISOString();
    }

    // Fallback to current timestamp
    return new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}

// Helper function to validate date
function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

// Helper function to parse user agent string
function parseUserAgent(userAgent: string) {
  const browser = userAgent.match(/(Chrome|Firefox|Safari|Edge|MSIE|Trident)\/?\s*(\d+)/i);
  const os = userAgent.match(/(Windows|Mac|Linux|iOS|Android)\s*([^;)]*)/i);
  const device = userAgent.match(/(Mobile|Tablet|iPad|iPhone|Android|Windows Phone)/i);

  return {
    browser: browser ? `${browser[1]} ${browser[2]}` : 'Unknown',
    os: os ? `${os[1]} ${os[2]}`.trim() : 'Unknown',
    device: device ? device[1] : 'Desktop'
  };
}

// Helper function to determine log level from message
function determineLogLevel(message: string, statusCode?: string): 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' {
  const messageLower = message.toLowerCase();
  
  if (statusCode) {
    if (statusCode.startsWith('5')) return 'ERROR';
    if (statusCode.startsWith('4')) return 'WARN';
    return 'INFO';
  }

  if (messageLower.includes('error') || messageLower.includes('fatal') || messageLower.includes('emerg')) {
    return 'ERROR';
  }
  if (messageLower.includes('warn') || messageLower.includes('failed') || messageLower.includes('invalid')) {
    return 'WARN';
  }
  if (messageLower.includes('debug')) {
    return 'DEBUG';
  }
  return 'INFO';
}

export function parseLogLine(line: string): LogEntry | null {
  try {
    // Try Apache/Nginx Access Log
    const accessMatch = line.match(LOG_PATTERNS.APACHE_NGINX_ACCESS);
    if (accessMatch) {
      const [, ipAddress, , timestamp, request, statusCode, bytes, referer, userAgentString] = accessMatch;
      return {
        timestamp: safeParseDateString(timestamp),
        level: determineLogLevel(request, statusCode),
        message: `${request} - Status: ${statusCode}, Size: ${bytes} bytes`,
        source: 'web-access',
        ipAddress,
        userAgent: parseUserAgent(userAgentString)
      };
    }

    // Try Apache/Nginx Error Log
    const errorMatch = line.match(LOG_PATTERNS.APACHE_NGINX_ERROR);
    if (errorMatch) {
      const [, timestamp, level, pid, clientIp, message] = errorMatch;
      return {
        timestamp: safeParseDateString(timestamp),
        level: determineLogLevel(level + ' ' + message),
        message,
        source: 'web-error',
        ipAddress: clientIp,
      };
    }

    // Try Syslog
    const syslogMatch = line.match(LOG_PATTERNS.SYSLOG);
    if (syslogMatch) {
      const [, timestamp, hostname, program, pid, message] = syslogMatch;
      return {
        timestamp: safeParseDateString(timestamp),
        level: determineLogLevel(message),
        message,
        source: `${hostname}/${program}[${pid}]`
      };
    }

    // Try SSH Log
    const sshMatch = line.match(LOG_PATTERNS.SSH);
    if (sshMatch) {
      const [, timestamp, hostname, pid, message] = sshMatch;
      const ipMatch = message.match(/(?:from|for)\s+(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
      return {
        timestamp: safeParseDateString(timestamp),
        level: determineLogLevel(message),
        message,
        source: `${hostname}/sshd`,
        ipAddress: ipMatch ? ipMatch[1] : undefined
      };
    }

    // Try Docker Log
    const dockerMatch = line.match(LOG_PATTERNS.DOCKER);
    if (dockerMatch) {
      const [, timestamp, stream, type, message] = dockerMatch;
      return {
        timestamp: safeParseDateString(timestamp),
        level: type === 'E' ? 'ERROR' : type === 'W' ? 'WARN' : 'INFO',
        message,
        source: `docker/${stream}`
      };
    }

    // Fallback: Try to extract basic information
    const timestampPattern = /\d{4}-\d{2}-\d{2}[T\s]\d{2}:\d{2}:\d{2}(?:[.,]\d{3})?(?:Z)?/;
    const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/;
    
    const timestampMatch = line.match(timestampPattern);
    const ipMatch = line.match(ipPattern);
    
    if (timestampMatch || ipMatch) {
      return {
        timestamp: timestampMatch ? safeParseDateString(timestampMatch[0]) : new Date().toISOString(),
        level: determineLogLevel(line),
        message: line,
        source: 'unknown',
        ipAddress: ipMatch ? ipMatch[0] : undefined
      };
    }

    // If no timestamp found, use current time
    return {
      timestamp: new Date().toISOString(),
      level: determineLogLevel(line),
      message: line,
      source: 'unknown'
    };
  } catch (error) {
    console.error('Error parsing log line:', error);
    // Return a fallback entry instead of null to maintain data flow
    return {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message: line,
      source: 'parser-error'
    };
  }
}