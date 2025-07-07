import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { theme } from '../styles/theme';
import { searchHotels, getFunnyResponse } from '../services/api';

const HomeScreen = ({ navigation }) => {
  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [environment, setEnvironment] = useState('sandbox');
  const [funnyResponse, setFunnyResponse] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Set default dates to 3 months from now
    const now = new Date();
    const threeMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
    const fourMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate() + 3);
    
    setCheckIn(threeMonthsLater.toISOString().split('T')[0]);
    setCheckOut(fourMonthsLater.toISOString().split('T')[0]);
  }, []);

  const handleSearch = async () => {
    if (!location || !checkIn || !checkOut) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await searchHotels({
        location,
        checkIn,
        checkOut,
        guests: parseInt(guests),
        environment,
      });

      if (response.hotels && response.hotels.length > 0) {
        navigation.navigate('SearchResults', {
          hotels: response.hotels,
          searchParams: { location, checkIn, checkOut, guests, environment },
        });
      } else {
        Alert.alert('No Results', 'No hotels found for your search criteria');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFunnyResponse = async () => {
    try {
      const response = await getFunnyResponse();
      setFunnyResponse(response.funnyResponse);
    } catch (error) {
      Alert.alert('Error', 'Failed to get funny response');
    }
  };

  const handleGuestSelection = () => {
    const guestOptions = ['1 Guest', '2 Guests', '3 Guests', '4 Guests', '5+ Guests'];
    const guestValues = ['1', '2', '3', '4', '5'];
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', ...guestOptions],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            setGuests(guestValues[buttonIndex - 1]);
          }
        }
      );
    } else {
      Alert.alert(
        'Select Guests',
        'Choose number of guests',
        guestOptions.map((option, index) => ({
          text: option,
          onPress: () => setGuests(guestValues[index]),
        })).concat([{ text: 'Cancel', style: 'cancel' }])
      );
    }
  };

  const handleEnvironmentSelection = () => {
    const environmentOptions = ['Sandbox (Test)', 'Production (Live)'];
    const environmentValues = ['sandbox', 'production'];
    
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', ...environmentOptions],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex > 0) {
            setEnvironment(environmentValues[buttonIndex - 1]);
          }
        }
      );
    } else {
      Alert.alert(
        'Select Environment',
        'Choose booking environment',
        environmentOptions.map((option, index) => ({
          text: option,
          onPress: () => setEnvironment(environmentValues[index]),
        })).concat([{ text: 'Cancel', style: 'cancel' }])
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>🏨 SlickBooker</Text>
          <Text style={styles.subtitle}>Find your perfect stay</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g., New York, US"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Check-in</Text>
              <TextInput
                style={styles.input}
                value={checkIn}
                onChangeText={setCheckIn}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Check-out</Text>
              <TextInput
                style={styles.input}
                value={checkOut}
                onChangeText={setCheckOut}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Guests</Text>
            <TouchableOpacity style={styles.selectButton} onPress={handleGuestSelection}>
              <Text style={styles.selectButtonText}>
                {guests === '1' ? '1 Guest' : 
                 guests === '2' ? '2 Guests' : 
                 guests === '3' ? '3 Guests' : 
                 guests === '4' ? '4 Guests' : '5+ Guests'}
              </Text>
              <Text style={styles.selectButtonArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Environment</Text>
            <TouchableOpacity style={styles.selectButton} onPress={handleEnvironmentSelection}>
              <Text style={styles.selectButtonText}>
                {environment === 'sandbox' ? 'Sandbox (Test)' : 'Production (Live)'}
              </Text>
              <Text style={styles.selectButtonArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSearch}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Searching...' : 'Search Hotels'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={handleFunnyResponse}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              Get Funny Response
            </Text>
          </TouchableOpacity>

          {funnyResponse ? (
            <View style={styles.funnyResponseContainer}>
              <Text style={styles.funnyResponse}>{funnyResponse}</Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  form: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.caption,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    fontSize: 16,
    backgroundColor: theme.colors.surface,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  selectButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
  },
  selectButtonText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  selectButtonArrow: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  secondaryButtonText: {
    color: theme.colors.primary,
  },
  funnyResponseContainer: {
    marginTop: theme.spacing.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.medium,
  },
  funnyResponse: {
    ...theme.typography.body,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default HomeScreen; 