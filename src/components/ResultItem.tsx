import React from 'react';
import { format } from 'date-fns';

type ResultItemProps = {
  item: {
    function?: string;
    txId: string;
    timestamp: string | number | Date;
    input?: any; // <--- This fixes the error!
  };
};

const ResultItem: React.FC<ResultItemProps> = ({ item }) => {
  return (
    <div className="result-item">
      <div className="result-header">
        <h3>{item.function || 'Unknown Function'}</h3>
        <span className="tx-id">{item.txId}</span>
      </div>
      
      <div className="result-body">
        <div className="result-meta">
          <span className="timestamp">
            {format(new Date(item.timestamp), 'PPpp')}
          </span>
        </div>
        
        {item.input && (
          <div className="input-data">
            <h4>Input Data:</h4>
            <pre>{JSON.stringify(item.input, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultItem;