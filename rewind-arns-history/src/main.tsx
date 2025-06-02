import React from 'react';
import ReactDOM from 'react-dom/client';
import { ArweaveWalletKit } from '@arweave-wallet-kit/react';
import App from './App';
import './index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <ArweaveWalletKit
      config={{
        permissions: ['ACCESS_ADDRESS', 'SIGN_TRANSACTION', 'DISPATCH'],
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