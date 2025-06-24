import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, Vibration, Animated, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, useTheme, ActivityIndicator } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import * as SecureStore from 'expo-secure-store';

// Security configuration
const CORRECT_PIN = '1234'; // TODO: Replace with secure storage in production
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const PIN_LENGTH = 4; // 4-digit PIN

const PinScreen = ({ navigation }) => {
  const theme = useTheme();
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shakeAnimation] = useState(new Animated.Value(0));

  // Check for existing lockout on mount
  useEffect(() => {
    const checkLockout = async () => {
      try {
        const [lockoutTime, storedAttempts] = await Promise.all([
          SecureStore.getItemAsync('pin_lockout_until'),
          SecureStore.getItemAsync('pin_attempts')
        ]);

        if (storedAttempts) {
          setAttempts(parseInt(storedAttempts, 10));
        }

        if (lockoutTime) {
          const lockoutDate = new Date(parseInt(lockoutTime, 10));
          if (lockoutDate > new Date()) {
            setLockoutUntil(lockoutDate);
            setIsLocked(true);
            startLockoutTimer(lockoutDate);
            return;
          }
          await SecureStore.deleteItemAsync('pin_lockout_until');
        }
      } catch (error) {
        console.error('Error checking lockout status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLockout();
  }, []);

  // Update time left for lockout
  useEffect(() => {
    if (!isLocked) return;
    
    const timer = setInterval(() => {
      const now = new Date();
      if (lockoutUntil <= now) {
        setIsLocked(false);
        setLockoutUntil(null);
        SecureStore.deleteItemAsync('pin_lockout_until');
        clearInterval(timer);
      } else {
        setTimeLeft(lockoutUntil - now);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, lockoutUntil]);

  const startLockoutTimer = (until) => {
    const now = new Date();
    const timeLeft = until - now;
    
    if (timeLeft <= 0) {
      setIsLocked(false);
      setLockoutUntil(null);
      return;
    }

    setTimeLeft(timeLeft);
    
    const timer = setTimeout(() => {
      setIsLocked(false);
      setLockoutUntil(null);
      SecureStore.deleteItemAsync('pin_lockout_until');
    }, timeLeft);

    return () => clearTimeout(timer);
  };

  const triggerShake = () => {
    // Reset animation
    shakeAnimation.setValue(0);
    // Start animation
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePinSubmit = async () => {
    if (pin.length !== PIN_LENGTH || isLocked || isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // For demo purposes, using a hardcoded PIN
      // In production, retrieve from secure storage
      const isCorrect = pin === CORRECT_PIN;
      
      if (isCorrect) {
        // Reset attempts on successful login
        await SecureStore.setItemAsync('pin_attempts', '0');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Add a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 300));
        navigation.replace('App');
      } else {
        const newAttempts = attempts + 1;
        const remainingAttempts = MAX_ATTEMPTS - newAttempts;
        
        // Update attempts in secure storage
        await SecureStore.setItemAsync('pin_attempts', newAttempts.toString());
        
        if (newAttempts >= MAX_ATTEMPTS) {
          // Initiate lockout
          const lockoutTime = new Date(Date.now() + LOCKOUT_DURATION);
          await SecureStore.setItemAsync('pin_lockout_until', lockoutTime.getTime().toString());
          
          setLockoutUntil(lockoutTime);
          setIsLocked(true);
          startLockoutTimer(lockoutTime);
          
          // Silent fail - don't show alert, just go to journal
          navigation.replace('App');
          return;
        }
        
        // Visual and haptic feedback for incorrect PIN
        triggerShake();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Vibration.vibrate(200);
        
        // Set error message for display
        setError(`Incorrect PIN. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`);
        
        // Only show alert if not on last attempt
        if (remainingAttempts > 0) {
          // Small delay to allow shake animation to complete
          setTimeout(() => {
            Alert.alert(
              'Incorrect PIN', 
              `You have ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`,
              [{ 
                text: 'Try Again',
                onPress: () => setPin('')
              }]
            );
          }, 300);
        }
        
        setAttempts(newAttempts);
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
      // Set generic error message
      setError('An error occurred. Please try again.');
      triggerShake();
      
      // Log the actual error for debugging
      console.error('PIN verification error:', error);
    } finally {
      setPin('');
      setIsSubmitting(false);
    }
  };

  const formatTimeLeft = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const shakeStyle = {
    transform: [{ translateX: shakeAnimation }]
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading security settings...
        </Text>
      </View>
    );
  }

  if (isLocked && lockoutUntil) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Too Many Attempts
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text, marginBottom: 20 }]}>
          Please wait {formatTimeLeft(timeLeft)} before trying again.
        </Text>
        <Text style={[styles.hint, { color: theme.colors.placeholder }]}>
          For security reasons, further attempts are temporarily disabled.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.primary }]}>
          Enter Your PIN
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text }]}>
          For your security, please enter your 4-digit PIN
        </Text>
        
        {error && (
          <Animated.View 
            style={[
              styles.errorContainer,
              { backgroundColor: theme.colors.errorContainer },
              shakeStyle
            ]}
          >
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {error}
            </Text>
          </Animated.View>
        )}
        <TextInput
          label="4-Digit PIN"
          value={pin}
          onChangeText={(text) => {
            setPin(text);
            setError(null); // Clear error when user starts typing
          }}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={4}
          disabled={isSubmitting}
          style={[
            styles.input,
            error ? styles.inputError : {},
            isSubmitting ? styles.inputDisabled : {}
          ]}
          theme={{
            colors: {
              primary: theme.colors.primary,
              text: theme.colors.text,
              placeholder: theme.colors.placeholder,
              background: theme.dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              error: theme.colors.error,
            },
            roundness: 8,
          }}
          mode="outlined"
          outlineColor={error ? theme.colors.error : theme.colors.primary}
          activeOutlineColor={theme.colors.primary}
          left={
            <TextInput.Icon 
              icon="lock" 
              color={error ? theme.colors.error : theme.colors.primary} 
            />
          }
          render={props => (
            <Animated.View style={shakeStyle}>
              <TextInput {...props} />
            </Animated.View>
          )}
        />
        <Button
          mode="contained"
          onPress={handlePinSubmit}
          style={[
            styles.button, 
            { 
              backgroundColor: theme.colors.primary,
              opacity: pin.length === 4 ? 1 : 0.7,
              marginTop: 20
            }
          ]}
          contentStyle={styles.buttonContent}
          labelStyle={[
            styles.buttonLabel,
            { color: theme.colors.onPrimary }
          ]}
          disabled={pin.length !== 4 || isSubmitting}
          loading={isSubmitting}
          icon={isSubmitting ? null : "arrow-right"}
        >
          {isSubmitting ? 'Verifying...' : 'Continue'}
        </Button>
        
        <TouchableOpacity 
          style={styles.forgotPinButton}
          onPress={() => {
            // TODO: Implement forgot PIN flow
            Alert.alert(
              'Forgot PIN?',
              'Please contact support to reset your PIN.',
              [{ text: 'OK' }]
            );
          }}
        >
          <Text style={[styles.forgotPinText, { color: theme.colors.primary }]}>
            Forgot your PIN?
          </Text>
        </TouchableOpacity>
        <Text style={[styles.attempts, { color: theme.colors.error }]}>
          {attempts > 0 ? `${MAX_ATTEMPTS - attempts} attempt${MAX_ATTEMPTS - attempts !== 1 ? 's' : ''} remaining` : ''}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    marginLeft: 8,
    fontSize: 14,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  inputError: {
    borderColor: 'red',
  },
  inputDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    height: 48,
  },
  forgotPinButton: {
    marginTop: 24,
    alignSelf: 'center',
    padding: 8,
  },
  forgotPinText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  content: {
    width: '100%',
    maxWidth: 320,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    marginBottom: 24,
    backgroundColor: theme.dark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonLabel: {
    fontSize: 16,
  },
  attempts: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
    opacity: 0.8,
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    opacity: 0.7,
  },
});

export default PinScreen;
