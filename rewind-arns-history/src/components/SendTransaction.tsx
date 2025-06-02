import React, { useState } from 'react';
import { useArweaveWalletKit } from '@arweave-wallet-kit/react';
import Arweave from 'arweave';

const arweave = Arweave.init({});

interface SendTransactionProps {
  onTransactionSuccess?: (txId: string) => void;
}

export const SendTransaction: React.FC<SendTransactionProps> = ({ 
  onTransactionSuccess 
}) => {
  const walletKit = useArweaveWalletKit();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [data, setData] = useState('');
  const [status, setStatus] = useState('');
  const [txId, setTxId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!walletKit.connected || !walletKit.wallet) {
      setStatus('Error: Wallet not connected');
      return;
    }

    try {
      setStatus('Preparing transaction...');
      
      // Create transaction
      const transaction = await arweave.createTransaction({
        target: recipient,
        quantity: arweave.ar.arToWinston(amount),
        data: data ? new TextEncoder().encode(data) : undefined
      });

      // Add tags
      transaction.addTag('App-Name', 'MyArweaveApp');
      transaction.addTag('Content-Type', 'text/plain');

      // Sign transaction
      setStatus('Signing transaction...');
      await walletKit.wallet.sign(transaction);

      // Submit transaction
      setStatus('Sending transaction...');
      const response = await arweave.transactions.post(transaction);

      if (response.status === 200) {
        setStatus('Transaction successful!');
        setTxId(transaction.id);
        if (onTransactionSuccess) {
          onTransactionSuccess(transaction.id);
        }
      } else {
        throw new Error(`Transaction failed with status ${response.status}`);
      }
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
      console.error('Transaction error:', error);
    }
  };

  return (
    <div className="transaction-form">
      <h2>Send Transaction</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Recipient Address:</label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
            placeholder="Enter recipient address"
          />
        </div>
        
        <div className="form-group">
          <label>Amount (AR):</label>
          <input
            type="number"
            step="0.000001"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            placeholder="Enter amount"
          />
        </div>
        
        <div className="form-group">
          <label>Data (optional):</label>
          <textarea
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="Enter transaction data"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={!walletKit.connected}
          className="submit-button"
        >
          {walletKit.connected ? 'Send Transaction' : 'Connect Wallet First'}
        </button>
      </form>
      
      {status && (
        <div className={`status ${status.includes('Error') ? 'error' : 'success'}`}>
          {status}
        </div>
      )}
      
      {txId && (
        <div className="tx-link">
          <a 
            href={`https://viewblock.io/arweave/tx/${txId}`} 
            target="_blank" 
            rel="noopener noreferrer"
          >
            View Transaction
          </a>
        </div>
      )}
    </div>
  );
};