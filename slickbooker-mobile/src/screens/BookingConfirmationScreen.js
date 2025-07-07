import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { theme } from '../styles/theme';

const BookingConfirmationScreen = ({ route, navigation }) => {
  const { bookingDetails } = route.params;
  const { hotel, rate, searchParams, guestInfo, prebookId, bookingResponse } = bookingDetails;

  const handleBackToHome = () => {
    // Navigate back to home screen and reset the navigation stack
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Success Header */}
          <View style={styles.successHeader}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Booking Confirmed!</Text>
            <Text style={styles.successSubtitle}>
              Your reservation has been successfully processed
            </Text>
          </View>

          {/* Booking Details Card */}
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Booking Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Prebook ID:</Text>
              <Text style={styles.detailValue}>{prebookId}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Hotel:</Text>
              <Text style={styles.detailValue}>{hotel.name}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location:</Text>
              <Text style={styles.detailValue}>{hotel.address}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Check-in:</Text>
              <Text style={styles.detailValue}>{searchParams.checkIn}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Check-out:</Text>
              <Text style={styles.detailValue}>{searchParams.checkOut}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Guests:</Text>
              <Text style={styles.detailValue}>{searchParams.guests}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rate:</Text>
              <Text style={styles.detailValue}>
                {rate.currency || 'USD'} {parseFloat(rate.net || rate.amount || 0).toFixed(2)} per night
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Environment:</Text>
              <Text style={[styles.detailValue, styles.environmentText]}>
                {searchParams.environment.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Guest Information Card */}
          <View style={styles.detailsCard}>
            <Text style={styles.sectionTitle}>Guest Information</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Guest Name:</Text>
              <Text style={styles.detailValue}>{guestInfo.guestName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Email:</Text>
              <Text style={styles.detailValue}>{guestInfo.guestEmail}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Cardholder:</Text>
              <Text style={styles.detailValue}>{guestInfo.cardholderName}</Text>
            </View>

            {guestInfo.voucherCode && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Voucher Code:</Text>
                <Text style={styles.detailValue}>{guestInfo.voucherCode}</Text>
              </View>
            )}
          </View>

          {/* Transaction Information */}
          {bookingResponse && (
            <View style={styles.detailsCard}>
              <Text style={styles.sectionTitle}>Transaction Information</Text>
              
              {bookingResponse.bookingId && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Booking ID:</Text>
                  <Text style={styles.detailValue}>{bookingResponse.bookingId}</Text>
                </View>
              )}

              {bookingResponse.status && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Status:</Text>
                  <Text style={[styles.detailValue, styles.statusText]}>
                    {bookingResponse.status}
                  </Text>
                </View>
              )}

              {bookingResponse.confirmationNumber && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Confirmation #:</Text>
                  <Text style={styles.detailValue}>{bookingResponse.confirmationNumber}</Text>
                </View>
              )}
            </View>
          )}

          {/* Important Information */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Important Information</Text>
            <Text style={styles.infoText}>
              • A confirmation email has been sent to {guestInfo.guestEmail}
            </Text>
            <Text style={styles.infoText}>
              • Please save your Prebook ID: {prebookId}
            </Text>
            <Text style={styles.infoText}>
              • Present a valid ID at check-in
            </Text>
            <Text style={styles.infoText}>
              • Check-in time is usually 3:00 PM
            </Text>
            <Text style={styles.infoText}>
              • Check-out time is usually 11:00 AM
            </Text>
            {searchParams.environment === 'sandbox' && (
              <Text style={[styles.infoText, styles.sandboxWarning]}>
                ⚠️ This is a test booking in sandbox environment
              </Text>
            )}
          </View>

          {/* Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleBackToHome}
            >
              <Text style={styles.primaryButtonText}>Book Another Hotel</Text>
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
  content: {
    padding: theme.spacing.md,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  successIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  successTitle: {
    ...theme.typography.h1,
    color: theme.colors.success,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  successSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.medium,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    flex: 1,
    fontWeight: '500',
  },
  detailValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 2,
    textAlign: 'right',
    fontWeight: '600',
  },
  environmentText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  statusText: {
    color: theme.colors.success,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  infoCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: theme.borderRadius.large,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  infoTitle: {
    ...theme.typography.h3,
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  infoText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    lineHeight: 22,
  },
  sandboxWarning: {
    color: theme.colors.warning,
    fontWeight: 'bold',
    marginTop: theme.spacing.sm,
  },
  actionsContainer: {
    marginTop: theme.spacing.lg,
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.medium,
  },
  primaryButtonText: {
    color: theme.colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BookingConfirmationScreen; 