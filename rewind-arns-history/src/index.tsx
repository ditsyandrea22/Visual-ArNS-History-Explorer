// src/main.tsx or src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ArweaveWalletKit } from '@arweave-wallet-kit/react';
import App from './App';

// Define the web wallet strategy
const webWalletStrategy = {
  id: 'webwallet',
  name: 'Arweave.app',
  logo: 'https://arweave.net/izgToJ2N1flzObaeM4TSOLX9EX-R7Z21uDOP4QO7g0A',
  description: 'Web-based Arweave wallet',
  
  // Connection methods
  connect: async (permissions: string[]) => {
    if (!window.arweaveWallet) {
      throw new Error('Arweave wallet extension not detected!');
    }
    await window.arweaveWallet.connect(permissions);
  },
  
  disconnect: async () => {
    if (window.arweaveWallet) {
      await window.arweaveWallet.disconnect();
    }
  },
  
  // Address methods
  getActiveAddress: async () => {
    if (!window.arweaveWallet) {
      throw new Error('Wallet not connected!');
    }
    return await window.arweaveWallet.getActiveAddress();
  },
  
  getAllAddresses: async () => {
    if (!window.arweaveWallet) {
      throw new Error('Wallet not connected!');
    }
    return await window.arweaveWallet.getAllAddresses();
  },
  
  // Transaction methods
  sign: async (transaction: any) => {
    if (!window.arweaveWallet) {
      throw new Error('Wallet not connected!');
    }
    return await window.arweaveWallet.sign(transaction);
  },
  
  getPublicKey: async () => {
    if (!window.arweaveWallet) {
      throw new Error('Wallet not connected!');
    }
    // This might vary based on the wallet implementation
    const activeAddress = await window.arweaveWallet.getActiveAddress();
    return activeAddress; // This should be replaced with actual public key retrieval
  },
  
  // Other required methods
  getWalletNames: async () => {
    return {};
  },
  
  getSignature: async () => {
    return new Uint8Array();
  }
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ArweaveWalletKit
      config={{
        permissions: ['ACCESS_ADDRESS', 'SIGN_TRANSACTION', 'DISPATCH'],
        strategies: [webWalletStrategy],
        ensurePermissions: true,
        appInfo: {
          name: 'My Arweave App',
          logo: 'URL_TO_YOUR_APP_LOGO'
        }
      }}
    >
      <App />
    </ArweaveWalletKit>
  </React.StrictMode>
);