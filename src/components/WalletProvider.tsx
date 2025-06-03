import React from 'react';
import { ConnectButton } from '@arweave-wallet-kit/react';

export const WalletProvider: React.FC = () => (
  <div className="wallet-provider">
    <ConnectButton />
  </div>
);