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
      getPermissions?: () => Promise<string[]>;
      dispatch?: (...args: any[]) => Promise<any>;
      on?: (event: string, callback: (...args: any[]) => void) => void;
      off?: (event: string, callback: (...args: any[]) => void) => void;
      getBalance?: (address: string) => Promise<string>;
      signDataItem?: (dataItem: any) => Promise<any>; // <-- add this line
    };
  }
}