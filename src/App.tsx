import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MobileBottomNav from './components/MobileBottomNav';
import ScrollToTopButton from './components/ScrollToTopButton';

// Lazy load route components for code splitting
const Auth = React.lazy(() => import('./pages/Auth'));
const Home = React.lazy(() => import('./pages/Home'));
const PollDetail = React.lazy(() => import('./pages/PollDetail'));
const PollResultsPage = React.lazy(() => import('./pages/PollResultsPage'));
const CreatePoll = React.lazy(() => import('./pages/CreatePoll'));
const Bookmarks = React.lazy(() => import('./pages/Bookmarks'));
const Profile = React.lazy(() => import('./pages/Profile'));

const LoadingSpinner = () => (
  <div className="min-h-screen bg-dark-950 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="pb-16 sm:pb-0">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={<Home />} />
              <Route path="/poll/:id" element={<PollDetail />} />
              <Route path="/poll/:id/results" element={<PollResultsPage />} />
              <Route 
                path="/create" 
                element={
                  <ProtectedRoute>
                    <CreatePoll />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/bookmarks" 
                element={
                  <ProtectedRoute>
                    <Bookmarks />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </Suspense>
          <MobileBottomNav />
          <ScrollToTopButton />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;