
import { Routes, Route, Navigate } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import RoutesPage from '@/pages/Routes';
import Progress from '@/pages/Progress';
import Social from '@/pages/Social';
import Profile from '@/pages/Profile';
import UserProfilePage from '@/pages/UserProfile';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
          <Toaster />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Index />} />
      <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/auth" />} />
      <Route path="/routes" element={user ? <RoutesPage /> : <Navigate to="/auth" />} />
      <Route path="/progress" element={user ? <Progress /> : <Navigate to="/auth" />} />
      <Route path="/social" element={user ? <Social /> : <Navigate to="/auth" />} />
      <Route path="/profile" element={user ? <Profile /> : <Navigate to="/auth" />} />
      <Route path="/profile/:userId" element={user ? <UserProfilePage /> : <Navigate to="/auth" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
