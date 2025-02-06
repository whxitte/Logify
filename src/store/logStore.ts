import { create } from 'zustand';
import { LogEntry, LogFilter, AlertRule } from '../types/log';

interface LogState {
  logs: LogEntry[];
  filters: LogFilter;
  alertRules: AlertRule[];
  isMonitoring: boolean;
  selectedLogFile: string | null;
  
  // Actions
  addLog: (log: LogEntry) => void;
  setFilters: (filters: LogFilter) => void;
  addAlertRule: (rule: AlertRule) => void;
  removeAlertRule: (id: string) => void;
  setMonitoring: (isMonitoring: boolean) => void;
  setSelectedLogFile: (path: string | null) => void;
  clearLogs: () => void;
}

export const useLogStore = create<LogState>((set) => ({
  logs: [],
  filters: {},
  alertRules: [],
  isMonitoring: false,
  selectedLogFile: null,

  addLog: (log) => set((state) => ({ 
    logs: [...state.logs, log] 
  })),

  setFilters: (filters) => set({ filters }),

  addAlertRule: (rule) => set((state) => ({ 
    alertRules: [...state.alertRules, rule] 
  })),

  removeAlertRule: (id) => set((state) => ({
    alertRules: state.alertRules.filter(rule => rule.id !== id)
  })),

  setMonitoring: (isMonitoring) => set({ isMonitoring }),

  setSelectedLogFile: (path) => set({ selectedLogFile: path }),

  clearLogs: () => set({ logs: [] })
}));