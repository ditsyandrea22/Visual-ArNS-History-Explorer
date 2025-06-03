import type { Strategy, PermissionType } from '@arweave-wallet-kit/core';

declare global {
  interface Window {
    arweaveWallet: {
      connect: (permissions: PermissionType[]) => Promise<void>;
      disconnect: () => Promise<void>;
      getActiveAddress: () => Promise<string>;
      getAllAddresses: () => Promise<string[]>;
      sign: (transaction: any) => Promise<any>;
      getPublicKey: () => Promise<string>;
      getBalance: (address: string) => Promise<string>;
      api: {
        getConfig: () => { host: string };
      };
      ar: {
        winstonToAr: (winston: string) => string;
        arToWinston: (ar: string) => string;
      };
    };
  }
}