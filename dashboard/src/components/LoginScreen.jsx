import React, { useState } from 'react';
import { User, Phone, LogIn, UserPlus } from 'lucide-react';

const LoginScreen = ({ onLogin }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    organizationId: 'ORG001',
    zoneId: 'ZONE001',
    storeId: 'STORE001'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name.trim() || !formData.mobile.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.mobile.length < 10) {
      setError('Please enter a valid mobile number');
      return;
    }

    setLoading(true);

    try {
      // Try API call first, fallback to localStorage if API is unavailable
      try {
        const apiService = (await import('../services/api')).default;
        const response = await apiService.login({
          name: formData.name,
          mobile: formData.mobile,
          organizationId: formData.organizationId,
          zoneId: formData.zoneId,
          storeId: formData.storeId
        });

        const userData = {
          ...response.user,
          loginTime: new Date().toISOString(),
          useAPI: true
        };

        onLogin(userData);
      } catch (apiError) {
        console.warn('API unavailable, using localStorage:', apiError);
        
        // Fallback to localStorage
        const userData = {
          id: `local_${Date.now()}`,
          name: formData.name,
          mobile: formData.mobile,
          organizationId: formData.organizationId,
          organizationName: 'TechCorp Solutions',
          zoneId: formData.zoneId,
          storeId: formData.storeId,
          loginTime: new Date().toISOString(),
          useAPI: false
        };

        onLogin(userData);
      }
    } catch (err) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Sales Analytics Pro
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSignup ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        <form className="mt-8 space-y-6 bg-white p-6 rounded-lg shadow-md" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name *
              </label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                Mobile Number *
              </label>
              <div className="mt-1 relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="mobile"
                  name="mobile"
                  type="tel"
                  required
                  className="appearance-none relative block w-full pl-10 pr-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10"
                  placeholder="Enter your mobile number"
                  value={formData.mobile}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {isSignup && (
              <>
                <div>
                  <label htmlFor="organizationId" className="block text-sm font-medium text-gray-700">
                    Organization ID
                  </label>
                  <input
                    id="organizationId"
                    name="organizationId"
                    type="text"
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                    value={formData.organizationId}
                    readOnly
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="zoneId" className="block text-sm font-medium text-gray-700">
                      Zone ID
                    </label>
                    <input
                      id="zoneId"
                      name="zoneId"
                      type="text"
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                      value={formData.zoneId}
                      readOnly
                    />
                  </div>

                  <div>
                    <label htmlFor="storeId" className="block text-sm font-medium text-gray-700">
                      Store ID
                    </label>
                    <input
                      id="storeId"
                      name="storeId"
                      type="text"
                      className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                      value={formData.storeId}
                      readOnly
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  {isSignup ? <UserPlus className="h-5 w-5 mr-2" /> : <LogIn className="h-5 w-5 mr-2" />}
                  {isSignup ? 'Create Account' : 'Sign In'}
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-500"
              onClick={() => setIsSignup(!isSignup)}
            >
              {isSignup ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;