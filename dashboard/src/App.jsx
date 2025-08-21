import React, { useState, useEffect } from 'react';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import SaleSessionScreen from './components/SaleSessionScreen';
import CustomersScreen from './components/CustomersScreen';
import AnalyticsScreen from './components/AnalyticsScreen';
import './index.css';

function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [user, setUser] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);

  // Check if user is logged in on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('salesUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentScreen('dashboard');
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('salesUser', JSON.stringify(userData));
    setCurrentScreen('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('salesUser');
    setCurrentScreen('login');
  };

  const navigateToScreen = (screen, data = null) => {
    if (screen === 'analytics') {
      if (data) {
        setSelectedCustomer(data.customer);
        setSelectedSession(data.session);
      } else {
        // If no data, keep previous selection or set to null
        setSelectedCustomer(selectedCustomer);
        setSelectedSession(selectedSession);
      }
    }
    setCurrentScreen(screen);
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onLogin={handleLogin} />;
      case 'dashboard':
        return (
          <Dashboard
            user={user}
            onNavigate={navigateToScreen}
            onLogout={handleLogout}
          />
        );
      case 'saleSession':
        return (
          <SaleSessionScreen
            user={user}
            onNavigate={navigateToScreen}
          />
        );
      case 'customers':
        return (
          <CustomersScreen
            user={user}
            onNavigate={navigateToScreen}
          />
        );
      case 'analytics':
        return (
          <AnalyticsScreen
            user={user}
            customer={selectedCustomer}
            session={selectedSession}
            onNavigate={navigateToScreen}
          />
        );
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderCurrentScreen()}
    </div>
  );
}

export default App;