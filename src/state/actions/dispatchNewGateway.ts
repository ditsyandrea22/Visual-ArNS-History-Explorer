import { AoARIORead, AoARIOWrite } from '@ar.io/sdk/web';
import Arweave from 'arweave';
import { Dispatch } from 'react';

// Removed imports for missing files:
// import { ArweaveCompositeDataProvider } from '../../services/arweave/ArweaveCompositeDataProvider';
// import { SimpleArweaveDataProvider } from '../../services/arweave/SimpleArweaveDataProvider';
import eventEmitter from '../../utils/events';
import { GlobalAction } from '../reducers';

export async function dispatchNewGateway(
  gateway: string,
  contract: AoARIORead | AoARIOWrite,
  dispatch: Dispatch<GlobalAction>,
): Promise<void> {
  try {
    // If you need to use the Arweave instance elsewhere, you can keep this:
    // const arweave = new Arweave({
    //   host: gateway,
    //   protocol: 'https',
    // });

    // The following providers depend on missing files and are commented out:
    // const arweaveDataProvider = new SimpleArweaveDataProvider(arweave);
    // const provider = new ArweaveCompositeDataProvider({
    //   arweave: arweaveDataProvider,
    //   contract: contract,
    // });
    // const blockHeight = await provider.getCurrentBlockHeight();
    // dispatch({
    //   type: 'setBlockHeight',
    //   payload: blockHeight,
    // });
    // dispatch({
    //   type: 'setGateway',
    //   payload: {
    //     gateway,
    //     provider,
    //   },
    // });

    // Instead, just dispatch the gateway for now:
    dispatch({
      type: 'setGateway',
      payload: {
        gateway,
      },
    });
  } catch (error) {
    eventEmitter.emit('error', error);
  }
}