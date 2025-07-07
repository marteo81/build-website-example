import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { theme } from '../styles/theme';
import ApiService from '../services/api';

export default function HomeScreen({ navigation }) {
  const [formData, setFormData] = useState({
    city: '',
    checkin: '',
    checkout: '',
    adults: '2',
    environment: 'production'
  });
  const [funnyResponse, setFunnyResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Set default dates to 3 months in the future
    const setDefaultDates = () => {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setMonth(today.getMonth() + 3);
      
      const checkinDate = new Date(futureDate);
      const checkoutDate = new Date(futureDate);
      checkoutDate.setDate(futureDate.getDate() + 1);
      
      setFormData(prev => ({
        ...prev,
        checkin: checkinDate.toISOString().split('T')[0],
        checkout: checkoutDate.toISOString().split('T')[0]
      }));
    };
    
    setDefaultDates();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleGetFunnyResponse = async () => {
    if (!formData.city || !formData.checkin || !formData.checkout) {
      Alert.alert('Error', 'Please fill in all fields first!');
      return;
    }

    setIsLoading(true);
    try {
      const response = await ApiService.getFunnyResponse({
        what: `hotel in ${formData.city}`,
        where: formData.city,
        when: `${formData.checkin} to ${formData.checkout}`
      });
      setFunnyResponse(response.funnyResponse);
    } catch (error) {
      Alert.alert('Error', 'Failed to get funny response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!formData.city || !formData.checkin || !formData.checkout) {
      Alert.alert('Error', 'Please fill in all required fields!');
      return;
    }

    setIsLoading(true);
    try {
      // Parse location (expecting 'City, CountryCode') like the web app
      let city = '';
      let countryCode = '';
      if (formData.city.includes(',')) {
        [city, countryCode] = formData.city.split(',').map(s => s.trim());
      } else {
        city = formData.city.trim();
        countryCode = 'US'; // fallback
      }

      const searchParams = {
        ...formData,
        city,
        countryCode
      };
      
      navigation.navigate('SearchResults', { searchParams });
    } catch (error) {
      Alert.alert('Error', 'Failed to search hotels. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Find Your Perfect Hotel</Text>
        <Text style={styles.subtitle}>Search and book hotels worldwide</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>City</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. New York, US or Paris, FR"
            value={formData.city}
            onChangeText={(value) => handleInputChange('city', value)}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Check-in Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.checkin}
              onChangeText={(value) => handleInputChange('checkin', value)}
            />
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.label}>Check-out Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={formData.checkout}
              onChangeText={(value) => handleInputChange('checkout', value)}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Number of Adults</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.adults}
              onValueChange={(value) => handleInputChange('adults', value)}
              style={styles.picker}
            >
              <Picker.Item label="1 Adult" value="1" />
              <Picker.Item label="2 Adults" value="2" />
              <Picker.Item label="3 Adults" value="3" />
              <Picker.Item label="4 Adults" value="4" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Environment</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.environment}
              onValueChange={(value) => handleInputChange('environment', value)}
              style={styles.picker}
            >
              <Picker.Item label="Production" value="production" />
              <Picker.Item label="Sandbox" value="sandbox" />
            </Picker>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.funnyButton} 
          onPress={handleGetFunnyResponse}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Get Funny Response</Text>
          )}
        </TouchableOpacity>

        {funnyResponse ? (
          <View style={styles.responseContainer}>
            <Text style={styles.responseText}>{funnyResponse}</Text>
          </View>
        ) : null}

        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Search Hotels</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.caption,
    textAlign: 'center',
  },
  form: {
    padding: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    flex: 0.48,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.surface,
  },
  picker: {
    height: 50,
  },
  funnyButton: {
    backgroundColor: theme.colors.secondary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.small,
  },
  searchButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  responseContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    ...theme.shadows.small,
  },
  responseText: {
    ...theme.typography.body,
    fontStyle: 'italic',
  },
}); 