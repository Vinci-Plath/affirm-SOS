import * as SecureStore from 'expo-secure-store';
import { getEmergencyContacts, getPersonalContacts, getGBVOrganizations } from '../utils/contactUtils';
import { getCurrentLocation, formatLocationForSMS } from './locationService';
import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import api from './apiService';

// Message templates
const MESSAGES = {
  EMERGENCY: 'I\'m in danger. Send help. Do not call.',
  CHECK_IN: 'I\'m safe. This is a check-in message.',
  CHECK_IN_MISSED: 'I missed my check-in and need help!',
  SAFE_AFTER_ALERT: 'False alarm - I am safe!'
};

// Mock SMS sending (will be replaced with real API calls)
const sendSMS = async (phoneNumbers, message) => {
  console.log(`[MOCK] Sending SMS to ${phoneNumbers.length} recipients:`, message);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate success response
  return {
    success: true,
    message: 'SMS sent successfully',
    timestamp: new Date().toISOString(),
    recipients: phoneNumbers.map(phone => ({
      phone,
      status: 'queued',
      messageId: `msg_${Math.random().toString(36).substr(2, 9)}`
    }))
  };
};

/**
 * Send emergency alert with location to all emergency contacts
 * @param {Object} options - Alert options
 * @param {string} [options.customMessage] - Custom message to include in the alert
 * @returns {Promise<Object>} - Result of the alert sending operation
 */
export const sendEmergencyAlert = async (options = {}) => {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    
    // Get all emergency contacts (personal + GBV orgs)
    const personalContacts = await getPersonalContacts();
    const gbvOrgs = await getGBVOrganizations();
    const allContacts = [...personalContacts, ...gbvOrgs];
    
    if (allContacts.length === 0) {
      throw new Error('No emergency contacts found. Please add contacts in Settings.');
    }

    // Get current location with fallback
    let locationData = null;
    let locationMessage = 'Location unavailable';
    let googleMapsLink = '';
    
    try {
      locationData = await getCurrentLocation();
      locationMessage = `Lat: ${locationData.latitude.toFixed(6)}, Lon: ${locationData.longitude.toFixed(6)}`;
      googleMapsLink = `https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}`;
    } catch (locationError) {
      console.warn('Could not get current location:', locationError);
      // Continue with default fallback messages
    }

    // Prepare alert data for API
    const alertData = {
      message: options.customMessage || MESSAGES.EMERGENCY,
      location: locationData ? {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        timestamp: locationData.timestamp || new Date().toISOString(),
        address: locationMessage,
        mapUrl: googleMapsLink
      } : null,
      contacts: allContacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        isOrganization: contact.isOrganization || false
      })),
      timestamp: new Date().toISOString()
    };

    // Send alert using the API service
    const result = await api.sos.sendEmergencyAlert(alertData);
    
    // Log the alert for debugging
    console.log('Emergency alert sent:', {
      alertId: result.alertId,
      timestamp: result.timestamp,
      recipients: result.recipients.length
    });
    
    return {
      ...result,
      location: alertData.location,
      recipients: alertData.contacts
    };
  } catch (error) {
    console.error('Error sending emergency alert:', error);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    throw error;
  }
};

/**
 * Start a check-in timer
 * @param {number} duration - Duration in milliseconds
 * @param {Function} onComplete - Callback when timer completes
 * @param {Function} onTick - Callback for each tick
 * @returns {Function} Function to cancel the timer
 */
export const startCheckInTimer = (duration, onComplete, onTick) => {
  console.log(`[CHECK-IN] Starting ${duration}ms timer`);
  
  let startTime = Date.now();
  let remaining = duration;
  let timerId;
  let isCancelled = false;
  
  const tick = () => {
    if (isCancelled) return;
    
    const elapsed = Date.now() - startTime;
    remaining = Math.max(0, duration - elapsed);
    
    if (onTick) {
      onTick(remaining);
    }
    
    if (remaining <= 0) {
      if (onComplete) {
        onComplete();
      }
      return;
    }
    
    // Schedule next tick with requestAnimationFrame for smoother UI updates
    timerId = requestAnimationFrame(tick);
  };
  
  // Start the timer using requestAnimationFrame for better performance
  timerId = requestAnimationFrame(tick);
  
  // Return function to cancel the timer
  return () => {
    if (!isCancelled) {
      console.log('[CHECK-IN] Timer cancelled');
      isCancelled = true;
      cancelAnimationFrame(timerId);
    }
  };
};

/**
 * Send a check-in message to emergency contacts
 * @param {string} message - Custom check-in message
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.isEmergency=false] - Whether this is an emergency check-in
 * @returns {Promise<Object>} Result of the check-in operation
 */
export const sendCheckIn = async (message, options = {}) => {
  const { isEmergency = false } = options;
  console.log(`[CHECK-IN] Sending ${isEmergency ? 'emergency ' : ''}check-in: ${message}`);
  
  try {
    // Get all emergency contacts (personal + GBV orgs)
    const personalContacts = await getPersonalContacts();
    const gbvOrgs = await getGBVOrganizations();
    const allContacts = [...personalContacts, ...gbvOrgs];
    
    if (allContacts.length === 0) {
      throw new Error('No emergency contacts found. Please add contacts in Settings.');
    }
    
    // Get current location with fallback
    let locationData = null;
    let locationMessage = 'Location unavailable';
    let googleMapsLink = '';
    
    try {
      locationData = await getCurrentLocation();
      locationMessage = `Lat: ${locationData.latitude.toFixed(6)}, Lon: ${locationData.longitude.toFixed(6)}`;
      googleMapsLink = `https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}`;
    } catch (error) {
      console.warn('Could not get location for check-in:', error);
    }
    
    // Prepare check-in data for API
    const checkInData = {
      message: message || (isEmergency ? MESSAGES.CHECK_IN_MISSED : MESSAGES.CHECK_IN),
      isEmergency,
      location: locationData ? {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        timestamp: locationData.timestamp || new Date().toISOString(),
        address: locationMessage,
        mapUrl: googleMapsLink
      } : null,
      contacts: allContacts.map(contact => ({
        id: contact.id,
        name: contact.name,
        phone: contact.phone,
        isOrganization: contact.isOrganization || false
      })),
      timestamp: new Date().toISOString()
    };
    
    // Send check-in using the API service
    const result = await api.sos.sendCheckIn(checkInData);
    
    // Log the check-in for debugging
    console.log('Check-in sent:', {
      checkInId: result.checkInId,
      timestamp: result.timestamp,
      isEmergency,
      recipients: checkInData.contacts.length
    });
    
    return {
      ...result,
      location: checkInData.location,
      recipients: checkInData.contacts
    };
  } catch (error) {
    console.error('Error sending check-in:', error);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    throw error;
  }
};
