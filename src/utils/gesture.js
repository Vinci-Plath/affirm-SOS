import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Minimum swipe distance to trigger navigation
const SWIPE_THRESHOLD = 50;

// Maximum allowed time for a swipe (in milliseconds)
const SWIPE_MAX_DURATION = 300;

/**
 * Configures pan gesture handler for swipe navigation
 */
export const createSwipeGesture = (onSwipeLeft, onSwipeRight) => {
  let startX = 0;
  let startTime = 0;
  let isSwiping = false;

  const onStart = (event) => {
    startX = event.nativeEvent.pageX;
    startTime = Date.now();
    isSwiping = true;
  };

  const onEnd = (event) => {
    if (!isSwiping) return;
    
    const endX = event.nativeEvent.pageX;
    const endTime = Date.now();
    const distance = endX - startX;
    const duration = endTime - startTime;
    
    // Check if it's a valid swipe
    if (duration > SWIPE_MAX_DURATION) {
      isSwiping = false;
      return;
    }
    
    // Check if swipe distance meets threshold
    if (Math.abs(distance) < SWIPE_THRESHOLD) {
      isSwiping = false;
      return;
    }
    
    // Determine swipe direction and trigger appropriate handler
    if (distance > 0) {
      // Swipe right
      onSwipeRight?.();
    } else {
      // Swipe left
      onSwipeLeft?.();
    }
    
    isSwiping = false;
  };

  return {
    onStartShouldSetResponder: () => true,
    onMoveShouldSetResponder: () => true,
    onResponderGrant: onStart,
    onResponderRelease: onEnd,
    onResponderTerminate: () => { isSwiping = false; },
  };
};

/**
 * Haptic feedback for gestures
 */
export const triggerHaptic = (type = 'light') => {
  // This will be implemented using expo-haptics in a real app
  if (type === 'success') {
    // Light impact for success
    return;
  } else if (type === 'error') {
    // Heavy impact for errors
    return;
  } else {
    // Light impact for general feedback
    return;
  }
};
