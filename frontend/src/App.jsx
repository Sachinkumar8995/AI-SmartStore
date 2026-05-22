import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import AIContent from './pages/AIContent';
import AISuggestions from './pages/AISuggestions';
import Inventory from './pages/Inventory';
import Shop from './pages/Shop';

function ProtectedRoute({ children }) {

  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', flexDirection: 'column', gap: '16px'
      }}>
        <div className="spinner spinner-lg" />
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', flexDirection: 'column', gap: '16px'
      }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/" /> : children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#f1f5f9' }
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' }
            }
          }}
        />
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="ai-content" element={<AIContent />} />
            <Route path="ai-suggestions" element={<AISuggestions />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="shop" element={<Shop />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
