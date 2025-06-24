import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';

const LOCATION_TASK_NAME = 'background-location-task';

// Request location permissions and start tracking
export const startLocationTracking = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    // For background location, we need to request background permissions separately
    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    if (bgStatus !== 'granted') {
      console.warn('Background location permission not granted');
      // Continue with foreground only
    }

    // Start location updates
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      distanceInterval: 10, // Minimum change (in meters) between updates
      timeInterval: 5000, // Minimum time (in milliseconds) between updates
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Emergency Location Tracking',
        notificationBody: 'Your location is being tracked for emergency services',
        notificationColor: '#8A2BE2',
      },
    });

    return true;
  } catch (error) {
    console.error('Error starting location tracking:', error);
    throw error;
  }
};

// Stop location tracking
export const stopLocationTracking = async () => {
  try {
    await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
    return true;
  } catch (error) {
    console.error('Error stopping location tracking:', error);
    throw error;
  }
};

// Get current location
export const getCurrentLocation = async () => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: location.timestamp,
    };
  } catch (error) {
    console.error('Error getting current location:', error);
    throw error;
  }
};

// Format location for SMS/API
export const formatLocationForSMS = (location) => {
  if (!location) return '';
  
  const { latitude, longitude, accuracy } = location;
  const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
  
  return `Emergency Location:\n` +
    `Latitude: ${latitude.toFixed(6)}\n` +
    `Longitude: ${longitude.toFixed(6)}\n` +
    `Accuracy: ${Math.round(accuracy)}m\n` +
    `Map: ${googleMapsLink}`;
};

// Background task handler
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data: { locations }, error }) => {
  if (error) {
    console.error('Location task error:', error);
    return;
  }
  
  // Here you would typically send the location to your server
  // For now, we'll just log it
  console.log('Received new location in background:', locations[0]);
  
  // Store the latest location in AsyncStorage or similar
  // This would be used if the app needs to send the last known location
  // in case of an emergency
  try {
    await AsyncStorage.setItem('@last_known_location', JSON.stringify(locations[0]));
  } catch (e) {
    console.error('Error saving location:', e);
  }
});
