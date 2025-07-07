import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { theme } from '../styles/theme';

export default function BookingConfirmationScreen({ route, navigation }) {
  const { hotel, searchParams, guestInfo } = route.params;

  const handleNewSearch = () => {
    navigation.navigate('Home');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
        
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>Your reservation has been successfully processed</Text>
        
        <View style={styles.confirmationCard}>
          <Text style={styles.cardTitle}>Booking Details</Text>
          
                     <View style={styles.detailRow}>
             <Text style={styles.detailLabel}>Hotel:</Text>
             <Text style={styles.detailValue}>{hotel.name}</Text>
           </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Guest:</Text>
            <Text style={styles.detailValue}>{guestInfo.firstName} {guestInfo.lastName}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{guestInfo.email}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Check-in:</Text>
            <Text style={styles.detailValue}>{searchParams.checkin}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Check-out:</Text>
            <Text style={styles.detailValue}>{searchParams.checkout}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Guests:</Text>
            <Text style={styles.detailValue}>{searchParams.adults} adult(s)</Text>
          </View>
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Important Information</Text>
          <Text style={styles.infoText}>
            • A confirmation email has been sent to {guestInfo.email}
          </Text>
          <Text style={styles.infoText}>
            • Please bring a valid ID for check-in
          </Text>
          <Text style={styles.infoText}>
            • Check-in time is usually 3:00 PM
          </Text>
          <Text style={styles.infoText}>
            • Check-out time is usually 11:00 AM
          </Text>
        </View>
        
        <TouchableOpacity style={styles.newSearchButton} onPress={handleNewSearch}>
          <Text style={styles.buttonText}>Search for Another Hotel</Text>
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
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  checkmark: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.success,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  confirmationCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.medium,
    width: '100%',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  cardTitle: {
    ...theme.typography.h2,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  detailLabel: {
    ...theme.typography.body,
    fontWeight: 'bold',
  },
  detailValue: {
    ...theme.typography.body,
    textAlign: 'right',
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    width: '100%',
    marginBottom: theme.spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.warning,
    ...theme.shadows.small,
  },
  infoTitle: {
    ...theme.typography.h3,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    ...theme.typography.body,
    marginBottom: theme.spacing.xs,
  },
  newSearchButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    alignItems: 'center',
    width: '100%',
    ...theme.shadows.medium,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 