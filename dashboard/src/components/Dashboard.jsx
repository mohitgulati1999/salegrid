import React, { useState, useEffect } from 'react';
import { Play, BarChart3, Users, LogOut, TrendingUp, TrendingDown, Clock, Lightbulb } from 'lucide-react';

const Dashboard = ({ user, onNavigate, onLogout }) => {
  const [stats, setStats] = useState({
    totalSessions: 0,
    bestPerformance: 0,
    worstPerformance: 0
  });
  
  const [dailyTips, setDailyTips] = useState([
    "Start conversations with open-ended questions to engage customers",
    "Listen actively and acknowledge customer concerns before responding",
    "Use the customer's name during conversation to build rapport",
    "Focus on benefits rather than just features when presenting",
    "Always end with a clear next step or call to action"
  ]);

  useEffect(() => {
    const loadStats = async () => {
      if (user?.id) {
        try {
          const apiService = (await import('../services/api')).default;
          const response = await apiService.getAnalyticsStats(user.id);
          setStats({
            ...response.stats,
            totalSessions: response.stats.totalAnalyzed || 0
          });
        } catch (error) {
          console.warn('Failed to load stats from API, using localStorage:', error);
          // Fallback to localStorage
          const savedStats = localStorage.getItem('salesStats');
          if (savedStats) {
            setStats(JSON.parse(savedStats));
          }
        }
      } else {
        // Load from localStorage
        const savedStats = localStorage.getItem('salesStats');
        if (savedStats) {
          setStats(JSON.parse(savedStats));
        }
      }
    };

    loadStats();
  }, [user]);

  const StatCard = ({ title, value, icon: Icon, color = "blue" }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
        </div>
        <Icon className={`h-8 w-8 text-${color}-500`} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}</h1>
              <p className="text-sm text-gray-600">{user?.organizationName}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => onNavigate('saleSession')}
            className="flex items-center justify-center p-6 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            <Play className="h-6 w-6 mr-3" />
            Start Sale Session
          </button>
          <button
            onClick={() => onNavigate('customers')}
            className="flex items-center justify-center p-6 bg-purple-600 text-white rounded-lg shadow-md hover:bg-purple-700 transition-colors"
          >
            <Users className="h-6 w-6 mr-3" />
            Customers
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Sales Sessions"
            value={stats.totalSessions}
            icon={Clock}
            color="blue"
          />
          <StatCard
            title="Best Performance"
            value={`${stats.bestPerformance}%`}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Worst Performance"
            value={`${stats.worstPerformance}%`}
            icon={TrendingDown}
            color="red"
          />
        </div>

        {/* Daily Tips */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <Lightbulb className="h-6 w-6 text-yellow-500 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Daily Sales Tips</h2>
          </div>
          <div className="space-y-3">
            {dailyTips.map((tip, index) => (
              <div key={index} className="flex items-start">
                <span className="flex-shrink-0 w-6 h-6 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                  {index + 1}
                </span>
                <p className="text-gray-700 text-sm leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;