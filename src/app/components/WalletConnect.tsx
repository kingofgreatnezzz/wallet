'use client';

import { useWallet } from '../context/WalletContext';

export default function WalletConnect() {
  const { 
    address, 
    balance, 
    isConnected, 
    status,
    availableWallets,
    connectWallet, 
    disconnectWallet 
  } = useWallet();

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {!isConnected ? (
        <div className="space-y-4">
          {availableWallets.length > 0 ? (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                Available Wallets:
              </p>
              <div className="grid gap-2">
                {availableWallets.map((wallet) => (
                  <button
                    key={wallet}
                    onClick={() => connectWallet(wallet)}
                    className="w-full px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <span>Connect {wallet}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {status === 'Checking Wallets...' ? (
                  'Scanning for available wallets...'
                ) : (
                  'No Web3 wallets detected'
                )}
              </p>
              <a
                href="https://metamask.io/download/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Install MetaMask →
              </a>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Connected Address:
            </div>
            <div className="font-mono text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Balance:
            </div>
            <div className="font-mono text-sm">
              {parseFloat(balance).toFixed(4)} ETH
            </div>
          </div>

          <button
            onClick={disconnectWallet}
            className="w-full px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
} 