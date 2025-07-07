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

  const formatReviewDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const renderReviewCard = (review, index) => (
    <View key={review.id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewerInfo}>
          <Text style={styles.reviewerName}>{review.reviewerName}</Text>
          <Text style={styles.reviewerType}>{review.reviewerType} • {review.country}</Text>
        </View>
        <View style={styles.reviewRating}>
          <View style={styles.starsContainer}>
            {renderStars(review.rating)}
          </View>
          <Text style={styles.reviewDate}>{formatReviewDate(review.date)}</Text>
        </View>
      </View>
      
      {review.headline && (
        <Text style={styles.reviewHeadline}>{review.headline}</Text>
      )}
      
      {review.pros && (
        <Text style={styles.reviewText}>{review.pros}</Text>
      )}
      
      {review.cons && (
        <View style={styles.consSection}>
          <Text style={styles.consLabel}>Issues mentioned:</Text>
          <Text style={styles.consText}>{review.cons}</Text>
        </View>
      )}
      
      <Text style={styles.reviewSource}>Source: {review.source}</Text>
    </View>
  );

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
              {hotelReviews && hotelReviews.averageRating ? (
                <View style={styles.reviewsHeader}>
                  <View style={styles.starsRow}>
                    {renderStars(parseFloat(hotelReviews.averageRating))}
                    <Text style={styles.ratingNumber}>{hotelReviews.averageRating}</Text>
                  </View>
                  <Text style={styles.reviewCount}>
                    {hotelReviews.total} guest {hotelReviews.total === 1 ? 'review' : 'reviews'}
                  </Text>
                </View>
              ) : (
                <>
                  <Text style={styles.rating}>⭐ {hotel.rating || 'N/A'}</Text>
                  <Text style={styles.category}>{hotel.category || ''}</Text>
                </>
              )}
            </View>
            
            <Text style={styles.address}>{hotel.address}</Text>
          </View>

          {/* Enhanced Hotel Information */}
          {hotelDetails && (
            <>
              {/* Hotel Description */}
              {hotelDetails.description && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>About This Hotel</Text>
                  <Text style={styles.description}>{hotelDetails.description.replace(/<[^>]*>/g, '')}</Text>
                </View>
              )}

              {/* Hotel Images Gallery */}
              {hotelDetails.images && hotelDetails.images.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Hotel Gallery</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageGallery}>
                    {hotelDetails.images.map((image, index) => (
                      <Image
                        key={index}
                        source={{ uri: image.url || image.urlHd || image }}
                        style={styles.galleryImage}
                        resizeMode="cover"
                      />
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Hotel Facilities */}
              {hotelDetails.hotelFacilities && hotelDetails.hotelFacilities.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Hotel Facilities</Text>
                  <View style={styles.facilitiesGrid}>
                    {hotelDetails.hotelFacilities.map((facility, index) => (
                      <View key={index} style={styles.facilityItem}>
                        <Text style={styles.facilityText}>• {facility}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Check-in/Check-out Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Check-in & Check-out</Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Check-in:</Text>
                    <Text style={styles.infoValue}>{hotelDetails.checkinCheckoutTimes?.checkin || '3:00 PM'}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Check-out:</Text>
                    <Text style={styles.infoValue}>{hotelDetails.checkinCheckoutTimes?.checkout || '11:00 AM'}</Text>
                  </View>
                  {hotelDetails.checkinCheckoutTimes?.checkinStart && (
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Check-in starts:</Text>
                      <Text style={styles.infoValue}>{hotelDetails.checkinCheckoutTimes.checkinStart}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Hotel Information */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hotel Information</Text>
                <View style={styles.infoGrid}>
                  {hotelDetails.chain && hotelDetails.chain !== 'Not Available' && (
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Chain:</Text>
                      <Text style={styles.infoValue}>{hotelDetails.chain}</Text>
                    </View>
                  )}
                  {hotelDetails.starRating && (
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Star Rating:</Text>
                      <Text style={styles.infoValue}>{hotelDetails.starRating} stars</Text>
                    </View>
                  )}
                  {hotelDetails.hotelType && (
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Hotel Type:</Text>
                      <Text style={styles.infoValue}>{hotelDetails.hotelType}</Text>
                    </View>
                  )}
                  {hotelDetails.airportCode && (
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Nearest Airport:</Text>
                      <Text style={styles.infoValue}>{hotelDetails.airportCode}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Location Details */}
              {hotelDetails.location && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Location</Text>
                  <View style={styles.infoGrid}>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Address:</Text>
                      <Text style={styles.infoValue}>{hotelDetails.address}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>City:</Text>
                      <Text style={styles.infoValue}>{hotelDetails.city}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Country:</Text>
                      <Text style={styles.infoValue}>{hotelDetails.country}</Text>
                    </View>
                    <View style={styles.infoItem}>
                      <Text style={styles.infoLabel}>Coordinates:</Text>
                      <Text style={styles.infoValue}>
                        {hotelDetails.location.latitude}, {hotelDetails.location.longitude}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Hotel Policies */}
              {hotelDetails.policies && hotelDetails.policies.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Hotel Policies</Text>
                  {hotelDetails.policies.map((policy, index) => (
                    <View key={index} style={styles.policyItem}>
                      <Text style={styles.policyTitle}>{policy.name}</Text>
                      <Text style={styles.policyDescription}>{policy.description}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Room Types */}
              {hotelDetails.rooms && hotelDetails.rooms.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Room Types</Text>
                  {hotelDetails.rooms.map((room, index) => (
                    <View key={index} style={styles.roomCard}>
                      <Text style={styles.roomName}>{room.roomName}</Text>
                      <Text style={styles.roomDescription}>{room.description}</Text>
                      
                      <View style={styles.roomDetails}>
                        <View style={styles.roomInfo}>
                          <Text style={styles.roomInfoLabel}>Size:</Text>
                          <Text style={styles.roomInfoValue}>
                            {room.roomSizeSquare} {room.roomSizeUnit}
                          </Text>
                        </View>
                        <View style={styles.roomInfo}>
                          <Text style={styles.roomInfoLabel}>Max Occupancy:</Text>
                          <Text style={styles.roomInfoValue}>
                            {room.maxAdults} adults, {room.maxChildren} children
                          </Text>
                        </View>
                      </View>

                      {room.bedTypes && room.bedTypes.length > 0 && (
                        <View style={styles.bedTypes}>
                          <Text style={styles.bedTypesLabel}>Bed Configuration:</Text>
                          {room.bedTypes.map((bed, bedIndex) => (
                            <Text key={bedIndex} style={styles.bedType}>
                              {bed.quantity} x {bed.bedType} ({bed.bedSize})
                            </Text>
                          ))}
                        </View>
                      )}

                      {room.roomAmenities && room.roomAmenities.length > 0 && (
                        <View style={styles.roomAmenities}>
                          <Text style={styles.roomAmenitiesLabel}>Room Amenities:</Text>
                          <View style={styles.roomAmenitiesGrid}>
                            {room.roomAmenities.slice(0, 6).map((amenity, amenityIndex) => (
                              <Text key={amenityIndex} style={styles.roomAmenity}>
                                • {amenity.name}
                              </Text>
                            ))}
                            {room.roomAmenities.length > 6 && (
                              <Text style={styles.moreAmenities}>
                                +{room.roomAmenities.length - 6} more amenities
                              </Text>
                            )}
                          </View>
                        </View>
                      )}

                      {room.photos && room.photos.length > 0 && (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roomPhotos}>
                          {room.photos.map((photo, photoIndex) => (
                            <Image
                              key={photoIndex}
                              source={{ uri: photo.url || photo.hd_url }}
                              style={styles.roomPhoto}
                              resizeMode="cover"
                            />
                          ))}
                        </ScrollView>
                      )}
                    </View>
                  ))}
                </View>
              )}

              {/* Important Information */}
              {hotelDetails.importantInformation && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Important Information</Text>
                  <Text style={styles.importantInfo}>{hotelDetails.importantInformation}</Text>
                </View>
              )}

              {/* Contact Information */}
              {(hotelDetails.phone || hotelDetails.email || hotelDetails.fax) && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Contact Information</Text>
                  <View style={styles.infoGrid}>
                    {hotelDetails.phone && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Phone:</Text>
                        <Text style={styles.infoValue}>{hotelDetails.phone}</Text>
                      </View>
                    )}
                    {hotelDetails.email && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Email:</Text>
                        <Text style={styles.infoValue}>{hotelDetails.email}</Text>
                      </View>
                    )}
                    {hotelDetails.fax && (
                      <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Fax:</Text>
                        <Text style={styles.infoValue}>{hotelDetails.fax}</Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </>
          )}

          {/* Hotel Reviews Section */}
          {hotelReviews && hotelReviews.reviews && hotelReviews.reviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Guest Reviews</Text>
              
              {/* Reviews Summary */}
              <View style={styles.reviewsSummary}>
                <View style={styles.overallRating}>
                  <Text style={styles.overallRatingNumber}>{hotelReviews.averageRating}</Text>
                  <View style={styles.overallStars}>
                    {renderStars(parseFloat(hotelReviews.averageRating))}
                  </View>
                  <Text style={styles.totalReviews}>
                    Based on {hotelReviews.total} reviews
                  </Text>
                </View>
                
                {/* Rating Distribution */}
                <View style={styles.ratingDistribution}>
                  {[5, 4, 3, 2, 1].map(rating => (
                    <View key={rating} style={styles.ratingBar}>
                      <Text style={styles.ratingLabel}>{rating}★</Text>
                      <View style={styles.barContainer}>
                        <View 
                          style={[
                            styles.bar, 
                            { 
                              width: `${(hotelReviews.ratingDistribution[rating] / hotelReviews.total * 100)}%` 
                            }
                          ]} 
                        />
                      </View>
                      <Text style={styles.ratingCount}>
                        {hotelReviews.ratingDistribution[rating]}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Individual Reviews */}
              <View style={styles.reviewsList}>
                {hotelReviews.reviews.slice(0, 5).map(renderReviewCard)}
              </View>
              
              {hotelReviews.total > 5 && (
                <TouchableOpacity style={styles.viewMoreButton}>
                  <Text style={styles.viewMoreText}>
                    View all {hotelReviews.total} reviews
                  </Text>
                </TouchableOpacity>
              )}
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
  reviewsHeader: {
    alignItems: 'flex-start',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  reviewCount: {
    fontSize: 14,
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
    color: theme.colors.text,
    textAlign: 'justify',
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
  infoGrid: {
    marginTop: theme.spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  // Reviews styles
  reviewsSummary: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  overallRating: {
    flex: 1,
    alignItems: 'center',
    paddingRight: theme.spacing.md,
    borderRightWidth: 1,
    borderRightColor: theme.colors.border,
  },
  overallRatingNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  overallStars: {
    flexDirection: 'row',
    marginVertical: theme.spacing.xs,
  },
  totalReviews: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  ratingDistribution: {
    flex: 1,
    paddingLeft: theme.spacing.md,
  },
  ratingBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  ratingLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    width: 25,
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: theme.colors.lightGray,
    borderRadius: 4,
    marginHorizontal: theme.spacing.xs,
  },
  bar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  ratingCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    width: 20,
    textAlign: 'right',
  },
  reviewsList: {
    marginTop: theme.spacing.md,
  },
  reviewCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  reviewerType: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  reviewRating: {
    alignItems: 'flex-end',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  star: {
    fontSize: 14,
    color: theme.colors.primary,
    marginRight: 1,
  },
  emptyStar: {
    fontSize: 14,
    color: theme.colors.lightGray,
    marginRight: 1,
  },
  reviewDate: {
    fontSize: 10,
    color: theme.colors.textSecondary,
  },
  reviewHeadline: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  reviewText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  consSection: {
    marginBottom: theme.spacing.sm,
  },
  consLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  consText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  reviewSource: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  viewMoreButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.sm,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  viewMoreText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  // New styles for enhanced hotel details
  imageGallery: {
    marginTop: theme.spacing.sm,
  },
  galleryImage: {
    width: 200,
    height: 150,
    borderRadius: theme.borderRadius.medium,
    marginRight: theme.spacing.sm,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: theme.spacing.sm,
  },
  facilityItem: {
    width: '50%',
    paddingVertical: theme.spacing.xs,
  },
  facilityText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  policyItem: {
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.small,
    ...theme.shadows.small,
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  policyDescription: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  roomCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.medium,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  roomDescription: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  roomDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  roomInfo: {
    flex: 1,
  },
  roomInfoLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  roomInfoValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '600',
  },
  bedTypes: {
    marginBottom: theme.spacing.sm,
  },
  bedTypesLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  bedType: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  roomAmenities: {
    marginBottom: theme.spacing.sm,
  },
  roomAmenitiesLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: theme.spacing.xs,
  },
  roomAmenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  roomAmenity: {
    fontSize: 12,
    color: theme.colors.text,
    width: '50%',
    marginBottom: 2,
  },
  moreAmenities: {
    fontSize: 12,
    color: theme.colors.primary,
    fontStyle: 'italic',
  },
  roomPhotos: {
    marginTop: theme.spacing.sm,
  },
  roomPhoto: {
    width: 120,
    height: 90,
    borderRadius: theme.borderRadius.small,
    marginRight: theme.spacing.sm,
  },
  importantInfo: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    backgroundColor: '#fff3cd',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.medium,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
});

export default HotelDetailScreen; 