import React, { useState, useEffect } from 'react';
import { purchaseService, Purchase } from '../services/purchase.service';
import { ResponseDisplay } from '../components/ResponseDisplay';

export const PurchasesPage: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseTime, setResponseTime] = useState<number | undefined>();

  const loadPurchases = async () => {
    setIsLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const response = await purchaseService.getMyPurchases();
      setPurchases(response.data);
      setResponseTime(Date.now() - startTime);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load purchases');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPurchases();
  }, []);

  const totalSpent = purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>My Purchases</h1>
        <button
          onClick={loadPurchases}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          Refresh
        </button>
      </div>

      <div
        style={{
          backgroundColor: '#e8f5e9',
          padding: '15px',
          borderRadius: '5px',
          marginBottom: '20px',
          border: '2px solid #4CAF50',
        }}
      >
        <strong style={{ color: '#2e7d32' }}>
          ⚡ gRPC Communication: This endpoint demonstrates s2s gRPC communication.
          <br />
          User Service calls Product Service via gRPC to retrieve your purchases.
        </strong>
      </div>

      {purchases.length > 0 && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
          <h3>Summary</h3>
          <p>
            <strong>Total Purchases:</strong> {purchases.length}
          </p>
          <p>
            <strong>Total Spent:</strong> ${totalSpent.toFixed(2)}
          </p>
        </div>
      )}

      <ResponseDisplay
        title="GET /user/purchases (gRPC: User Service → Product Service)"
        data={purchases.length > 0 ? purchases : null}
        error={error}
        isLoading={isLoading}
        responseTime={responseTime}
        isGrpc={true}
      />

      {purchases.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Purchase History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                style={{
                  padding: '20px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  backgroundColor: 'white',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                  <div>
                    <strong>Product:</strong> {purchase.productName}
                  </div>
                  <div>
                    <strong>Quantity:</strong> {purchase.quantity}
                  </div>
                  <div>
                    <strong>Price per unit:</strong> ${purchase.price.toFixed(2)}
                  </div>
                  <div>
                    <strong>Total Amount:</strong> ${purchase.totalAmount.toFixed(2)}
                  </div>
                  <div>
                    <strong>Purchase Date:</strong>{' '}
                    {new Date(purchase.purchaseDate).toLocaleString()}
                  </div>
                  <div>
                    <strong>Product ID:</strong> {purchase.productId}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && purchases.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No purchases found. Start shopping to see your purchases here!</p>
        </div>
      )}
    </div>
  );
};

