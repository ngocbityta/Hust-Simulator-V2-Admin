import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { HeatmapPage } from './pages/HeatmapPage';
import { BuildingsPage } from './pages/BuildingsPage';
import { RoomsPage } from './pages/RoomsPage';
import { UsersPage } from './pages/UsersPage';
import { EventsPage } from './pages/EventsPage';
import { RecurringEventsPage } from './pages/RecurringEventsPage';
import { LoginPage } from './pages/LoginPage';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/heatmap" element={<HeatmapPage />} />
              <Route path="/buildings" element={<BuildingsPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/recurring-events" element={<RecurringEventsPage />} />
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
