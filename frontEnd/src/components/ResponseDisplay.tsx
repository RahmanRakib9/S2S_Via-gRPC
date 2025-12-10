import React from 'react';

interface ResponseDisplayProps {
  title: string;
  data: any;
  error: string | null;
  isLoading: boolean;
  responseTime?: number;
  isGrpc?: boolean;
}

export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({
  title,
  data,
  error,
  isLoading,
  responseTime,
  isGrpc = false,
}) => {
  return (
    <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ margin: 0 }}>{title}</h3>
        {isGrpc && (
          <span
            style={{
              backgroundColor: '#4CAF50',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
            }}
          >
            gRPC
          </span>
        )}
        {responseTime !== undefined && (
          <span style={{ fontSize: '12px', color: '#666' }}>
            {responseTime}ms
          </span>
        )}
      </div>

      {isLoading && <div style={{ color: '#666' }}>Loading...</div>}

      {error && (
        <div style={{ color: '#d32f2f', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {!isLoading && !error && data && (
        <pre
          style={{
            backgroundColor: '#f5f5f5',
            padding: '10px',
            borderRadius: '4px',
            overflow: 'auto',
            maxHeight: '400px',
            fontSize: '12px',
          }}
        >
          {JSON.stringify(data, null, 2)}
        </pre>
      )}

      {!isLoading && !error && !data && (
        <div style={{ color: '#666', fontStyle: 'italic' }}>No data to display</div>
      )}
    </div>
  );
};

