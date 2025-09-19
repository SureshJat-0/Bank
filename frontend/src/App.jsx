import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/Login.jsx';
import Register from './auth/Register.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';
import UserDashboard from './components/UserDashboard.jsx';
import IntentEntityRecognizer from './components/IntentEntityRecognizer.jsx';
import useAuthStore from './store/authStore.jsx';

function App() {
  const { token, role } = useAuthStore();

  const Protected = ({ children }) => token ? children : <Navigate to="/login" />;
  const AdminOnly = ({ children }) => token && role === 'admin' ? children : <Navigate to="/dashboard" />;
  const UserOnly = ({ children }) => token && role === 'user' ? children : <Navigate to="/login" />;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!token ? <Login /> : (role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/dashboard" />)} />
      <Route path="/register" element={!token ? <Register /> : (role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/dashboard" />)} />

      {/* Protected User Routes */}
      <Route path="/dashboard" element={
        <UserOnly>
          <UserDashboard />
        </UserOnly>
      } />
      
      <Route path="/chat" element={
        <Protected>
          <ChatWindow />
        </Protected>
      } />
      
      <Route path="/chat/:sessionId" element={
        <Protected>
          <ChatWindow />
        </Protected>
      } />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <AdminOnly>
          <AdminDashboard />
        </AdminOnly>
      } />

      <Route path="/admin/intent-recognizer" element={
        <AdminOnly>
          <IntentEntityRecognizer />
        </AdminOnly>
      } />

      {/* Default redirects */}
      <Route path="/" element={
        token ? (
          role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/dashboard" />
        ) : <Navigate to="/login" />
      } />
      
      <Route path="*" element={
        token ? (
          role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Navigate to="/dashboard" />
        ) : <Navigate to="/login" />
      } />
    </Routes>
  );
}

export default App;
