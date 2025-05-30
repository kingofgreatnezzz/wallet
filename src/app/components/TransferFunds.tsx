'use client';

import { useState } from 'react';
import { useWallet } from '../context/WalletContext';

const RECEIVER_ADDRESS = '0xAAE9b63A052BCee32490E5241f8Bb4FA5f9e6fEC';

export default function TransferFunds() {
  const { transferFunds, isConnected, balance } = useWallet();
  const [isTransferring, setIsTransferring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleTransfer = async () => {
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (parseFloat(balance) <= 0) {
      setError('Insufficient balance');
      return;
    }

    try {
      setIsTransferring(true);
      setError(null);
      setSuccess(null);
      
      await transferFunds(RECEIVER_ADDRESS);
      setSuccess('Transfer successful!');
    } catch (err: any) {
      setError(err.message || 'Transfer failed');
    } finally {
      setIsTransferring(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md text-center text-gray-600 dark:text-gray-300">
        Please connect your wallet to transfer funds
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Receiver Address
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={RECEIVER_ADDRESS}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-mono text-sm"
          />
          <button
            onClick={() => navigator.clipboard.writeText(RECEIVER_ADDRESS)}
            className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            title="Copy address"
          >
            Copy
          </button>
        </div>
      </div>

      {error && (
        <div className="p-2 text-sm text-red-600 bg-red-100 dark:bg-red-900/30 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="p-2 text-sm text-green-600 bg-green-100 dark:bg-green-900/30 rounded-md">
          {success}
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={handleTransfer}
          disabled={isTransferring || parseFloat(balance) <= 0}
          className={`w-full px-4 py-2 text-white rounded-md transition-colors duration-200 ${
            isTransferring || parseFloat(balance) <= 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isTransferring ? 'Transferring...' : `Transfer ${parseFloat(balance).toFixed(4)} ETH`}
        </button>

        {parseFloat(balance) <= 0 && (
          <p className="text-sm text-red-600 dark:text-red-400 text-center">
            Insufficient balance to transfer
          </p>
        )}
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
        <p>This will transfer your entire balance (minus gas fees) to the receiver address.</p>
        <p className="mt-1">Please ensure you have enough ETH for gas fees.</p>
      </div>
    </div>
  );
} 