// API configuration and service functions for Sales Analytics Pro

const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  async getCustomerAnalytics(customerId) {
    return this.request(`/analytics/customer/${customerId}`);
  }
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(userData) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUserProfile(userId) {
    return this.request(`/auth/profile/${userId}`);
  }

  // Session endpoints
  async createSession(sessionData) {
    return this.request('/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  async getSessions(salespersonId, page = 1, limit = 10) {
    return this.request(`/sessions/salesperson/${salespersonId}?page=${page}&limit=${limit}`);
  }

  async getSession(sessionId) {
    return this.request(`/sessions/${sessionId}`);
  }

  async getSessionStats(salespersonId) {
    return this.request(`/sessions/stats/${salespersonId}`);
  }

  // Customer endpoints
  async getCustomers(params = {}) {
    // Always include salespersonId if available
    if (params.salespersonId) {
      params.salespersonId = params.salespersonId;
    }
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/customers?${queryString}`);
  }

  async getCustomer(customerId) {
    return this.request(`/customers/${customerId}`);
  }

  async updateCustomerNotes(customerId, notes) {
    return this.request(`/customers/${customerId}/notes`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    });
  }

  // Analytics endpoints
  async analyzeSession(sessionId) {
    return this.request(`/analytics/analyze/${sessionId}`, {
      method: 'POST',
    });
  }

  async getSessionAnalytics(sessionId) {
    return this.request(`/analytics/session/${sessionId}`);
  }

  async generateFollowup(sessionId, customerReply) {
    return this.request(`/analytics/followup/${sessionId}`, {
      method: 'POST',
      body: JSON.stringify({ customerReply }),
    });
  }

  async getAnalyticsStats(salespersonId, period = '30') {
    return this.request(`/analytics/salesperson/${salespersonId}/stats?period=${period}`);
  }
}

export default new ApiService();