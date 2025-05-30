'use client';

import { WalletProvider } from './context/WalletContext';
import WalletConnect from './components/WalletConnect';
import TransferFunds from './components/TransferFunds';
import TransactionLogs from './components/TransactionLogs';

export default function Home() {
  return (
    <WalletProvider>
      <main className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
              Web3 Wallet Manager
            </h1>
            
            <div className="space-y-6">
              <WalletConnect />
              <TransferFunds />
              <TransactionLogs />
            </div>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>Connect your wallet to manage and transfer funds</p>
            </div>
          </div>
        </div>
      </main>
    </WalletProvider>
  );
}
