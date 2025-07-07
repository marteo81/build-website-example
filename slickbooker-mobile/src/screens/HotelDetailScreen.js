import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import { theme } from '../styles/theme';

const HotelDetailScreen = ({ route, navigation }) => {
  const { hotel, searchParams, rates } = route.params;
  const [selectedRate, setSelectedRate] = useState(null);

  useEffect(() => {
    if (rates && rates.length > 0) {
      setSelectedRate(rates[0]);
    }
  }, [rates]);

  const handleBookNow = () => {
    if (!selectedRate) {
      Alert.alert('Error', 'Please select a rate to proceed with booking');
      return;
    }

    navigation.navigate('Booking', {
      hotel,
      rate: selectedRate,
      searchParams,
    });
  };

  const renderRateOption = (rate, index) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.rateCard,
        selectedRate === rate && styles.selectedRateCard
      ]}
      onPress={() => setSelectedRate(rate)}
    >
      <View style={styles.rateInfo}>
        <Text style={styles.rateName}>{rate.rateName || 'Standard Rate'}</Text>
        <Text style={styles.rateDescription}>{rate.description || 'Room rate'}</Text>
        {rate.amenities && (
          <Text style={styles.rateAmenities}>{rate.amenities.join(', ')}</Text>
        )}
      </View>
      <View style={styles.ratePrice}>
        <Text style={styles.price}>
          {rate.currency || hotel.currency || 'USD'} {parseFloat(rate.net || rate.amount || 0).toFixed(2)}
        </Text>
        <Text style={styles.priceSubtext}>per night</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Image
          source={{ uri: hotel.image || 'https://via.placeholder.com/400x300' }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <View style={styles.content}>
          <View style={styles.headerSection}>
            <Text style={styles.hotelName}>{hotel.name}</Text>
            
            <View style={styles.ratingContainer}>
              <Text style={styles.rating}>⭐ {hotel.rating || 'N/A'}</Text>
              <Text style={styles.category}>{hotel.category || ''}</Text>
            </View>
            
            <Text style={styles.address}>{hotel.address}</Text>
          </View>

          {hotel.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About This Hotel</Text>
              <Text style={styles.description}>{hotel.description}</Text>
            </View>
          )}

          {hotel.amenities && hotel.amenities.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {hotel.amenities.map((amenity, index) => (
                  <View key={index} style={styles.amenityItem}>
                    <Text style={styles.amenityText}>• {amenity}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Rates</Text>
            {rates && rates.length > 0 ? (
              <View style={styles.ratesContainer}>
                {rates.map(renderRateOption)}
              </View>
            ) : (
              <View style={styles.noRatesContainer}>
                <Text style={styles.noRatesText}>No rates available for selected dates</Text>
              </View>
            )}
          </View>

          <View style={styles.bookingSection}>
            <TouchableOpacity
              style={[
                styles.bookButton,
                (!selectedRate || !rates?.length) && styles.bookButtonDisabled
              ]}
              onPress={handleBookNow}
              disabled={!selectedRate || !rates?.length}
            >
              <Text style={styles.bookButtonText}>
                {selectedRate 
                  ? `Book Now - ${selectedRate.currency || 'USD'} ${parseFloat(selectedRate.net || selectedRate.amount || 0).toFixed(2)}`
                  : 'Select a Rate to Book'
                }
              </Text>
            </TouchableOpacity>
          </View>
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
  heroImage: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: theme.spacing.md,
  },
  headerSection: {
    marginBottom: theme.spacing.lg,
  },
  hotelName: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  rating: {
    ...theme.typography.body,
    fontWeight: '600',
    marginRight: theme.spacing.sm,
  },
  category: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  address: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.md,
  },
  description: {
    ...theme.typography.body,
    lineHeight: 24,
    color: theme.colors.textSecondary,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    width: '50%',
    paddingVertical: theme.spacing.xs,
  },
  amenityText: {
    ...theme.typography.caption,
    color: theme.colors.text,
  },
  ratesContainer: {
    gap: theme.spacing.sm,
  },
  rateCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.small,
  },
  selectedRateCard: {
    borderColor: theme.colors.primary,
    backgroundColor: '#f0f8ff',
  },
  rateInfo: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  rateName: {
    ...theme.typography.body,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  rateDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  rateAmenities: {
    ...theme.typography.small,
    color: theme.colors.primary,
  },
  ratePrice: {
    alignItems: 'flex-end',
  },
  price: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  priceSubtext: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  noRatesContainer: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  noRatesText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  bookingSection: {
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  bookButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: theme.colors.textSecondary,
    opacity: 0.6,
  },
  bookButtonText: {
    color: theme.colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HotelDetailScreen; 