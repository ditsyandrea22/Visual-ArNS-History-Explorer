// Remove this broken import:
// import { WanderWalletConnector } from '@src/services/wallets';

// Add a stub:
class WanderWalletConnector {}

import { useEffect } from 'react';
import { useWalletState } from '../../state/contexts/WalletState';

type ArweaveTransactionID = string;

function useWanderEvents() {
  const [{ wallet }, dispatchWalletState] = useWalletState();

  useEffect(() => {
    const addressListener = (e: CustomEvent) => {
      if (wallet instanceof WanderWalletConnector) {
        dispatchWalletState({
          type: 'setWalletAddress',
          payload: e.detail.address as ArweaveTransactionID,
        });
      }
    };
    window.addEventListener('walletSwitch', addressListener as EventListener);
    return () => {
      window.removeEventListener('walletSwitch', addressListener as EventListener);
    };
  }, [dispatchWalletState, wallet]);
}

export default useWanderEvents;