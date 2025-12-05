import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import AIChatWidget from './components/AIChatWidget';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Search from './pages/Search';
import DoctorProfile from './pages/DoctorProfile';
import Dashboard from './pages/Dashboard';
import Favorites from './pages/Favorites';
import NotFound from './pages/NotFound';

import { Toaster } from './components/ui/toaster';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AppProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              <Route path="/search" element={<Search />} />
              <Route path="/doctor/:id" element={<DoctorProfile />} />
              <Route
                path="/favorites"
                element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <AIChatWidget />
            <Toaster />
          </div>
        </AppProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
