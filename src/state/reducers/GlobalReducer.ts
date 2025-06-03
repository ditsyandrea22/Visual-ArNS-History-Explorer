import { AoARIORead, AoARIOWrite, AoClient } from '@ar.io/sdk/web';
import { NETWORK_DEFAULTS } from '@src/utils/constants';

// Removed import for ArweaveCompositeDataProvider (file is missing).
// import { ArweaveCompositeDataProvider } from '../../services/arweave/ArweaveCompositeDataProvider';
import { GlobalState } from '../contexts/GlobalState';

export type GlobalAction =
  | {
      type: 'setGateway';
      payload: {
        gateway: string;
        // Make provider optional, since the file and type are missing.
        provider?: any;
      };
    }
  | {
      type: 'setAONetwork';
      payload: typeof NETWORK_DEFAULTS.AO;
    }
  | {
      type: 'setTurboNetwork';
      payload: typeof NETWORK_DEFAULTS.TURBO;
    }
  | {
      type: 'setARIOAoClient';
      payload: AoClient;
    }
  | {
      type: 'setANTAoClient';
      payload: AoClient;
    }
  | {
      type: 'setIoProcessId';
      payload: string;
    }
  | {
      type: 'setBlockHeight';
      payload: number;
    }
  | {
      type: 'setArIOContract';
      payload: AoARIORead | AoARIOWrite;
    }
  | {
      type: 'setIoTicker';
      payload: string;
    };

export const reducer = (
  state: GlobalState,
  action: GlobalAction,
): GlobalState => {
  switch (action.type) {
    case 'setGateway':
      return {
        ...state,
        gateway: action.payload.gateway,
        // Only set arweaveDataProvider if it exists in the payload
        ...(action.payload.provider !== undefined && {
          arweaveDataProvider: action.payload.provider,
        }),
      };
    case 'setAONetwork':
      return {
        ...state,
        aoNetwork: {
          ...state.aoNetwork,
          ...action.payload,
        },
      };
    case 'setTurboNetwork':
      return {
        ...state,
        turboNetwork: {
          ...state.turboNetwork,
          ...action.payload,
        },
      };
    case 'setARIOAoClient':
      return {
        ...state,
        aoClient: action.payload,
      };
    case 'setANTAoClient':
      return {
        ...state,
        antAoClient: action.payload,
      };
    case 'setBlockHeight':
      return {
        ...state,
        blockHeight: action.payload,
        lastBlockUpdateTimestamp: Date.now(),
      };
    case 'setIoTicker':
      return {
        ...state,
        arioTicker: action.payload,
      };
    case 'setArIOContract':
      return {
        ...state,
        arioContract: action.payload,
      };
    case 'setIoProcessId':
      return {
        ...state,
        arioProcessId: action.payload,
      };
    default:
      return state;
  }
};