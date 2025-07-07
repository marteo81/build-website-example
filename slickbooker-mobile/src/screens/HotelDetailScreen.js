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
import { getHotelDetails, getHotelReviews } from '../services/api';

const HotelDetailScreen = ({ route, navigation }) => {
  const { hotel, searchParams, rates } = route.params;
  const [selectedRate, setSelectedRate] = useState(null);
  const [hotelDetails, setHotelDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [hotelReviews, setHotelReviews] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = ['Overview', 'Facilities', 'Rooms', 'Reviews'];

  useEffect(() => {
    if (rates && rates.length > 0) {
      setSelectedRate(rates[0]);
    }
    
    // Fetch detailed hotel information and reviews
    fetchHotelDetails();
    fetchHotelReviews();
  }, []);

  const fetchHotelDetails = async () => {
    try {
      setLoadingDetails(true);
      const details = await getHotelDetails({
        hotelId: hotel.id,
        environment: searchParams.environment
      });
      setHotelDetails(details);
    } catch (error) {
      console.error('Error fetching hotel details:', error);
      // Continue without detailed info
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchHotelReviews = async () => {
    try {
      setLoadingReviews(true);
      const reviews = await getHotelReviews({
        hotelId: hotel.id,
        environment: searchParams.environment,
        limit: 10
      });
      setHotelReviews(reviews);
    } catch (error) {
      console.error('Error fetching hotel reviews:', error);
      // Continue without reviews
    } finally {
      setLoadingReviews(false);
    }
  };

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

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Text key={i} style={styles.star}>★</Text>);
    }
    
    if (hasHalfStar) {
      stars.push(<Text key="half" style={styles.star}>☆</Text>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Text key={`empty-${i}`} style={styles.emptyStar}>☆</Text>);
    }
    
    return stars;
  };

  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi') || amenityLower.includes('internet')) return '📶';
    if (amenityLower.includes('pool') || amenityLower.includes('swimming')) return '🏊';
    if (amenityLower.includes('spa') || amenityLower.includes('massage')) return '🧖';
    if (amenityLower.includes('gym') || amenityLower.includes('fitness')) return '💪';
    if (amenityLower.includes('restaurant') || amenityLower.includes('dining')) return '🍽️';
    if (amenityLower.includes('bar') || amenityLower.includes('lounge')) return '🍷';
    if (amenityLower.includes('parking') || amenityLower.includes('garage')) return '🚗';
    if (amenityLower.includes('ac') || amenityLower.includes('air conditioning')) return '❄️';
    return '✨';
  };

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.overviewDescription}>
        {hotelDetails?.description?.replace(/<[^>]*>/g, '') || 
         'Experience luxury in the heart of San Diego with stunning bay views, world-class dining, and premium amenities. Just steps away from the Gaslamp Quarter and Convention Center.'}
      </Text>
      
      <Text style={styles.sectionTitle}>Amenities</Text>
      <View style={styles.amenitiesGrid}>
        {(hotelDetails?.hotelFacilities || ['Wifi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Ac', 'Parking']).slice(0, 8).map((amenity, index) => (
          <View key={index} style={styles.amenityItem}>
            <Text style={styles.amenityIcon}>{getAmenityIcon(amenity)}</Text>
            <Text style={styles.amenityText}>{amenity}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderFacilitiesTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.facilitiesDescription}>
        This hotel offers a range of facilities to enhance your stay.
      </Text>
      
      <View style={styles.facilitiesGrid}>
        {(hotelDetails?.hotelFacilities || ['Wifi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Ac', 'Parking']).map((facility, index) => (
          <View key={index} style={styles.facilityItem}>
            <Text style={styles.facilityIcon}>{getAmenityIcon(facility)}</Text>
            <Text style={styles.facilityText}>{facility}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderRoomsTab = () => (
    <View style={styles.tabContent}>
      {hotelDetails?.rooms && hotelDetails.rooms.length > 0 ? (
        hotelDetails.rooms.map((room, index) => (
          <View key={index} style={styles.roomCard}>
            {room.photos && room.photos.length > 0 && (
              <Image
                source={{ uri: room.photos[0].url || room.photos[0].hd_url }}
                style={styles.roomImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.roomContent}>
              <Text style={styles.roomName}>{room.roomName}</Text>
              <Text style={styles.roomPrice}>$199/night</Text>
              
              <View style={styles.roomAmenities}>
                <View style={styles.roomAmenityItem}>
                  <Text style={styles.amenityIcon}>📶</Text>
                  <Text style={styles.roomAmenityText}>Free WiFi</Text>
                </View>
                <View style={styles.roomAmenityItem}>
                  <Text style={styles.amenityIcon}>🍽️</Text>
                  <Text style={styles.roomAmenityText}>Breakfast included</Text>
                </View>
              </View>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.roomCard}>
          <Image
            source={{ uri: hotel.image || 'https://via.placeholder.com/300x200' }}
            style={styles.roomImage}
            resizeMode="cover"
          />
          <View style={styles.roomContent}>
            <Text style={styles.roomName}>Deluxe King Room</Text>
            <Text style={styles.roomPrice}>$199/night</Text>
            
            <View style={styles.roomAmenities}>
              <View style={styles.roomAmenityItem}>
                <Text style={styles.amenityIcon}>📶</Text>
                <Text style={styles.roomAmenityText}>Free WiFi</Text>
              </View>
              <View style={styles.roomAmenityItem}>
                <Text style={styles.amenityIcon}>🍽️</Text>
                <Text style={styles.roomAmenityText}>Breakfast included</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const renderReviewsTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.reviewsDescription}>
        This hotel has {hotelReviews?.total || 1243} reviews with an average rating of {hotelReviews?.averageRating || '4.7'}.
      </Text>
      
      <View style={styles.reviewsHeader}>
        <View style={styles.ratingCircle}>
          <Text style={styles.ratingNumber}>{hotelReviews?.averageRating || '4.7'}</Text>
        </View>
        <View style={styles.ratingDetails}>
          <View style={styles.starsRow}>
            {renderStars(parseFloat(hotelReviews?.averageRating || 4.7))}
          </View>
          <Text style={styles.reviewCount}>({hotelReviews?.total || 1243} reviews)</Text>
        </View>
      </View>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Overview':
        return renderOverviewTab();
      case 'Facilities':
        return renderFacilitiesTab();
      case 'Rooms':
        return renderRoomsTab();
      case 'Reviews':
        return renderReviewsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <Image
          source={{ uri: hotel.image || hotelDetails?.mainPhoto || 'https://via.placeholder.com/400x300' }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* Hotel Header */}
        <View style={styles.hotelHeader}>
          <Text style={styles.hotelName}>{hotel.name}</Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.location}>{hotel.address || hotelDetails?.address}</Text>
          </View>
          
          <View style={styles.ratingRow}>
            <Text style={styles.ratingNumber}>{hotelReviews?.averageRating || hotel.rating || '4.7'}</Text>
            <Text style={styles.ratingLabel}>Excellent</Text>
            <Text style={styles.reviewsCount}>({hotelReviews?.total || '1243 reviews'})</Text>
          </View>
          
          <View style={styles.starsContainer}>
            {renderStars(parseFloat(hotelReviews?.averageRating || hotel.rating || 4.7))}
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Bottom Price and Book Button */}
        <View style={styles.bottomSection}>
          <View style={styles.priceSection}>
            <Text style={styles.priceLabel}>Price per night</Text>
            <Text style={styles.price}>
              ${selectedRate ? parseFloat(selectedRate.net || selectedRate.amount || 199).toFixed(0) : '199'}
            </Text>
          </View>
          
          <TouchableOpacity
            style={styles.selectRoomButton}
            onPress={handleBookNow}
          >
            <Text style={styles.selectRoomText}>Select Room</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  heroImage: {
    width: '100%',
    height: 250,
  },
  hotelHeader: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  hotelName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  location: {
    fontSize: 16,
    color: '#666666',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ratingNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginRight: 8,
  },
  ratingLabel: {
    fontSize: 16,
    color: '#1A1A1A',
    marginRight: 8,
  },
  reviewsCount: {
    fontSize: 16,
    color: '#666666',
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  star: {
    fontSize: 16,
    color: '#FFD700',
    marginRight: 2,
  },
  emptyStar: {
    fontSize: 16,
    color: '#E0E0E0',
    marginRight: 2,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4A90E2',
  },
  tabText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  tabContent: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    minHeight: 400,
  },
  overviewDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1A1A1A',
    marginBottom: 24,
  },
  facilitiesDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1A1A1A',
    marginBottom: 24,
  },
  reviewsDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1A1A1A',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amenityItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  amenityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  amenityText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  facilityItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  facilityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  facilityText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  roomCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roomImage: {
    width: '100%',
    height: 200,
  },
  roomContent: {
    padding: 16,
  },
  roomName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  roomPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 12,
  },
  roomAmenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roomAmenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 8,
  },
  roomAmenityText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  ratingNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  ratingDetails: {
    flex: 1,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  reviewCount: {
    fontSize: 16,
    color: '#666666',
  },
  bottomSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  priceSection: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  selectRoomButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  selectRoomText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default HotelDetailScreen; 