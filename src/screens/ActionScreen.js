import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Vibration, Animated, Easing } from 'react-native';
import { useTheme, ActivityIndicator, Button } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import { sendEmergencyAlert, startCheckInTimer, sendCheckIn } from '../services/emergencyService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const COUNTDOWN_DURATION = 30000; // 30 seconds
const VIBRATION_PATTERN = [0, 1000, 200, 1000, 200, 1000]; // SOS pattern
const WARNING_THRESHOLD = 10000; // 10 seconds left
const DANGER_THRESHOLD = 5000; // 5 seconds left

const ActionScreen = ({ navigation }) => {
  const theme = useTheme();
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [cancelTimer, setCancelTimer] = useState(null);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [checkInProgress, setCheckInProgress] = useState(false);
  
  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Clean up timers and animations on unmount
  useEffect(() => {
    return () => {
      if (cancelTimer) {
        cancelTimer();
      }
      Vibration.cancel();
      pulseAnim.stopAnimation();
      progressAnim.stopAnimation();
      shakeAnim.stopAnimation();
    };
  }, [cancelTimer]);
  
  // Pulse animation for check-in button
  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };
  
  // Shake animation for warning state
  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  // Format time for display
  const formatTime = (ms) => {
    const seconds = Math.ceil(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSOS = async () => {
    if (isSending) return;
    
    try {
      setIsSending(true);
      await sendEmergencyAlert({
        customMessage: 'I need immediate help!',
      });
      
      // Visual and haptic feedback
      Vibration.vibrate(VIBRATION_PATTERN, true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      
      // Show success message
      Alert.alert(
        'Emergency Alert Sent',
        'Your emergency contacts have been notified with your location.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to send emergency alert. Please try again.'
      );
    } finally {
      setIsSending(false);
    }
  };

  const startCheckIn = () => {
    if (isCheckingIn) {
      // Cancel check-in
      cancelCheckIn();
      return;
    }

    // Start check-in countdown
    setIsCheckingIn(true);
    setCheckInProgress(true);
    
    // Start pulse animation
    startPulse();
    
    // Reset progress animation
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: COUNTDOWN_DURATION,
      useNativeDriver: false,
      easing: Easing.linear,
    }).start();
    
    const stopTimer = startCheckInTimer(
      COUNTDOWN_DURATION,
      async () => {
        // Timer completed - send emergency alert
        Vibration.vibrate(VIBRATION_PATTERN, true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        
        try {
          await sendEmergencyAlert({
            customMessage: 'I missed my check-in and need help!',
          });
          
          // Show confirmation with trauma-informed messaging
          Alert.alert(
            'Safety Check Failed',
            'Your emergency contacts have been notified with your location.',
            [{
              text: 'I\'m Safe',
              onPress: handleSafeConfirmation,
              style: 'default'
            }]
          );
        } catch (error) {
          console.error('Error sending missed check-in alert:', error);
          Alert.alert(
            'Check-in Failed',
            'Could not send emergency alert. Please try again.',
            [{ text: 'OK' }]
          );
        } finally {
          resetCheckIn();
        }
      },
      (remainingMs) => {
        // Update countdown display
        setCountdown(remainingMs);
        
        // Visual and haptic feedback based on time remaining
        if (remainingMs <= DANGER_THRESHOLD) {
          // Last 5 seconds - urgent feedback
          if (remainingMs % 1000 < 50) { // Every second
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          }
        } else if (remainingMs <= WARNING_THRESHOLD) {
          // Last 10 seconds - warning feedback
          if (remainingMs % 2000 < 50) { // Every 2 seconds
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            triggerShake();
          }
        }
      }
    );

    setCancelTimer(() => stopTimer);
    Haptics.notificationAsync(Haptics.ImpactFeedbackStyle.Medium);
  };
  
  const cancelCheckIn = () => {
    if (cancelTimer) {
      cancelTimer();
      Vibration.cancel();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Show confirmation with trauma-informed messaging
      Alert.alert(
        'Check-in Cancelled',
        'Your safety check has been cancelled.',
        [{ 
          text: 'OK',
          onPress: () => {
            // Small delay for better UX
            setTimeout(resetCheckIn, 300);
          }
        }]
      );
    }
  };
  
  const resetCheckIn = () => {
    setCountdown(null);
    setCancelTimer(null);
    setIsCheckingIn(false);
    setCheckInProgress(false);
    pulseAnim.stopAnimation();
    progressAnim.stopAnimation();
    shakeAnim.stopAnimation();
  };

  const handleQuickCheckIn = async () => {
    try {
      setIsSending(true);
      await sendCheckIn('Quick check-in: I am safe!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Show brief success message before navigating
      Alert.alert(
        'Check-in Sent',
        'Your contacts have been notified that you are safe.',
        [{
          text: 'OK',
          onPress: () => {
            // Reset all states and navigate to Journal Screen
            resetCheckIn();
            navigation.navigate('Journal');
          }
        }]
      );
    } catch (error) {
      console.error('Error sending check-in:', error);
      Alert.alert('Error', 'Failed to send check-in. Please try again.');
    } finally {
      setIsSending(false);
    }
  };
  
  // Handle when user confirms they're safe after a missed check-in
  const handleSafeConfirmation = async () => {
    try {
      await sendCheckIn('False alarm - I am safe!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Reset all states and navigate to Journal Screen
      resetCheckIn();
      navigation.navigate('Journal');
    } catch (error) {
      console.error('Error sending safety confirmation:', error);
      // Even if sending fails, still reset and navigate
      resetCheckIn();
      navigation.navigate('Journal');
    }
  };

  // Calculate button styles based on state
  const getCheckInButtonStyle = () => {
    if (isSending) return { opacity: 0.6 };
    
    if (isCheckingIn && countdown !== null) {
      if (countdown <= DANGER_THRESHOLD) {
        return { backgroundColor: theme.colors.error };
      } else if (countdown <= WARNING_THRESHOLD) {
        return { backgroundColor: theme.colors.warning };
      }
      return { backgroundColor: theme.colors.primary };
    }
    
    return { backgroundColor: theme.colors.primary };
  };

  // Calculate countdown text style based on time remaining
  const getCountdownTextStyle = () => {
    if (countdown <= DANGER_THRESHOLD) {
      return { color: '#fff', fontWeight: 'bold', fontSize: 32 };
    } else if (countdown <= WARNING_THRESHOLD) {
      return { color: '#fff', fontWeight: '600', fontSize: 28 };
    }
    return { color: '#fff', fontSize: 24 };
  };

  // Calculate progress bar color based on time remaining
  const getProgressColor = () => {
    if (countdown <= DANGER_THRESHOLD) return theme.colors.error;
    if (countdown <= WARNING_THRESHOLD) return theme.colors.warning;
    return theme.colors.primary;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.buttonsContainer}>
        {/* SOS Button */}
        <Animated.View 
          style={[
            styles.buttonWrapper,
            {
              opacity: isCheckingIn ? 0.7 : 1,
              transform: [{ scale: isCheckingIn ? 0.95 : 1 }]
            }
          ]}
        >
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.sosButton,
              { 
                borderColor: theme.colors.error,
                opacity: isSending ? 0.6 : 1,
                transform: [{ scale: pulseAnim }]
              }
            ]}
            onPress={handleSOS}
            disabled={isSending || isCheckingIn}
          >
            {isSending ? (
              <ActivityIndicator color={theme.colors.error} />
            ) : (
              <>
                <MaterialCommunityIcons 
                  name="alert-octagon" 
                  size={28} 
                  color={theme.colors.error} 
                  style={styles.buttonIcon}
                />
                <Text style={[styles.sosText, { color: theme.colors.error }]}>
                  EMERGENCY
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Progress Bar */}
        {isCheckingIn && countdown !== null && (
          <View style={styles.progressBarContainer}>
            <Animated.View 
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%']
                  }),
                  backgroundColor: getProgressColor(),
                  opacity: 0.3
                }
              ]} 
            />
          </View>
        )}

        {/* Check-in Button */}
        <Animated.View 
          style={[
            styles.buttonWrapper,
            {
              transform: [
                { translateX: shakeAnim },
                { scale: pulseAnim }
              ]
            }
          ]}
        >
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.checkInButton,
              getCheckInButtonStyle(),
              { opacity: isSending ? 0.6 : 1 }
            ]}
            onPress={startCheckIn}
            onLongPress={!isCheckingIn ? handleQuickCheckIn : undefined}
            disabled={isSending}
            activeOpacity={0.8}
          >
            {isCheckingIn ? (
              <View style={styles.checkInContent}>
                <Text style={[styles.checkInText, getCountdownTextStyle()]}>
                  {formatTime(countdown)}
                </Text>
                <Text style={styles.checkInSubtext}>Tap to cancel</Text>
              </View>
            ) : (
              <View style={styles.checkInContent}>
                <MaterialCommunityIcons 
                  name="timer" 
                  size={28} 
                  color="#fff" 
                  style={styles.buttonIcon}
                />
                <Text style={styles.checkInText}>
                  CHECK IN
                </Text>
                <Text style={styles.subText}>(hold for quick check-in)</Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Status Message */}
      <View style={styles.statusContainer}>
        {isCheckingIn ? (
          <Text style={[styles.statusText, { color: theme.colors.text }]}>
            <MaterialCommunityIcons 
              name="shield-alert" 
              size={16} 
              color={countdown <= DANGER_THRESHOLD ? theme.colors.error : theme.colors.text} 
            />
            {' '}
            {countdown <= DANGER_THRESHOLD 
              ? 'Emergency alert will be sent soon!' 
              : 'Complete your check-in to stay safe'}
          </Text>
        ) : (
          <Text style={[styles.instructions, { color: theme.colors.text }]}>
            Press and hold check-in for quick safety confirmation
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  buttonsContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonWrapper: {
    width: '100%',
    marginBottom: 24,
  },
  actionButton: {
    width: '100%',
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  sosButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  checkInButton: {
    // Background color is set dynamically
  },
  buttonIcon: {
    marginBottom: 8,
  },
  sosText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
  checkInContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkInText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 4,
  },
  checkInSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  subText: {
    fontSize: 12,
    fontWeight: 'normal',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textAlign: 'center',
  },
  statusContainer: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  instructions: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
    lineHeight: 20,
  },
  progressBarContainer: {
    height: 4,
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginTop: -12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
});

export default ActionScreen;
