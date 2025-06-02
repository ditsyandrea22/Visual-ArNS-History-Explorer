export {};

declare global {
  interface Window {
    arweaveWallet?: {
      connect: (permissions: string[]) => Promise<void>;
      disconnect: () => Promise<void>;
      getActiveAddress: () => Promise<string>;
      getAllAddresses: () => Promise<string[]>;
      sign: (transaction: any) => Promise<any>;
      getPublicKey: () => Promise<string>;
      getBalance?: (address: string) => Promise<string>;
    };
  }
}