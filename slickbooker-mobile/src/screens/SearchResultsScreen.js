import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  SafeAreaView,
} from 'react-native';
import { theme } from '../styles/theme';
import { searchRates } from '../services/api';

const SearchResultsScreen = ({ route, navigation }) => {
  const { hotels, searchParams } = route.params;
  const [hotelsWithRates, setHotelsWithRates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatesForHotels();
  }, []);

  const fetchRatesForHotels = async () => {
    try {
      const hotelsWithRatesData = await Promise.all(
        hotels.map(async (hotel) => {
          try {
            // Parse city and country code from location
            const locationParts = searchParams.location.split(',');
            const cityCode = locationParts[0]?.trim();
            const countryCode = locationParts[1]?.trim() || 'US';

            const ratesResponse = await searchRates({
              hotelId: hotel.id,
              checkIn: searchParams.checkIn,
              checkOut: searchParams.checkOut,
              guests: searchParams.guests,
              environment: searchParams.environment,
              cityCode,
              countryCode,
            });

            let minRate = null;
            if (ratesResponse.rates && ratesResponse.rates.length > 0) {
              const rates = ratesResponse.rates.map(rate => parseFloat(rate.net || rate.amount || 0));
              minRate = Math.min(...rates);
            }

            return {
              ...hotel,
              rates: ratesResponse.rates || [],
              minRate,
              currency: ratesResponse.rates?.[0]?.currency || 'USD',
            };
          } catch (error) {
            console.log(`Error fetching rates for hotel ${hotel.id}:`, error.message);
            return {
              ...hotel,
              rates: [],
              minRate: null,
              currency: 'USD',
            };
          }
        })
      );

      setHotelsWithRates(hotelsWithRatesData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch hotel rates');
    } finally {
      setLoading(false);
    }
  };

  const renderHotel = ({ item: hotel }) => (
    <TouchableOpacity
      style={styles.hotelCard}
      onPress={() => navigation.navigate('HotelDetail', { 
        hotel, 
        searchParams,
        rates: hotel.rates 
      })}
    >
      <Image
        source={{ uri: hotel.image || 'https://via.placeholder.com/300x200' }}
        style={styles.hotelImage}
        resizeMode="cover"
      />
      
      <View style={styles.hotelInfo}>
        <Text style={styles.hotelName}>{hotel.name}</Text>
        
        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>⭐ {hotel.rating || 'N/A'}</Text>
          <Text style={styles.category}>{hotel.category || ''}</Text>
        </View>
        
        <Text style={styles.location}>{hotel.address}</Text>
        
        {hotel.amenities && hotel.amenities.length > 0 && (
          <View style={styles.amenitiesContainer}>
            {hotel.amenities.slice(0, 3).map((amenity, index) => (
              <Text key={index} style={styles.amenity}>
                • {amenity}
              </Text>
            ))}
          </View>
        )}
        
        <View style={styles.priceContainer}>
          {hotel.minRate ? (
            <>
              <Text style={styles.priceLabel}>From</Text>
              <Text style={styles.price}>
                {hotel.currency} {hotel.minRate.toFixed(2)}
              </Text>
              <Text style={styles.priceSubtext}>per night</Text>
            </>
          ) : (
            <Text style={styles.noRates}>Rates not available</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading hotel rates...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={hotelsWithRates}
        renderItem={renderHotel}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

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
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  hotelCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.medium,
  },
  hotelImage: {
    width: '100%',
    height: 200,
  },
  hotelInfo: {
    padding: theme.spacing.md,
  },
  hotelName: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  rating: {
    ...theme.typography.caption,
    fontWeight: '600',
    marginRight: theme.spacing.sm,
  },
  category: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },
  location: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  amenitiesContainer: {
    marginBottom: theme.spacing.md,
  },
  amenity: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'flex-end',
  },
  priceLabel: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.xs,
  },
  price: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginRight: theme.spacing.xs,
  },
  priceSubtext: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  noRates: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default SearchResultsScreen; 