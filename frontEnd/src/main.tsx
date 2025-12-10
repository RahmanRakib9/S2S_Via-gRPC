import React from 'react';
import ReactDOM from 'react-dom/client';
import { initializeSentry } from './utils/sentry';
import ErrorBoundary from './components/ErrorBoundary';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

// Initialize Sentry BEFORE rendering the app
initializeSentry();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);

