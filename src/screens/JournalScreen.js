import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSwipeGesture } from '../utils/gestures';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = 50;

const JournalScreen = ({ navigation }) => {
  const theme = useTheme();
  const [journalText, setJournalText] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const currentDate = format(new Date(), 'MMMM d, yyyy');
  const pan = new Animated.ValueXY();
  
  // Check if onboarding has been shown before
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('@hasSeenSwipeOnboarding');
        if (hasSeenOnboarding !== 'true') {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }
    };
    
    checkOnboarding();
  }, []);
  
  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem('@hasSeenSwipeOnboarding', 'true');
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };
  
  // Handle swipe gestures
  const onSwipeLeft = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Settings');
  };
  
  const onSwipeRight = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Action');
  };
  
  const panResponder = createSwipeGesture(onSwipeLeft, onSwipeRight);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Animated.View 
        style={[
          styles.content,
          { transform: [{ translateX: pan.x }], flex: 1 }
        ]}
        {...panResponder}
      >
        <Text style={[styles.date, { color: theme.colors.text }]}>{currentDate}</Text>
        <TextInput
          style={[styles.input, { color: theme.colors.text }]}
          multiline
          placeholder="Write your thoughts..."
          placeholderTextColor={theme.colors.placeholder}
          value={journalText}
          onChangeText={setJournalText}
          selectionColor={theme.colors.primary}
        />
      </Animated.View>
      
      {/* Onboarding Overlay */}
      {showOnboarding && (
        <View style={styles.onboardingOverlay}>
          <View style={styles.onboardingContent}>
            <Text style={styles.onboardingTitle}>Swipe Gestures</Text>
            <View style={styles.gestureRow}>
              <View style={styles.gestureContainer}>
                <Text style={styles.gestureArrow}>←</Text>
                <Text style={styles.gestureText}>Swipe left for Settings</Text>
              </View>
              <View style={styles.gestureContainer}>
                <Text style={styles.gestureArrow}>→</Text>
                <Text style={styles.gestureText}>Swipe right for SOS</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.gotItButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleOnboardingComplete}
            >
              <Text style={styles.gotItText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  content: {
    flex: 1,
  },
  date: {
    fontSize: 16,
    marginBottom: 20,
    opacity: 0.7,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  // Onboarding styles
  onboardingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  onboardingContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  onboardingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  gestureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  gestureContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  gestureArrow: {
    fontSize: 32,
    marginBottom: 8,
  },
  gestureText: {
    fontSize: 14,
    textAlign: 'center',
  },
  gotItButton: {
    borderRadius: 25,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  gotItText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default JournalScreen;
