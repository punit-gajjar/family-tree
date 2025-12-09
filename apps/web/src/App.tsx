import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import LoginPage from './pages/LoginPage';
import AppLayout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import MembersPage from './pages/MembersPage';
import RelationshipsPage from './pages/RelationshipsPage';
import MastersPage from './pages/MastersPage';
import TreePage from './pages/TreePage';
import SettingsPage from './pages/SettingsPage';

import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/app" element={<AppLayout />}>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="members" element={<MembersPage />} />
                  <Route path="relationships" element={<RelationshipsPage />} />
                  <Route path="masters" element={<MastersPage />} />
                  <Route path="tree" element={<TreePage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route index element={<Navigate to="dashboard" replace />} />
                </Route>
              </Route>

              <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
