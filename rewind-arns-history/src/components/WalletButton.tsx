// src/components/WalletButton.tsx
import React from 'react';
import { useWalletKit } from '@arweave-wallet-kit/react';

export function WalletButton() {
  const {
    connected,
    connect,
    disconnect,
    address,
    arweaveConfig
  } = useWalletKit();

  return (
    <div>
      {connected ? (
        <div>
          <p>Connected: {address}</p>
          <button onClick={disconnect}>Disconnect</button>
        </div>
      ) : (
        <button onClick={() => connect()}>Connect Wallet</button>
      )}
    </div>
  );
}