import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';

const CONTACTS_STORAGE_KEY = 'emergency_contacts';
const GBV_ORGS_STORAGE_KEY = 'gbv_organizations';

// Default GBV organizations (can be customized by user)
const DEFAULT_GBV_ORGS = [
  {
    id: 'gbv-helpline',
    name: 'GBV Emergency Helpline',
    phone: '+254720000000', // Replace with actual helpline number
    isOrganization: true
  }
];

// Validate phone number (supports international format)
const isValidPhoneNumber = (phone) => {
  // Basic validation - allows numbers, +, -, spaces, and parentheses
  const phoneRegex = /^[+]?[\s\-\(\)0-9]{8,20}$/;
  return phoneRegex.test(phone);
};

// Validate contact name
const isValidName = (name) => {
  return name.trim().length > 0 && name.trim().length <= 50;
};

// Get all emergency contacts (personal + GBV orgs)
const getEmergencyContacts = async () => {
  try {
    // Get personal emergency contacts
    const personalContacts = await getPersonalContacts();
    
    // Get GBV organizations
    const gbvOrgs = await getGBVOrganizations();
    
    // Combine and return all emergency contacts
    return [...personalContacts, ...gbvOrgs];
  } catch (e) {
    console.error('Error getting emergency contacts:', e);
    return [];
  }
};

// Get personal emergency contacts
const getPersonalContacts = async () => {
  try {
    const jsonValue = await SecureStore.getItemAsync(CONTACTS_STORAGE_KEY);
    return jsonValue ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error getting personal contacts:', e);
    return [];
  }
};

// Get GBV organizations
const getGBVOrganizations = async () => {
  try {
    const jsonValue = await SecureStore.getItemAsync(GBV_ORGS_STORAGE_KEY);
    if (jsonValue) {
      return JSON.parse(jsonValue);
    }
    // Initialize with default organizations if none exist
    await SecureStore.setItemAsync(GBV_ORGS_STORAGE_KEY, JSON.stringify(DEFAULT_GBV_ORGS));
    return DEFAULT_GBV_ORGS;
  } catch (e) {
    console.error('Error getting GBV organizations:', e);
    return [];
  }
};

// Save a contact
const saveContact = async (contact) => {
  try {
    if (!isValidName(contact.name)) {
      throw new Error('Please enter a valid name');
    }
    if (!isValidPhoneNumber(contact.phone)) {
      throw new Error('Please enter a valid phone number');
    }

    const contacts = await getContacts();
    const existingIndex = contacts.findIndex(c => c.id === contact.id);
    
    let updatedContacts;
    if (existingIndex >= 0) {
      // Update existing contact
      updatedContacts = [...contacts];
      updatedContacts[existingIndex] = contact;
    } else {
      // Add new contact
      const newContact = {
        ...contact,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      updatedContacts = [...contacts, newContact];
    }

    await SecureStore.setItemAsync(CONTACTS_STORAGE_KEY, JSON.stringify(updatedContacts));
    return updatedContacts;
  } catch (error) {
    console.error('Error saving contact:', error);
    throw error;
  }
};

// Delete a contact
const deleteContact = async (contactId) => {
  try {
    const contacts = await getContacts();
    const updatedContacts = contacts.filter(contact => contact.id !== contactId);
    await SecureStore.setItemAsync(CONTACTS_STORAGE_KEY, JSON.stringify(updatedContacts));
    
    // Provide haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    return updatedContacts;
  } catch (error) {
    console.error('Error deleting contact:', error);
    throw error;
  }
};

// Format contact for API
const formatForApi = (contact) => ({
  id: contact.id,
  name: contact.name.trim(),
  phone: contact.phone.replace(/[^0-9+]/g, ''), // Remove formatting
  createdAt: contact.createdAt,
  updatedAt: new Date().toISOString(),
});

// Generate test SMS payload
const generateTestPayload = async () => {
  const contacts = await getContacts();
  return {
    message: 'TEST MESSAGE - This is a test SMS',
    contacts: contacts.map(c => c.phone.replace(/[^0-9+]/g, '')),
    timestamp: new Date().toISOString(),
    isTest: true,
  };
};

// Add or update a GBV organization
const saveGBVOrganization = async (org) => {
  try {
    if (!isValidName(org.name)) {
      throw new Error('Please enter a valid organization name');
    }
    if (!isValidPhoneNumber(org.phone)) {
      throw new Error('Please enter a valid phone number');
    }

    const orgs = await getGBVOrganizations();
    const existingIndex = orgs.findIndex(o => o.id === org.id);
    
    let updatedOrgs;
    if (existingIndex >= 0) {
      // Update existing org
      updatedOrgs = [...orgs];
      updatedOrgs[existingIndex] = { ...org, isOrganization: true };
    } else {
      // Add new org
      updatedOrgs = [...orgs, { ...org, id: `gbv-${Date.now()}`, isOrganization: true }];
    }

    await SecureStore.setItemAsync(GBV_ORGS_STORAGE_KEY, JSON.stringify(updatedOrgs));
    return updatedOrgs;
  } catch (e) {
    console.error('Error saving GBV organization:', e);
    throw e;
  }
};

// Delete a GBV organization
const deleteGBVOrganization = async (orgId) => {
  try {
    const orgs = await getGBVOrganizations();
    const updatedOrgs = orgs.filter(org => org.id !== orgId);
    await SecureStore.setItemAsync(GBV_ORGS_STORAGE_KEY, JSON.stringify(updatedOrgs));
    return updatedOrgs;
  } catch (e) {
    console.error('Error deleting GBV organization:', e);
    throw e;
  }
};

export {
  getEmergencyContacts,
  getPersonalContacts,
  getGBVOrganizations,
  saveContact,
  deleteContact,
  saveGBVOrganization,
  deleteGBVOrganization,
  isValidPhoneNumber,
  isValidName,
  formatForApi,
  generateTestPayload,
};
