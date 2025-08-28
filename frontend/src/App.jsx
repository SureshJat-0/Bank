import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/Login.jsx';
import Register from './auth/Register.jsx';
import ChatWindow from './components/ChatWindow.jsx';
import AdminDashboard from './admin/AdminDashboard.jsx';
import IntentEntityRecognizer from './components/IntentEntityRecognizer.jsx';
import useAuthStore from './store/authStore.jsx';

function App() {
  const { token, role } = useAuthStore();

  const Protected = ({ children }) => token ? children : <Navigate to="/login" replace />;
  const AdminOnly = ({ children }) => token && role === 'admin' ? children : <Navigate to="/login" replace />;

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected Routes */}
      <Route
        path="/chat"
        element={<Protected><ChatWindow /></Protected>}
      />
      <Route
        path="/chat/:sessionId"
        element={<Protected><ChatWindow /></Protected>}
      />
      <Route
        path="/admin/dashboard"
        element={<AdminOnly><AdminDashboard /></AdminOnly>}
      />
      <Route
        path="/nlu"
        element={<Protected><IntentEntityRecognizer /></Protected>}
      />

      {/* Default redirects */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
