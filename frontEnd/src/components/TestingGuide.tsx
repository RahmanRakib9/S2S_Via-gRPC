import React, { useState } from 'react';

export const TestingGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ marginBottom: '20px', border: '1px solid #ddd', borderRadius: '5px', overflow: 'hidden' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '15px',
          backgroundColor: '#f5f5f5',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ margin: 0 }}>Testing Guide</h2>
        <span style={{ fontSize: '20px' }}>{isOpen ? '−' : '+'}</span>
      </div>

      {isOpen && (
        <div style={{ padding: '20px', backgroundColor: 'white' }}>
          <h3>Phase 1: Authentication</h3>
          <ol>
            <li>Register a new user with email, username, and password</li>
            <li>Login with your credentials</li>
            <li>Verify token is stored (check localStorage)</li>
            <li>Test protected endpoint (GET /auth/me)</li>
          </ol>

          <h3>Phase 2: User Profile</h3>
          <ol>
            <li>Get or create profile (auto-creates if doesn't exist)</li>
            <li>Create profile with data (firstName, lastName, etc.)</li>
            <li>Get profile to view current data</li>
            <li>Update profile with new information</li>
            <li>Delete profile (optional)</li>
          </ol>

          <h3 style={{ color: '#4CAF50' }}>Phase 3: gRPC Communication Testing (Critical)</h3>
          <p style={{ backgroundColor: '#e8f5e9', padding: '10px', borderRadius: '4px' }}>
            <strong>These endpoints demonstrate s2s gRPC communication:</strong>
          </p>
          <ol>
            <li>
              <strong>GET /user/products</strong> - User Service calls Product Service via gRPC
            </li>
            <li>
              <strong>GET /user/products/:id</strong> - User Service calls Product Service via gRPC
            </li>
            <li>
              <strong>GET /user/products/category/:category</strong> - User Service calls Product Service via gRPC
            </li>
          </ol>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Compare responses with direct Product Service calls to verify data consistency.
            Look for the <span style={{ backgroundColor: '#4CAF50', color: 'white', padding: '2px 6px', borderRadius: '3px' }}>gRPC</span> badge on responses.
          </p>

          <h3>Phase 4: Direct Product Service</h3>
          <ol>
            <li>GET /product - Direct call to Product Service</li>
            <li>GET /product/:id - Direct call to Product Service</li>
            <li>GET /product/category/:category - Direct call to Product Service</li>
          </ol>

          <h3>Expected Behavior</h3>
          <ul>
            <li>All endpoints require authentication (JWT token)</li>
            <li>gRPC endpoints should return the same data as direct endpoints</li>
            <li>Response times should be fast (gRPC is efficient)</li>
            <li>Check browser console and backend logs for gRPC communication</li>
          </ul>
        </div>
      )}
    </div>
  );
};

