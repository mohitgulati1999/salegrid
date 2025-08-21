import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Clock, TrendingUp, AlertCircle, Target, MessageSquare, Send, Info } from 'lucide-react';

const AnalyticsScreen = ({ user, customer, session, onNavigate }) => {
  // Debug: Log received props to verify component rendering and data flow
  console.log('AnalyticsScreen props:', { user, customer, session, onNavigate });
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customerReply, setCustomerReply] = useState('');
  const [generatingFollowup, setGeneratingFollowup] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const apiService = (await import('../services/api')).default;
        const sessionId = session?.id || session?._id;
        if (sessionId) {
          console.log('Fetching analytics for session ID:', sessionId);
          const response = await apiService.getSessionAnalytics(sessionId);
          console.log('Analytics response:', response);
          setAnalytics(response.analytics);
        } else {
          setAnalytics(null);
        }
      } catch (error) {
        console.error('Failed to load analytics from API:', error);
        setAnalytics(null);
      }
      setLoading(false);
    };
    fetchAnalytics();
  }, [customer, session]);

  const generateFollowup = async () => {
    if (!customerReply.trim()) {
      alert('Please enter customer reply first');
      return;
    }
    setGeneratingFollowup(true);
    try {
      const apiService = (await import('../services/api')).default;
      if (session?.id) {
        const response = await apiService.generateFollowup(session.id, customerReply);
        setAnalytics(prev => ({
          ...prev,
          followupMessage: response.followupMessage || prev.followupMessage
        }));
      }
    } catch (error) {
      alert('Failed to generate followup. Please try again.');
    } finally {
      setGeneratingFollowup(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Analyzing conversation...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Info className="h-10 w-10 text-blue-400 mx-auto mb-2" />
          <p className="text-lg text-gray-700 font-medium">No analytics available for this session yet.</p>
          <p className="text-gray-500 mt-2">Try refreshing or check back after the analysis is complete.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => onNavigate('dashboard')}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Session Analytics</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Session Overview */}
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <div className="flex items-center mb-4">
              <User className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Session Overview</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-gray-500">Customer</p>
                <p className="font-semibold text-gray-900">{customer?.name || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Date & Time</p>
                <p className="font-semibold text-gray-900">{formatDate(session?.sessionDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-500 mr-1" />
                  <p className="font-semibold text-gray-900">{formatDuration(session?.duration || 0)}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">Salesperson</p>
                <p className="font-semibold text-gray-900">{user?.name || '-'}</p>
              </div>
            </div>
          </div>

          {/* Performance Scores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className={`bg-white p-6 rounded-xl shadow-lg border flex flex-col items-center justify-center ${getScoreBg(analytics.pitchScore)}`}> 
              <TrendingUp className="h-8 w-8 text-blue-600 mb-2" />
              <div className={`text-5xl font-extrabold ${getScoreColor(analytics.pitchScore)}`}>{analytics.pitchScore}</div>
              <p className="text-sm text-gray-600 mt-1">Pitch Score (out of 100)</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border flex flex-col items-center justify-center">
              <Target className="h-8 w-8 text-green-600 mb-2" />
              <div className="text-5xl font-extrabold text-blue-600">{analytics.buyerIntent}%</div>
              <p className="text-sm text-gray-600 mt-1">Buyer Intent (likelihood to purchase)</p>
            </div>
          </div>

          {/* Customer Objections */}
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Customer Objections</h3>
            </div>
            <div className="space-y-3">
              {analytics.objections && analytics.objections.length > 0 ? (
                analytics.objections.map((objection, index) => (
                  <div key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-7 h-7 bg-orange-100 text-orange-800 rounded-full flex items-center justify-center text-base font-bold mr-3">
                      {index + 1}
                    </span>
                    <p className="text-gray-700 text-base">{objection}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No objections found.</p>
              )}
            </div>
          </div>

          {/* Mistakes & Improvements */}
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Areas for Improvement</h3>
            </div>
            <div className="space-y-4">
              {analytics.mistakes && analytics.mistakes.length > 0 ? (
                analytics.mistakes.map((mistake, index) => (
                  <div key={index} className="border-l-4 border-red-200 pl-4 mb-2">
                    <div className="bg-red-50 p-3 rounded-md mb-2">
                      <p className="text-sm font-medium text-red-800">What you said:</p>
                      <p className="text-base text-red-700">"{mistake.statement}"</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-md">
                      <p className="text-sm font-medium text-green-800">Recommendation:</p>
                      <p className="text-base text-green-700">{mistake.comment}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No mistakes found.</p>
              )}
            </div>
          </div>

          {/* Actionable Insights */}
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <div className="flex items-center mb-4">
              <TrendingUp className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Actionable Insights</h3>
            </div>
            <div className="space-y-3">
              {analytics.insights && analytics.insights.length > 0 ? (
                analytics.insights.map((insight, index) => (
                  <div key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-7 h-7 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-base font-bold mr-3">
                      {index + 1}
                    </span>
                    <p className="text-gray-700 text-base">{insight}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No insights found.</p>
              )}
            </div>
          </div>

          {/* Follow-up Message */}
          <div className="bg-white p-6 rounded-xl shadow-lg border">
            <div className="flex items-center mb-4">
              <MessageSquare className="h-6 w-6 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Follow-up Message</h3>
            </div>
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <p className="text-gray-700 whitespace-pre-wrap text-base">{analytics.followupMessage || 'No follow-up message generated.'}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Reply (for personalized follow-up)
                </label>
                <textarea
                  value={customerReply}
                  onChange={(e) => setCustomerReply(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter customer's response or concerns..."
                />
              </div>
              <button
                onClick={generateFollowup}
                disabled={generatingFollowup}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {generatingFollowup ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Generate Follow-up Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsScreen;