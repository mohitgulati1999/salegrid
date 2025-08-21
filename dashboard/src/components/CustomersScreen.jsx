import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Phone, Calendar, Clock, Search } from 'lucide-react';

const CustomersScreen = ({ user, onNavigate }) => {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCustomers, setFilteredCustomers] = useState([]);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const apiService = (await import('../services/api')).default;
        const response = await apiService.getCustomers({ organizationId: user.organizationId, salespersonId: user.id });
        setCustomers(response.customers || []);
        setFilteredCustomers(response.customers || []);
      } catch (error) {
        console.error('Failed to fetch customers from backend:', error);
        setCustomers([]);
        setFilteredCustomers([]);
      }
    };
    fetchCustomers();
  }, [user]);

  useEffect(() => {
    // Filter customers based on search term
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const filtered = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm)
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerAnalytics, setCustomerAnalytics] = useState([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const handleCustomerClick = async (customer) => {
    setSelectedCustomer(customer);
    setLoadingAnalytics(true);
    try {
      const apiService = (await import('../services/api')).default;
      const analyticsResponse = await apiService.getCustomerAnalytics(customer._id);
      setCustomerAnalytics(analyticsResponse.analytics || []);
    } catch (error) {
      console.error('Failed to fetch customer analytics:', error);
      setCustomerAnalytics([]);
    }
    setLoadingAnalytics(false);
  };

  const handleAnalyticsSelect = (analytics) => {
    if (analytics && analytics.sessionId) {
      onNavigate('analytics', {
        customer: selectedCustomer,
        session: {
          ...analytics.sessionId,
          id: analytics.sessionId?._id || analytics.sessionId
        },
        analytics
      });
    }
  };

  const formatDate = (dateString) => {
    return dateString ? new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <button
              onClick={() => {
                setSelectedCustomer(null);
                setCustomerAnalytics([]);
                onNavigate('dashboard');
              }}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search customers..."
            />
          </div>
        </div>

        {/* Customer Cards or Analytics List */}
        {!selectedCustomer ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCustomers.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
                <p className="text-gray-600">
                  {searchTerm ? 'No customers match your search.' : 'Start a sale session to add customers.'}
                </p>
              </div>
            ) : (
              filteredCustomers.map((customer, index) => (
                <div
                  key={index}
                  onClick={() => handleCustomerClick(customer)}
                  className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer border border-gray-200 hover:border-blue-300"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-1" />
                        {customer.phone}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Total Sessions:</span>
                      <span className="font-medium text-gray-900">{customer.totalSessions || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Last Contact:</span>
                      <div className="flex items-center text-gray-900">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(customer.lastContactDate)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <span className="text-xs text-blue-600 font-medium">Click to view analytics</span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => {
                  setSelectedCustomer(null);
                  setCustomerAnalytics([]);
                }}
                className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                &larr; Back to Customers
              </button>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Analytics History for {selectedCustomer.name}</h2>
              {loadingAnalytics ? (
                <div className="text-center py-8">Loading analytics...</div>
              ) : customerAnalytics.length === 0 ? (
                <div className="text-center py-8 text-gray-600">No analytics available for this customer yet.</div>
              ) : (
                <div className="space-y-4">
                  {customerAnalytics.map((analytics, idx) => (
                    <div
                      key={analytics._id || idx}
                      className="bg-white p-4 rounded shadow border hover:border-blue-400 cursor-pointer"
                      onClick={() => handleAnalyticsSelect(analytics)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-gray-900">Session Date: {formatDate(analytics.sessionId?.sessionDate)}</div>
                          <div className="text-sm text-gray-600">Pitch Score: {analytics.pitchScore} | Buyer Intent: {analytics.buyerIntent}%</div>
                        </div>
                        <div className="text-xs text-blue-600">View Details</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomersScreen;