import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { theme } from '../styles/theme';
import { prebook, completeBooking } from '../services/api';

const BookingScreen = ({ route, navigation }) => {
  const { hotel, rate, searchParams } = route.params;
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    cardholderName: '',
    voucherCode: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const { guestName, guestEmail, cardholderName } = formData;
    
    if (!guestName.trim()) {
      Alert.alert('Error', 'Please enter guest name');
      return false;
    }
    
    if (!guestEmail.trim()) {
      Alert.alert('Error', 'Please enter guest email');
      return false;
    }
    
    if (!cardholderName.trim()) {
      Alert.alert('Error', 'Please enter cardholder name');
      return false;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guestEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  const handleBooking = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Parse city and country code from location
      const locationParts = searchParams.location.split(',');
      const cityCode = locationParts[0]?.trim();
      const countryCode = locationParts[1]?.trim() || 'US';

      // Step 1: Prebook
      const prebookData = {
        hotelId: hotel.id,
        rateKey: rate.key || rate.id,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        guests: parseInt(searchParams.guests),
        environment: searchParams.environment,
        cityCode,
        countryCode,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
      };

      const prebookResponse = await prebook(prebookData);
      
      if (!prebookResponse.prebookId) {
        throw new Error('Prebook failed: No prebookId received');
      }

      // Step 2: Complete booking
      const bookingData = {
        prebookId: prebookResponse.prebookId,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        cardholderName: formData.cardholderName,
        voucherCode: formData.voucherCode || '',
        environment: searchParams.environment,
      };

      const bookingResponse = await completeBooking(bookingData);

      // Navigate to confirmation screen
      navigation.navigate('BookingConfirmation', {
        bookingDetails: {
          hotel,
          rate,
          searchParams,
          guestInfo: formData,
          prebookId: prebookResponse.prebookId,
          bookingResponse,
        },
      });

    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert(
        'Booking Failed', 
        error.message || 'Failed to complete booking. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Hotel Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.sectionTitle}>Booking Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Hotel:</Text>
              <Text style={styles.summaryValue}>{hotel.name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Check-in:</Text>
              <Text style={styles.summaryValue}>{searchParams.checkIn}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Check-out:</Text>
              <Text style={styles.summaryValue}>{searchParams.checkOut}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Guests:</Text>
              <Text style={styles.summaryValue}>{searchParams.guests}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Rate:</Text>
              <Text style={styles.summaryValue}>
                {rate.currency || 'USD'} {parseFloat(rate.net || rate.amount || 0).toFixed(2)} per night
              </Text>
            </View>
          </View>

          {/* Guest Information Form */}
          <View style={styles.formCard}>
            <Text style={styles.sectionTitle}>Guest Information</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Guest Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.guestName}
                onChangeText={(value) => handleInputChange('guestName', value)}
                placeholder="Enter full name"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Guest Email *</Text>
              <TextInput
                style={styles.input}
                value={formData.guestEmail}
                onChangeText={(value) => handleInputChange('guestEmail', value)}
                placeholder="Enter email address"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cardholder Name *</Text>
              <TextInput
                style={styles.input}
                value={formData.cardholderName}
                onChangeText={(value) => handleInputChange('cardholderName', value)}
                placeholder="Enter cardholder name"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Voucher Code (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.voucherCode}
                onChangeText={(value) => handleInputChange('voucherCode', value)}
                placeholder="Enter voucher code if available"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <Text style={styles.disclaimer}>
              * Required fields. This is a {searchParams.environment} booking.
            </Text>
          </View>

          {/* Book Button */}
          <TouchableOpacity
            style={[styles.bookButton, loading && styles.bookButtonDisabled]}
            onPress={handleBooking}
            disabled={loading}
          >
            <Text style={styles.bookButtonText}>
              {loading ? 'Processing Booking...' : 'Complete Booking'}
            </Text>
          </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.md,
  },
  summaryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium,
  },
  formCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
    color: theme.colors.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  summaryLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  summaryValue: {
    ...theme.typography.body,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
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
  disclaimer: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  bookButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  bookButtonDisabled: {
    opacity: 0.6,
  },
  bookButtonText: {
    color: theme.colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BookingScreen; 