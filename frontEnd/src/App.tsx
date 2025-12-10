import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProductsPage } from './pages/ProductsPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { TestingGuide } from './components/TestingGuide';

const Navigation: React.FC = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <nav
      style={{
        backgroundColor: '#1976d2',
        color: 'white',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
      }}
    >
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold', fontSize: '18px' }}>
          S2S gRPC Testing
        </Link>
        {isAuthenticated && (
          <>
            <Link to="/profile" style={{ color: 'white', textDecoration: 'none' }}>
              Profile
            </Link>
            <Link to="/products" style={{ color: 'white', textDecoration: 'none' }}>
              Products
            </Link>
            <Link to="/purchases" style={{ color: 'white', textDecoration: 'none' }}>
              My Purchases
            </Link>
          </>
        )}
      </div>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        {isAuthenticated && (
          <>
            <span style={{ fontSize: '14px' }}>{user?.email}</span>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px 16px',
                backgroundColor: '#d32f2f',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '20px' }}>
      <h1>Welcome to S2S gRPC Testing Frontend</h1>
      <p style={{ fontSize: '18px', marginBottom: '30px' }}>
        This frontend application allows you to test all backend endpoints and verify s2s gRPC communication
        between the User Service and Product Service.
      </p>

      <TestingGuide />

      <div style={{ marginTop: '30px' }}>
        <h2>Quick Navigation</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <Link
            to="/profile"
            style={{
              padding: '15px 30px',
              backgroundColor: '#1976d2',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px',
              display: 'inline-block',
            }}
          >
            Go to Profile Management
          </Link>
          <Link
            to="/products"
            style={{
              padding: '15px 30px',
              backgroundColor: '#4CAF50',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px',
              display: 'inline-block',
            }}
          >
            Go to Products Testing (gRPC)
          </Link>
          <Link
            to="/purchases"
            style={{
              padding: '15px 30px',
              backgroundColor: '#9c27b0',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '5px',
              display: 'inline-block',
            }}
          >
            View My Purchases (gRPC)
          </Link>
        </div>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
        <h3>Architecture Overview</h3>
        <ul>
          <li>
            <strong>Auth Service (Port 3000):</strong> Handles user authentication and JWT token generation
          </li>
          <li>
            <strong>User Service (Port 3001):</strong> Manages user profiles and communicates with Product Service via gRPC
          </li>
          <li>
            <strong>Product Service (Port 3002):</strong> Manages products and exposes gRPC server for User Service
          </li>
        </ul>
        <p style={{ marginTop: '15px', color: '#666' }}>
          The Products page allows you to test both direct Product Service calls and User Service calls that use gRPC
          to communicate with the Product Service. Compare the responses to verify gRPC communication is working correctly.
        </p>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
        <Navigation />
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <ProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/purchases"
            element={
              <ProtectedRoute>
                <PurchasesPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;

