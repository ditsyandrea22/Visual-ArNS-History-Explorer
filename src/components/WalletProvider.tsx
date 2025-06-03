import React from 'react';

// Stub for ConnectButton if '@arweave-wallet-kit/react' is missing.
// Remove this and use the real import if you add the package back.
const ConnectButton = () => (
  <button style={{ padding: '10px 20px', borderRadius: '4px', background: '#f5f5f5', border: '1px solid #ccc' }}>
    Connect Wallet (Stub)
  </button>
);

export const WalletProvider: React.FC = () => (
  <div className="wallet-provider">
    <ConnectButton />
  </div>
);