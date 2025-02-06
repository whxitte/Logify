import React, { useState } from 'react';
import { LogViewer } from './components/LogViewer';
import { Dashboard } from './components/Dashboard';
import { Shield, Settings, Bell, Search, Filter } from 'lucide-react';
import { useLogStore } from './store/logStore';

function App() {
  const [showFilters, setShowFilters] = useState(false);
  const setFilters = useLogStore((state) => state.setFilters);
  const filters = useLogStore((state) => state.filters);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-blue-500" />
              <h1 className="text-xl font-bold">Log Analysis Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 hover:bg-gray-800 rounded-full"
              >
                <Filter className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-800 rounded-full">
                <Bell className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-gray-800 rounded-full">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {showFilters && (
          <div className="mb-6 bg-gray-900 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Log Level</label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                  onChange={(e) => setFilters({
                    ...filters,
                    level: Array.from(e.target.selectedOptions, option => option.value as any)
                  })}
                  multiple
                >
                  <option value="ERROR">Error</option>
                  <option value="WARN">Warning</option>
                  <option value="INFO">Info</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full bg-gray-800 border border-gray-700 rounded-md p-2 pl-8"
                    placeholder="Search logs..."
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                  <Search className="w-4 h-4 absolute left-2 top-3 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Time Range</label>
                <select
                  className="w-full bg-gray-800 border border-gray-700 rounded-md p-2"
                  onChange={(e) => {
                    const now = new Date();
                    const hours = parseInt(e.target.value);
                    setFilters({
                      ...filters,
                      timeRange: {
                        start: new Date(now.getTime() - hours * 60 * 60 * 1000),
                        end: now
                      }
                    });
                  }}
                >
                  <option value="1">Last Hour</option>
                  <option value="24">Last 24 Hours</option>
                  <option value="168">Last Week</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <Dashboard />
        <LogViewer />
      </main>
    </div>
  );
}

export default App;