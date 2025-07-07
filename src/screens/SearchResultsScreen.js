import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { theme } from '../styles/theme';
import ApiService from '../services/api';

export default function SearchResultsScreen({ route, navigation }) {
  const { searchParams } = route.params;
  const [hotels, setHotels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    searchHotels();
  }, []);

  const searchHotels = async () => {
    try {
      const response = await ApiService.searchHotels(searchParams);
      if (response.rates && response.rates.length > 0) {
        // Process rates exactly like the web app
        const processedHotels = response.rates.map(rate => {
          // Find minimum rate (same logic as web app)
          const minRate = rate.roomTypes.reduce((min, current) => {
            const minAmount = min.rates[0].retailRate.total[0].amount;
            const currentAmount = current.rates[0].retailRate.total[0].amount;
            return minAmount < currentAmount ? min : current;
          });
          
          return {
            ...rate,
            minRate,
            hotel: rate.hotel,
            price: minRate.rates[0].retailRate.total[0].amount,
            currency: minRate.rates[0].retailRate.total[0].currency
          };
        });
        
        setHotels(processedHotels);
      } else {
        Alert.alert('No Results', 'No hotels found for your search criteria');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search hotels. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHotelPress = (rate) => {
    navigation.navigate('HotelDetail', { 
      rate, 
      hotel: rate.hotel,
      minRate: rate.minRate,
      searchParams 
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Searching hotels...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {hotels.length} hotels found in {searchParams.city}
        </Text>
        <Text style={styles.subtitle}>
          {searchParams.checkin} - {searchParams.checkout} • {searchParams.adults} adult(s)
        </Text>
      </View>

      {hotels.map((rate, index) => {
        const hotel = rate.hotel;
        const address = hotel.address || "Address not available";
        const distance = hotel.distanceFromCenter ? `${hotel.distanceFromCenter} m from centre` : "Distance unknown";
        const rating = hotel.rating || "8.5";
        const reviews = hotel.reviews || "1000";
        const cancellation = rate.minRate.rates[0].cancellationPolicies.refundableTag === "NRFN" ? "Non refundable" : "Free cancellation";
        const boardName = rate.minRate.rates[0].boardName || "Room Only";
        
        return (
          <TouchableOpacity
            key={index}
            style={styles.hotelCard}
            onPress={() => handleHotelPress(rate)}
          >
            <View style={styles.hotelInfo}>
              <Text style={styles.hotelName}>{hotel.name}</Text>
              <Text style={styles.hotelLocation}>{address}</Text>
              <Text style={styles.hotelDistance}>{distance}</Text>
              <Text style={styles.hotelBoard}>{boardName} • {cancellation}</Text>
              <Text style={styles.hotelRating}>
                ⭐ {rating} • {reviews} reviews
              </Text>
            </View>
            <View style={styles.priceInfo}>
              <Text style={styles.price}>{rate.currency} {rate.price}</Text>
              <Text style={styles.priceSubtext}>per night</Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    ...theme.typography.body,
  },
  header: {
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h2,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.caption,
  },
  hotelCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...theme.shadows.small,
  },
  hotelInfo: {
    flex: 1,
  },
  hotelName: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.sm,
  },
  hotelLocation: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.xs,
  },
  hotelDistance: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.xs,
  },
  hotelBoard: {
    ...theme.typography.caption,
    marginBottom: theme.spacing.xs,
  },
  hotelRating: {
    ...theme.typography.caption,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  price: {
    ...theme.typography.h3,
    color: theme.colors.primary,
  },
  priceSubtext: {
    ...theme.typography.caption,
  },
}); 