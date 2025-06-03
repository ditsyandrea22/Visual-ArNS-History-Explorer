const webWalletStrategy = {
  id: 'webwallet',
  name: 'Arweave.app',
  logo: 'https://arweave.net/izgToJ2N1flzObaeM4TSOLX9EX-R7Z21uDOP4QO7g0A',
  description: 'Web-based Arweave wallet',

  connect: async (permissions: string[]) => {
    if (!window.arweaveWallet) throw new Error('Arweave wallet extension not detected!');
    await window.arweaveWallet.connect(permissions);
  },

  disconnect: async () => {
    if (window.arweaveWallet) await window.arweaveWallet.disconnect();
  },

  getActiveAddress: async () => {
    if (!window.arweaveWallet) throw new Error('Wallet not connected!');
    return await window.arweaveWallet.getActiveAddress();
  },

  getAllAddresses: async () => {
    if (!window.arweaveWallet) throw new Error('Wallet not connected!');
    return await window.arweaveWallet.getAllAddresses();
  },

  sign: async (transaction: any) => {
    if (!window.arweaveWallet) throw new Error('Wallet not connected!');
    return await window.arweaveWallet.sign(transaction);
  },

  getPublicKey: async () => {
    if (!window.arweaveWallet) throw new Error('Wallet not connected!');
    const activeAddress = await window.arweaveWallet.getActiveAddress();
    return activeAddress;
  },

  getWalletNames: async () => ({}),

  getSignature: async () => new Uint8Array(),

  getPermissions: async () => {
    if (!window.arweaveWallet) throw new Error('Wallet not connected!');
    if (window.arweaveWallet.getPermissions) return await window.arweaveWallet.getPermissions();
    return [];
  },

  dispatch: async (...args: any[]) => {
    if (!window.arweaveWallet?.dispatch) throw new Error('Dispatch not supported by Arweave.app wallet.');
    return await window.arweaveWallet.dispatch(...args);
  },

  isAvailable: async () => typeof window !== 'undefined' && !!window.arweaveWallet,

  addAddressEvent: (callback: (address: string) => void) => {
    if (window.arweaveWallet && window.arweaveWallet.on) {
      window.arweaveWallet.on('address', callback);
      return () => {
        if (window.arweaveWallet && window.arweaveWallet.off) {
          window.arweaveWallet.off('address', callback);
        }
      };
    }
    return () => {};
  },

  removeAddressEvent: (callback: (address: string) => void) => {
    if (window.arweaveWallet && window.arweaveWallet.off) {
      window.arweaveWallet.off('address', callback);
    }
  },

  // ADD THIS:
  signDataItem: async (dataItem: any) => {
    if (!window.arweaveWallet || !window.arweaveWallet.signDataItem) {
      throw new Error('signDataItem is not supported by this wallet.');
    }
    return await window.arweaveWallet.signDataItem(dataItem);
  }
};