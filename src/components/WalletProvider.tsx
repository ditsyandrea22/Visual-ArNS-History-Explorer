import React from 'react';
import { useArweaveWalletKit } from '@arweave-wallet-kit/react';

export const WalletProvider: React.FC = () => {
  const walletKit = useArweaveWalletKit();
  
  const handleConnect = async () => {
    try {
      await walletKit.connect({
        permissions: ['ACCESS_ADDRESS', 'SIGN_TRANSACTION', 'DISPATCH']
      });
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  if (walletKit.isLoading) {
    return <div className="wallet-status">Loading wallet...</div>;
  }

  if (walletKit.error) {
    return (
      <div className="wallet-status error">
        Error: {walletKit.error.message}
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="wallet-provider">
      {walletKit.connected ? (
        <div className="wallet-connected">
          <div className="wallet-info">
            <p>Connected with: <strong>{walletKit.wallet?.name}</strong></p>
            <p>Address: <code>{walletKit.address}</code></p>
          </div>
          <button 
            onClick={walletKit.disconnect}
            className="disconnect-button"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button 
          onClick={handleConnect}
          className="connect-button"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};