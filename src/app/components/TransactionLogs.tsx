'use client';

import { useWallet } from '../context/WalletContext';

export default function TransactionLogs() {
  const { logs, status, clearLogs } = useWallet();

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Transaction Logs
        </h2>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            status === 'Connected' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
            status === 'Connecting...' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
            status === 'Connection Failed' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            {status}
          </span>
          {logs.length > 0 && (
            <button
              onClick={clearLogs}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear Logs
            </button>
          )}
        </div>
      </div>
      
      <div className="h-48 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-md p-3 font-mono text-sm">
        {logs.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-4">
            No logs available
          </div>
        ) : (
          <div className="space-y-1">
            {logs.map((log, index) => (
              <div
                key={index}
                className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-all"
              >
                {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 