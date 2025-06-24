import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Switch } from 'react-native';
import { useTheme, List, Divider, Button, FAB, Portal, Modal } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import ContactForm from '../components/ContactForm';
import { getContacts, saveContact, deleteContact, generateTestPayload } from '../utils/contactUtils';

const SettingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const isTestMode = __DEV__; // Only show test features in development
  const [notifications, setNotifications] = useState(true);
  const [location, setLocation] = useState(true);

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setIsLoading(true);
      const loadedContacts = await getContacts();
      setContacts(loadedContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
      Alert.alert('Error', 'Failed to load contacts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveContact = async (contact) => {
    try {
      await saveContact(contact);
      await loadContacts();
      setIsFormVisible(false);
      setEditingContact(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Error saving contact:', error);
      Alert.alert('Error', error.message || 'Failed to save contact');
    }
  };

  const handleDeleteContact = (contact) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteContact(contact.id);
              await loadContacts();
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.error('Error deleting contact:', error);
              Alert.alert('Error', 'Failed to delete contact');
            }
          },
        },
      ]
    );
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setIsFormVisible(true);
  };

  const handleTestSMS = async () => {
    try {
      const payload = await generateTestPayload();
      console.log('Test SMS Payload:', payload);
      Alert.alert(
        'Test SMS Generated',
        'Check the console for the generated payload.\n\n' +
        `Recipients: ${payload.contacts.join(', ') || 'No contacts'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error generating test SMS:', error);
      Alert.alert('Error', 'Failed to generate test SMS');
    }
  };

  const toggleDarkMode = () => setIsDarkMode(previousState => !previousState);
  const toggleNotifications = () => setNotifications(previousState => !previousState);
  const toggleLocation = () => setLocation(previousState => !previousState);

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="contacts" size={48} color={theme.colors.placeholder} />
      <Text style={[styles.emptyText, { color: theme.colors.text }]}>
        No emergency contacts added yet
      </Text>
      <Text style={[styles.emptySubtext, { color: theme.colors.placeholder }]}>
        Add at least one emergency contact to get started
      </Text>
    </View>
  );

  const renderContactItem = ({ item }) => (
    <List.Item
      title={item.name}
      description={item.phone}
      left={props => <List.Icon {...props} icon="account-circle" />}
      right={props => (
        <View style={styles.contactActions}>
          <TouchableOpacity onPress={() => handleEditContact(item)}>
            <MaterialIcons
              name="edit"
              size={24}
              color={theme.colors.primary}
              style={styles.actionIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteContact(item)}>
            <MaterialIcons
              name="delete-outline"
              size={24}
              color={theme.colors.error}
              style={styles.actionIcon}
            />
          </TouchableOpacity>
        </View>
      )}
      style={styles.contactItem}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <List.Section style={styles.section}>
        <List.Subheader style={[styles.subheader, { color: theme.colors.primary }]}>
          Emergency Contacts
        </List.Subheader>
        
        {isLoading ? (
          <ActivityIndicator style={styles.loading} />
        ) : contacts.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={contacts}
            keyExtractor={(item) => item.id}
            renderItem={renderContactItem}
            ItemSeparatorComponent={Divider}
            scrollEnabled={false}
          />
        )}
        
        {isTestMode && (
          <Button
            mode="outlined"
            onPress={handleTestSMS}
            icon="message-alert"
            style={styles.testButton}
            labelStyle={{ color: theme.colors.primary }}
          >
            Test SMS Payload
          </Button>
        )}
      </List.Section>

      <List.Section>
        <List.Subheader style={{ color: theme.colors.primary }}>Appearance</List.Subheader>
        <List.Item
          title="Dark Mode"
          left={props => <List.Icon {...props} icon="theme-light-dark" />}
          right={() => (
            <Switch
              value={isDarkMode}
              onValueChange={toggleDarkMode}
              color={theme.colors.primary}
            />
          )}
        />
        
        <Divider />
        
        <List.Subheader style={{ color: theme.colors.primary }}>Preferences</List.Subheader>
        <List.Item
          title="Enable Notifications"
          left={props => <List.Icon {...props} icon="bell" />}
          right={() => (
            <Switch
              value={notifications}
              onValueChange={toggleNotifications}
              color={theme.colors.primary}
            />
          )}
        />
        <List.Item
          title="Location Services"
          description="Allow location access for emergency alerts"
          left={props => <List.Icon {...props} icon="map-marker" />}
          right={() => (
            <Switch
              value={location}
              onValueChange={toggleLocation}
              color={theme.colors.primary}
            />
          )}
        />
      </List.Section>
      
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        color="white"
        onPress={() => {
          setEditingContact(null);
          setIsFormVisible(true);
        }}
      />
      
      <View style={styles.footer}>
        <Text style={[styles.version, { color: theme.colors.text }]}>
          App Version 1.0.0
        </Text>
      </View>
      
      <Portal>
        <Modal
          visible={isFormVisible}
          onDismiss={() => {
            setIsFormVisible(false);
            setEditingContact(null);
          }}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.background }]}
        >
          <ContactForm
            contact={editingContact}
            onSave={handleSaveContact}
            onCancel={() => {
              setIsFormVisible(false);
              setEditingContact(null);
            }}
            isEditing={!!editingContact}
          />
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    padding: 16,
    paddingBottom: 0,
  },
  subheader: {
    fontSize: 16,
    fontWeight: '600',
    paddingTop: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  contactItem: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    marginVertical: 4,
    borderRadius: 8,
  },
  contactActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginLeft: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modal: {
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  loading: {
    marginVertical: 32,
  },
  testButton: {
    marginTop: 16,
    borderColor: 'gold',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  version: {
    fontSize: 12,
    opacity: 0.6,
  },
});

export default SettingsScreen;
