import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './components/Dashboard';
import DriversPage from './pages/DriversPage';
import StudentsPage from './pages/StudentsPage';
import AddStudent from './components/students/AddStudent';
import RoutesPage from './pages/RoutesPage';
import LiveMapPage from './pages/LiveMapPage';
import AlertsPage from './pages/AlertsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />

        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Routes>
                  <Route element={<DashboardLayout />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/drivers" element={<DriversPage />} />
                    <Route path="/students" element={<StudentsPage />} />
                    <Route path="/add-student" element={<AddStudent />} />
                    <Route path="/routes" element={<RoutesPage />} />
                    <Route path="/live-map" element={<LiveMapPage />} />
                    <Route path="/alerts" element={<AlertsPage />} />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  </Route>
                </Routes>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
