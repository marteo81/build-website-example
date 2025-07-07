import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../styles/theme';

export default function HotelDetailScreen({ route, navigation }) {
  const { rate, hotel, minRate, searchParams } = route.params;

  const handleBookNow = () => {
    navigation.navigate('Booking', { 
      rate,
      hotel, 
      minRate,
      offerId: minRate.offerId,
      searchParams 
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {hotel.name}
        </Text>
        
        <View style={styles.infoCard}>
          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>{hotel.address || searchParams.city}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Price:</Text>
          <Text style={styles.value}>{rate.currency} {rate.price} per night</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Check-in:</Text>
          <Text style={styles.value}>{searchParams.checkin}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Check-out:</Text>
          <Text style={styles.value}>{searchParams.checkout}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.label}>Guests:</Text>
          <Text style={styles.value}>{searchParams.adults} adult(s)</Text>
        </View>

        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Book Now</Text>
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
  content: {
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  label: {
    ...theme.typography.body,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  value: {
    ...theme.typography.body,
  },
  bookButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 