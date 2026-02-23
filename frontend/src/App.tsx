import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { useAuth as useAuthHook } from '@/hooks/useAuth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import LoginPage from '@/pages/Login'
import SignupPage from '@/pages/Signup'
import VerifyPage from '@/pages/Verify'
import Dashboard from '@/pages/Dashboard'
import History from '@/pages/History'

function AppRoutes() {
  const { isAuthenticated } = useAuthHook()

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
        }
      />
      <Route
        path="/signup"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage />
        }
      />
      <Route path="/verify" element={<VerifyPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
