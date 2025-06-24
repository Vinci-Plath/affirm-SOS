import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Text, useTheme, HelperText } from 'react-native-paper';
import * as Haptics from 'expo-haptics';
import { isValidPhoneNumber, isValidName } from '../utils/contactUtils';

const ContactForm = ({ contact, onSave, onCancel, isEditing = false }) => {
  const theme = useTheme();
  const [name, setName] = useState(contact?.name || '');
  const [phone, setPhone] = useState(contact?.phone || '');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setPhone(contact.phone);
    }
  }, [contact]);

  const validate = () => {
    const newErrors = {};
    
    if (!isValidName(name)) {
      newErrors.name = 'Please enter a valid name';
    }
    
    if (!isValidPhoneNumber(phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSave({
      ...(contact || {}),
      name: name.trim(),
      phone: phone.trim(),
    });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <TextInput
            label="Name"
            value={name}
            onChangeText={setName}
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="Contact name"
            placeholderTextColor={theme.colors.placeholder}
            maxLength={50}
            autoFocus={!isEditing}
          />
          <HelperText type="error" visible={!!errors.name}>
            {errors.name}
          </HelperText>
        </View>

        <View style={styles.inputContainer}>
          <TextInput
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            style={[styles.input, { color: theme.colors.text }]}
            placeholder="+1234567890"
            placeholderTextColor={theme.colors.placeholder}
            keyboardType="phone-pad"
            maxLength={20}
          />
          <HelperText type="error" visible={!!errors.phone}>
            {errors.phone}
          </HelperText>
          <HelperText type="info" visible={true}>
            Include country code (e.g., +1, +254)
          </HelperText>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={onCancel}
            style={[styles.button, { borderColor: theme.colors.primary }]}
            labelStyle={{ color: theme.colors.primary }}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={[styles.button, { backgroundColor: theme.colors.primary }]}
            labelStyle={{ color: 'white' }}
          >
            {isEditing ? 'Update' : 'Save'}
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  form: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'transparent',
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default ContactForm;
