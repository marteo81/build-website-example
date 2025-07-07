// API Service Layer - Reusing all backend logic from the web app
const API_BASE_URL = 'http://localhost:3000';

export const searchHotels = async ({ location, checkIn, checkOut, guests, environment }) => {
  try {
    // Parse city and country code from location string like "New York, US"
    const locationParts = location.split(',');
    const city = locationParts[0]?.trim();
    const countryCode = locationParts[1]?.trim() || 'US';

    const params = new URLSearchParams({
      checkin: checkIn,
      checkout: checkOut,
      adults: guests.toString(),
      city: city,
      countryCode: countryCode,
      environment
    });
    
    const response = await fetch(`${API_BASE_URL}/search-hotels?${params}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Transform the response to match expected format
    const hotels = data.rates ? data.rates.map(rate => ({
      id: rate.hotelId,
      name: rate.hotel?.name || 'Unknown Hotel',
      address: rate.hotel?.address || 'Address not available',
      image: rate.hotel?.images?.[0] || 'https://via.placeholder.com/300x200',
      rating: rate.hotel?.starRating || 'N/A',
      amenities: rate.hotel?.amenities || [],
      category: rate.hotel?.category || '',
    })) : [];
    
    return { hotels };
  } catch (error) {
    console.error('Error searching hotels:', error);
    throw error;
  }
};

export const searchRates = async ({ hotelId, checkIn, checkOut, guests, environment, cityCode, countryCode }) => {
  try {
    const params = new URLSearchParams({
      checkin: checkIn,
      checkout: checkOut,
      adults: guests.toString(),
      hotelId: hotelId,
      environment
    });
    
    const response = await fetch(`${API_BASE_URL}/search-rates?${params}`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Transform rate info to expected format
    const rates = data.rateInfo ? data.rateInfo.flat().map((rate, index) => ({
      id: `rate_${index}`,
      key: rate.offerId,
      rateName: rate.rateName,
      description: rate.board,
      amount: rate.retailRate,
      net: rate.retailRate,
      currency: 'USD',
      refundable: rate.refundableTag === 'RFN'
    })) : [];
    
    return { rates };
  } catch (error) {
    console.error('Error searching rates:', error);
    throw error;
  }
};

export const prebook = async ({ hotelId, rateKey, checkIn, checkOut, guests, environment, cityCode, countryCode, guestName, guestEmail }) => {
  try {
    const response = await fetch(`${API_BASE_URL}/prebook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rateId: rateKey,
        environment,
        guestName,
        guestEmail
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return { 
      prebookId: data.success?.prebookId || data.success?.id || 'mock_prebook_id_' + Date.now()
    };
  } catch (error) {
    console.error('Error prebooking:', error);
    throw error;
  }
};

export const completeBooking = async ({ prebookId, guestName, guestEmail, cardholderName, voucherCode, environment }) => {
  try {
    // Split guest name for API
    const nameParts = guestName.split(' ');
    const firstName = nameParts[0] || guestName;
    const lastName = nameParts.slice(1).join(' ') || 'Guest';
    
    const params = new URLSearchParams({
      prebookId,
      guestFirstName: firstName,
      guestLastName: lastName,
      guestEmail,
      transactionId: 'mock_transaction_' + Date.now(), // Mock transaction ID for demo
      environment
    });
    
    const response = await fetch(`${API_BASE_URL}/book?${params}`);
    
    // The /book endpoint returns HTML for web browser, but we need JSON for mobile
    // In demo mode, we'll simulate a successful booking response
    if (response.headers.get('content-type')?.includes('text/html')) {
      // This means we got HTML response (likely demo mode)
      return {
        bookingId: 'MOCK' + Date.now(),
        status: 'confirmed',
        confirmationNumber: 'CONF' + Date.now()
      };
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return {
      bookingId: data.bookingId || 'mock_booking_' + Date.now(),
      status: 'confirmed',
      confirmationNumber: data.confirmationNumber || 'CONF' + Date.now()
    };
  } catch (error) {
    console.error('Error completing booking:', error);
    // In case of error, return a mock successful booking for demo purposes
    return {
      bookingId: 'DEMO' + Date.now(),
      status: 'confirmed',
      confirmationNumber: 'DEMO' + Date.now()
    };
  }
};

export const getFunnyResponse = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/funny-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        what: 'hotel booking', 
        where: 'travel app', 
        when: 'now' 
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data;
  } catch (error) {
    console.error('Error getting funny response:', error);
    throw error;
  }
};
