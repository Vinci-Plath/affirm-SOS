import * as SecureStore from 'expo-secure-store';

// Base URL for the API (will be replaced with actual API URL in production)
const API_BASE_URL = 'https://api.affirm-sos.com/v1';

/**
 * Helper function to make API requests
 */
async function apiRequest(endpoint, method = 'GET', data = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = await SecureStore.getItemAsync('authToken');
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    method,
    headers,
  };
  
  if (data) {
    config.body = JSON.stringify(data);
  }
  
  try {
    console.log(`[API] ${method} ${url}`, data ? { data } : '');
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'API request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`[API Error] ${method} ${url}:`, error);
    throw error;
  }
}

/**
 * SOS API Service
 */
export const sosApi = {
  // Send emergency alert
  async sendEmergencyAlert(alertData) {
    // Mock implementation - replace with real API call
    console.log('[MOCK] Sending emergency alert:', alertData);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock response
    return {
      success: true,
      message: 'Emergency alert sent successfully',
      alertId: `alert_${Date.now()}`,
      timestamp: new Date().toISOString(),
      recipients: alertData.contacts.map(c => ({
        phone: c.phone,
        status: 'queued',
        messageId: `msg_${Math.random().toString(36).substr(2, 9)}`
      }))
    };
  },
  
  // Send check-in message
  async sendCheckIn(checkInData) {
    // Mock implementation - replace with real API call
    console.log('[MOCK] Sending check-in:', checkInData);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock response
    return {
      success: true,
      message: 'Check-in sent successfully',
      checkInId: `checkin_${Date.now()}`,
      timestamp: new Date().toISOString()
    };
  },
  
  // Get alert status
  async getAlertStatus(alertId) {
    // Mock implementation - replace with real API call
    console.log(`[MOCK] Getting status for alert: ${alertId}`);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock response
    return {
      alertId,
      status: 'delivered',
      timestamp: new Date().toISOString(),
      recipients: [
        { phone: '+254700000001', status: 'delivered', deliveredAt: new Date().toISOString() },
        { phone: '+254700000002', status: 'pending', deliveredAt: null }
      ]
    };
  },
  
  // Cancel alert (if possible)
  async cancelAlert(alertId) {
    // Mock implementation - replace with real API call
    console.log(`[MOCK] Canceling alert: ${alertId}`);
    
    await new Promise(resolve => setTimeout(resolve, 700));
    
    return {
      success: true,
      message: 'Alert cancellation requested',
      alertId,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * User API Service
 */
export const userApi = {
  // Get user profile
  async getProfile() {
    // Mock implementation
    return {
      id: 'user_123',
      name: 'Test User',
      phone: '+254700000000',
      email: 'user@example.com',
      emergencyContacts: 3,
      lastCheckIn: new Date(Date.now() - 3600000).toISOString()
    };
  },
  
  // Update user profile
  async updateProfile(profileData) {
    // Mock implementation
    console.log('[MOCK] Updating profile:', profileData);
    return { success: true, ...profileData };
  }
};

/**
 * Contacts API Service
 */
export const contactsApi = {
  // Get all emergency contacts
  async getContacts() {
    // Mock implementation
    return [
      { id: '1', name: 'Emergency Contact 1', phone: '+254700000001', isPrimary: true },
      { id: '2', name: 'Emergency Contact 2', phone: '+254700000002', isPrimary: false }
    ];
  },
  
  // Add/update contact
  async saveContact(contact) {
    // Mock implementation
    console.log('[MOCK] Saving contact:', contact);
    return { ...contact, id: contact.id || `contact_${Date.now()}` };
  },
  
  // Delete contact
  async deleteContact(contactId) {
    // Mock implementation
    console.log(`[MOCK] Deleting contact: ${contactId}`);
    return { success: true, id: contactId };
  }
};

/**
 * GBV Organizations API Service
 */
export const gbvApi = {
  // Get all GBV organizations
  async getOrganizations() {
    // Mock implementation
    return [
      { 
        id: 'gbv1', 
        name: 'GBV Emergency Response', 
        phone: '+254720000000',
        description: '24/7 GBV emergency support',
        location: 'Nairobi, Kenya',
        services: ['Emergency shelter', 'Legal aid', 'Counseling']
      }
    ];
  },
  
  // Get organization details
  async getOrganization(orgId) {
    // Mock implementation
    return {
      id: orgId,
      name: 'GBV Emergency Response',
      phone: '+254720000000',
      description: '24/7 GBV emergency support',
      location: 'Nairobi, Kenya',
      services: ['Emergency shelter', 'Legal aid', 'Counseling'],
      hours: '24/7',
      address: '123 Safety Street, Nairobi',
      website: 'https://gbv-kenya.org',
      verified: true
    };
  }
};

// Export all API services
export default {
  sos: sosApi,
  user: userApi,
  contacts: contactsApi,
  gbv: gbvApi
};
