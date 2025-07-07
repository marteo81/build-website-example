// API Service Layer - Reusing all backend logic from the web app
const API_BASE_URL = 'http://172.20.10.5:3000';

class ApiService {
  async searchHotels({ checkin, checkout, adults, city, countryCode, environment }) {
    try {
      const params = new URLSearchParams({
        checkin,
        checkout,
        adults,
        city,
        countryCode,
        environment
      });
      
      const response = await fetch(`${API_BASE_URL}/search-hotels?${params}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching hotels:', error);
      throw error;
    }
  }

  async searchRates({ checkin, checkout, adults, hotelId, environment }) {
    try {
      const params = new URLSearchParams({
        checkin,
        checkout,
        adults,
        hotelId,
        environment
      });
      
      const response = await fetch(`${API_BASE_URL}/search-rates?${params}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error searching rates:', error);
      throw error;
    }
  }

  async prebook({ rateId, environment, voucherCode }) {
    try {
      const bodyData = {
        rateId,
        environment
      };

      if (voucherCode) {
        bodyData.voucherCode = voucherCode;
      }

      const response = await fetch(`${API_BASE_URL}/prebook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error with prebook:', error);
      throw error;
    }
  }

  async getFunnyResponse({ what, where, when }) {
    try {
      const response = await fetch(`${API_BASE_URL}/funny-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ what, where, when }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting funny response:', error);
      throw error;
    }
  }

  async completeBooking({ prebookId, guestFirstName, guestLastName, guestEmail, transactionId, environment }) {
    try {
      const params = new URLSearchParams({
        prebookId,
        guestFirstName,
        guestLastName,
        guestEmail,
        transactionId,
        environment
      });
      
      const response = await fetch(`${API_BASE_URL}/book?${params}`);
      const data = await response.text(); // Returns HTML confirmation
      return data;
    } catch (error) {
      console.error('Error completing booking:', error);
      throw error;
    }
  }
}

export default new ApiService(); 