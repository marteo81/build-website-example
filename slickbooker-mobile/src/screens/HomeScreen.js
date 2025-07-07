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
  Modal,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Calendar } from 'react-native-calendars';
import { theme } from '../styles/theme';
import { searchHotels, getFunnyResponse } from '../services/api';

const HomeScreen = ({ navigation }) => {
  const [location, setLocation] = useState('');
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(new Date());
  const [guests, setGuests] = useState('2');
  const [environment, setEnvironment] = useState('sandbox');
  const [funnyResponse, setFunnyResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCheckInCalendar, setShowCheckInCalendar] = useState(false);
  const [showCheckOutCalendar, setShowCheckOutCalendar] = useState(false);

  useEffect(() => {
    // Set default dates to 3 months from now
    const now = new Date();
    const threeMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());
    const fourMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate() + 3);
    
    setCheckInDate(threeMonthsLater);
    setCheckOutDate(fourMonthsLater);
  }, []);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCheckInDateSelect = (day) => {
    const selectedDate = new Date(day.dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      Alert.alert('Invalid Date', 'Check-in date cannot be in the past');
      return;
    }
    
    setCheckInDate(selectedDate);
    setShowCheckInCalendar(false);
    
    // If check-out is before or same as new check-in, update check-out to next day
    if (checkOutDate <= selectedDate) {
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      setCheckOutDate(nextDay);
    }
  };

  const handleCheckOutDateSelect = (day) => {
    const selectedDate = new Date(day.dateString);
    
    // Ensure check-out is after check-in
    if (selectedDate > checkInDate) {
      setCheckOutDate(selectedDate);
      setShowCheckOutCalendar(false);
    } else {
      Alert.alert('Invalid Date', 'Check-out date must be after check-in date');
    }
  };

  const getMarkedDates = (isCheckOut = false) => {
    const today = formatDate(new Date());
    const checkIn = formatDate(checkInDate);
    const checkOut = formatDate(checkOutDate);
    
    let marked = {};
    
    // Mark past dates as disabled
    const currentDate = new Date();
    for (let i = 1; i <= 30; i++) {
      const pastDate = new Date(currentDate);
      pastDate.setDate(pastDate.getDate() - i);
      const pastDateString = formatDate(pastDate);
      marked[pastDateString] = { disabled: true, disableTouchEvent: true };
    }
    
    if (isCheckOut) {
      // For check-out calendar, disable dates before check-in
      const checkInDateObj = new Date(checkInDate);
      for (let i = 0; i <= 365; i++) {
        const beforeCheckIn = new Date(checkInDateObj);
        beforeCheckIn.setDate(beforeCheckIn.getDate() - i);
        if (beforeCheckIn < new Date()) break;
        const beforeCheckInString = formatDate(beforeCheckIn);
        marked[beforeCheckInString] = { disabled: true, disableTouchEvent: true };
      }
      
      // Mark check-out date
      marked[checkOut] = {
        selected: true,
        selectedColor: theme.colors.primary,
        selectedTextColor: '#FFFFFF'
      };
    } else {
      // Mark check-in date
      marked[checkIn] = {
        selected: true,
        selectedColor: theme.colors.primary,
        selectedTextColor: '#FFFFFF'
      };
    }
    
    return marked;
  };

  const renderCalendarModal = (visible, onClose, onSelect, title, isCheckOut = false) => (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <Text style={styles.calendarTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <Calendar
            onDayPress={onSelect}
            markedDates={getMarkedDates(isCheckOut)}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: theme.colors.primary,
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: theme.colors.primary,
              dayTextColor: '#2d4150',
              textDisabledColor: '#d9e1e8',
              dotColor: theme.colors.primary,
              selectedDotColor: '#ffffff',
              arrowColor: theme.colors.primary,
              disabledArrowColor: '#d9e1e8',
              monthTextColor: theme.colors.primary,
              indicatorColor: theme.colors.primary,
              textDayFontFamily: 'System',
              textMonthFontFamily: 'System',
              textDayHeaderFontFamily: 'System',
              textDayFontWeight: '400',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14
            }}
            minDate={isCheckOut ? formatDate(new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000)) : formatDate(new Date())}
            maxDate={formatDate(new Date(new Date().getFullYear() + 2, 11, 31))}
          />
          
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const handleSearch = async () => {
    if (!location) {
      Alert.alert('Error', 'Please enter a location');
      return;
    }

    setLoading(true);
    try {
      const response = await searchHotels({
        location,
        checkIn: formatDate(checkInDate),
        checkOut: formatDate(checkOutDate),
        guests: parseInt(guests),
        environment,
      });

      if (response.hotels && response.hotels.length > 0) {
        navigation.navigate('SearchResults', {
          hotels: response.hotels,
          searchParams: { 
            location, 
            checkIn: formatDate(checkInDate), 
            checkOut: formatDate(checkOutDate), 
            guests, 
            environment 
          },
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
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowCheckInCalendar(true)}>
                <Text style={styles.dateButtonText}>
                  {formatDisplayDate(checkInDate)}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.label}>Check-out</Text>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowCheckOutCalendar(true)}>
                <Text style={styles.dateButtonText}>
                  {formatDisplayDate(checkOutDate)}
                </Text>
              </TouchableOpacity>
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

      {showCheckInCalendar && (
        renderCalendarModal(true, () => setShowCheckInCalendar(false), handleCheckInDateSelect, 'Select Check-in Date', false)
      )}

      {showCheckOutCalendar && (
        renderCalendarModal(true, () => setShowCheckOutCalendar(false), handleCheckOutDateSelect, 'Select Check-out Date', true)
      )}
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
  dateButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.medium,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    height: 50,
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 16,
    color: theme.colors.text,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
     calendarContainer: {
     backgroundColor: theme.colors.surface,
     borderRadius: theme.borderRadius.large,
     padding: theme.spacing.lg,
     margin: theme.spacing.lg,
     width: '90%',
     maxHeight: '80%',
     ...theme.shadows.large,
     elevation: 10,
   },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  calendarTitle: {
    ...theme.typography.h2,
    color: theme.colors.primary,
  },
     closeButton: {
     padding: theme.spacing.sm,
     borderRadius: 20,
     backgroundColor: theme.colors.background,
     width: 40,
     height: 40,
     justifyContent: 'center',
     alignItems: 'center',
   },
   closeButtonText: {
     fontSize: 18,
     fontWeight: 'bold',
     color: theme.colors.textSecondary,
   },
  cancelButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  cancelButtonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen; 