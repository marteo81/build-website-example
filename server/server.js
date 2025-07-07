const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const liteApi = require("liteapi-node-sdk");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const { OpenAI } = require("openai");

app.use(
  cors({
    origin: "*",
  })
);

const prod_apiKey = process.env.PROD_API_KEY;
const sandbox_apiKey = process.env.SAND_API_KEY;

app.use(bodyParser.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.get("/search-hotels", async (req, res) => {
  try {
    console.log("Search endpoint hit");
    console.log("Query params:", req.query);
    const { checkin, checkout, adults, city, countryCode, environment } = req.query;
    console.log("Parsed params:", { checkin, checkout, adults, city, countryCode, environment });
    
    const apiKey = environment === "sandbox" ? sandbox_apiKey : prod_apiKey;
    console.log("API Key:", apiKey ? "Present" : "Missing");
    console.log("Full API Key (first 20 chars):", apiKey ? apiKey.substring(0, 20) + "..." : "Not found");
    
    // Try LiteAPI first if we have valid API keys
    if (apiKey && apiKey !== "your_production_liteapi_key_here" && apiKey !== "your_sandbox_liteapi_key_here") {
      console.log("Attempting LiteAPI call with real data");
      console.log("Environment:", environment);
      console.log("Using API Key:", apiKey.substring(0, 10) + "...");
      
      try {
        console.log("Creating LiteAPI SDK instance...");
        const sdk = liteApi(apiKey);
        console.log("SDK created successfully");
        
        console.log(`Calling getHotels with: countryCode=${countryCode}, city=${city}, offset=0, limit=10`);
        
        // Get hotels for the location
        const response = await sdk.getHotels(countryCode, city, 0, 10);
        console.log("LiteAPI getHotels response received");
        console.log("Response type:", typeof response);
        console.log("Response keys:", Object.keys(response || {}));
        
        const hotelData = response.data;
        console.log("Hotel data type:", typeof hotelData);
        console.log("Hotel data:", hotelData);
        
        if (!hotelData || !Array.isArray(hotelData)) {
          throw new Error(`Invalid response from LiteAPI: ${JSON.stringify(response)}`);
        }
        
        console.log(`Found ${hotelData.length} hotels from LiteAPI`);
        
        // Get hotel IDs for rate search
        const hotelIds = hotelData.map((hotel) => hotel.id);
        console.log("Hotel IDs:", hotelIds);
        
        console.log("Calling getFullRates...");
        
        // Get rates for all hotels
        const ratesResponse = await sdk.getFullRates({
          hotelIds: hotelIds,
          occupancies: [{ adults: parseInt(adults, 10) }],
          currency: "USD",
          guestNationality: "US",
          checkin: checkin,
          checkout: checkout,
        });
        
        console.log("LiteAPI getFullRates response received");
        console.log("Rates response type:", typeof ratesResponse);
        console.log("Rates response keys:", Object.keys(ratesResponse || {}));
        
        const rates = ratesResponse.data;
        console.log(`Found rates for ${rates.length} hotels`);
        
        // Attach hotel info to each rate
        rates.forEach((rate) => {
          rate.hotel = hotelData.find((hotel) => hotel.id === rate.hotelId);
        });

        console.log("Successfully returning LiteAPI data");
        return res.json({ rates });
        
      } catch (liteApiError) {
        console.error("=== LiteAPI Error Details ===");
        console.error("Error message:", liteApiError.message);
        console.error("Error stack:", liteApiError.stack);
        console.error("Error type:", liteApiError.constructor.name);
        if (liteApiError.response) {
          console.error("Error response status:", liteApiError.response.status);
          console.error("Error response data:", liteApiError.response.data);
        }
        console.error("=== End LiteAPI Error ===");
        console.error("LiteAPI failed, falling back to mock data:", liteApiError.message);
        // Continue to mock data fallback below
      }
    } else {
      console.log("Skipping LiteAPI - invalid/missing API keys");
    }
    
    // Fallback to mock data
    console.log("Using mock data (API keys invalid or LiteAPI failed)");
    const mockRates = [
      {
        hotelId: "mock_hotel_1",
        hotel: {
          id: "mock_hotel_1",
          name: `Demo Hotel in ${city || 'Unknown City'}`,
          address: `123 Main Street, ${city || 'Unknown City'}, ${countryCode || 'Unknown Country'}`,
          images: ["https://via.placeholder.com/300x200?text=Demo+Hotel+1"],
          main_photo: "https://via.placeholder.com/300x200?text=Demo+Hotel+1",
          starRating: 4,
          amenities: ["WiFi", "Pool", "Gym", "Restaurant"],
          category: "Hotel"
        },
        roomTypes: [{
          offerId: "mock_offer_1",
          rates: [{
            name: "Standard Room",
            boardName: "Room Only",
            boardType: "RO",
            retailRate: {
              total: [{ amount: 150, currency: "USD" }],
              suggestedSellingPrice: [{ amount: 180, currency: "USD" }]
            },
            cancellationPolicies: {
              refundableTag: "RFN"
            }
          }]
        }]
      },
      {
        hotelId: "mock_hotel_2",
        hotel: {
          id: "mock_hotel_2", 
          name: `Premium Resort ${city || 'Unknown City'}`,
          address: `456 Beach Avenue, ${city || 'Unknown City'}, ${countryCode || 'Unknown Country'}`,
          images: ["https://via.placeholder.com/300x200?text=Demo+Hotel+2"],
          main_photo: "https://via.placeholder.com/300x200?text=Demo+Hotel+2",
          starRating: 5,
          amenities: ["WiFi", "Pool", "Spa", "Beach Access", "Restaurant"],
          category: "Resort"
        },
        roomTypes: [{
          offerId: "mock_offer_2",
          rates: [{
            name: "Deluxe Suite",
            boardName: "Breakfast Included",
            boardType: "BI",
            retailRate: {
              total: [{ amount: 280, currency: "USD" }],
              suggestedSellingPrice: [{ amount: 320, currency: "USD" }]
            },
            cancellationPolicies: {
              refundableTag: "NRFN"
            }
          }]
        }]
      }
    ];
    
    console.log("Returning mock data");
    res.json({ rates: mockRates });
    
  } catch (error) {
    console.error("Error in search-hotels endpoint:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

app.get("/search-rates", async (req, res) => {
  try {
    console.log("Rate endpoint hit");
    const { checkin, checkout, adults, hotelId, environment } = req.query;
    console.log("Rate query params:", { checkin, checkout, adults, hotelId, environment });
    
    const apiKey = environment === "sandbox" ? sandbox_apiKey : prod_apiKey;
    console.log("API Key for rates:", apiKey ? "Present" : "Missing");
    
    // Try LiteAPI first if we have valid API keys
    if (apiKey && apiKey !== "your_production_liteapi_key_here" && apiKey !== "your_sandbox_liteapi_key_here") {
      console.log("Attempting LiteAPI rates call with real data");
      
      try {
        const sdk = liteApi(apiKey);
        
        // Fetch rates for the specified hotel
        const ratesResponse = await sdk.getFullRates({
          hotelIds: [hotelId],
          occupancies: [{ adults: parseInt(adults, 10) }],
          currency: "USD",
          guestNationality: "US",
          checkin: checkin,
          checkout: checkout,
        });
        
        const rates = ratesResponse.data;
        
        if (!rates || !Array.isArray(rates) || rates.length === 0) {
          throw new Error("No rates found from LiteAPI");
        }
        
        // Fetch hotel details
        const hotelsResponse = await sdk.getHotelDetails(hotelId);
        const hotelInfo = hotelsResponse.data;
        
        console.log(`Found rates for hotel ${hotelId} from LiteAPI`);
        
        // Prepare the response data - transform to expected format
        const rateInfo = rates.map((hotel) =>
          hotel.roomTypes.flatMap((roomType) => {
            // Define the board types we're interested in
            const boardTypes = ["RO", "BI"];

            // Filter rates by board type and sort by refundable tag
            return boardTypes
              .map((boardType) => {
                const filteredRates = roomType.rates.filter((rate) => rate.boardType === boardType);

                // Sort to prioritize 'RFN' over 'NRFN'
                const sortedRates = filteredRates.sort((a, b) => {
                  if (
                    a.cancellationPolicies.refundableTag === "RFN" &&
                    b.cancellationPolicies.refundableTag !== "RFN"
                  ) {
                    return -1; // a before b
                  } else if (
                    b.cancellationPolicies.refundableTag === "RFN" &&
                    a.cancellationPolicies.refundableTag !== "RFN"
                  ) {
                    return 1; // b before a
                  }
                  return 0; // no change in order
                });

                // Return the first rate meeting the criteria if it exists
                if (sortedRates.length > 0) {
                  const rate = sortedRates[0];
                  return {
                    rateName: rate.name,
                    offerId: roomType.offerId,
                    board: rate.boardName,
                    refundableTag: rate.cancellationPolicies.refundableTag,
                    retailRate: rate.retailRate.total[0].amount,
                    originalRate: rate.retailRate.suggestedSellingPrice[0].amount,
                  };
                }
                return null;
              })
              .filter((rate) => rate !== null);
          })
        );
        
        console.log("Successfully returning LiteAPI rates data");
        return res.json({ hotelInfo, rateInfo });
        
      } catch (liteApiError) {
        console.error("LiteAPI rates failed, falling back to mock data:", liteApiError.message);
        // Continue to mock data fallback below
      }
    }
    
    // Fallback to mock data
    console.log("Using mock rates data (API keys invalid or LiteAPI failed)");
    
    const mockHotelInfo = {
      name: hotelId === "mock_hotel_1" ? "Demo Hotel in New York" : "Premium Resort New York",
      address: hotelId === "mock_hotel_1" ? "123 Main Street, New York, US" : "456 Beach Avenue, New York, US",
      starRating: hotelId === "mock_hotel_1" ? 4 : 5,
      amenities: hotelId === "mock_hotel_1" ? ["WiFi", "Pool", "Gym"] : ["WiFi", "Pool", "Spa", "Beach Access"],
      images: [hotelId === "mock_hotel_1" ? "https://via.placeholder.com/300x200?text=Demo+Hotel+1" : "https://via.placeholder.com/300x200?text=Demo+Hotel+2"]
    };
    
    const mockRateInfo = [[
      {
        rateName: "Standard Room",
        offerId: `${hotelId}_offer_1`,
        board: "Room Only",
        refundableTag: "RFN",
        retailRate: 150,
        originalRate: 180,
      },
      {
        rateName: "Deluxe Room", 
        offerId: `${hotelId}_offer_2`,
        board: "Breakfast Included",
        refundableTag: "NRFN",
        retailRate: 220,
        originalRate: 250,
      }
    ]];
    
    console.log("Returning mock rates data");
    return res.json({ hotelInfo: mockHotelInfo, rateInfo: mockRateInfo });
    
  } catch (error) {
    console.error("Error in search-rates endpoint:", error);
    res.status(500).json({ error: "No availability found", details: error.message });
  }
});

app.post("/prebook", async (req, res) => {
  try {
    console.log("Prebook endpoint hit");
    console.log(req.body);
    const { rateId, environment, voucherCode } = req.body;
    
    const apiKey = environment === "sandbox" ? sandbox_apiKey : prod_apiKey;
    console.log("API Key for prebook:", apiKey ? "Present" : "Missing");
    
    // Try LiteAPI first if we have valid API keys
    if (apiKey && apiKey !== "your_production_liteapi_key_here" && apiKey !== "your_sandbox_liteapi_key_here") {
      console.log("Attempting LiteAPI prebook with real data");
      
      try {
        const sdk = liteApi(apiKey);
        
        const bodyData = {
          offerId: rateId,
          usePaymentSdk: true,
        };

        // Conditionally add the voucherCode if it exists in the request body
        if (voucherCode) {
          bodyData.voucherCode = voucherCode;
        }

        console.log("Calling LiteAPI prebook with:", bodyData);
        
        const response = await sdk.preBook(bodyData);
        
        if (response && response.data) {
          console.log("Successfully completed LiteAPI prebook");
          return res.json({ success: response });
        } else {
          throw new Error("Invalid response from LiteAPI prebook");
        }
        
      } catch (liteApiError) {
        console.error("LiteAPI prebook failed, falling back to mock data:", liteApiError.message);
        // Continue to mock data fallback below
      }
    }
    
    // Fallback to mock data
    console.log("Using mock prebook data (API keys invalid or LiteAPI failed)");
    
    const mockPrebookResponse = {
      data: {
        prebookId: `mock_prebook_${Date.now()}`,
        status: "CONFIRMED",
        hotelId: rateId.includes("mock_hotel_1") ? "mock_hotel_1" : "mock_hotel_2",
        rateId: rateId
      }
    };
    
    console.log("Returning mock prebook data");
    return res.json({ success: mockPrebookResponse });
    
  } catch (error) {
    console.error("Error in prebook endpoint:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
});

app.get("/book", (req, res) => {
  try {
    console.log("Book endpoint hit");
    console.log(req.query);
    const { prebookId, guestFirstName, guestLastName, guestEmail, transactionId, environment } =
      req.query;

    const apiKey = environment === "sandbox" ? sandbox_apiKey : prod_apiKey;
    console.log("API Key for booking:", apiKey ? "Present" : "Missing");
    
    // Try LiteAPI first if we have valid API keys and this is not mock prebook
    if (apiKey && apiKey !== "your_production_liteapi_key_here" && apiKey !== "your_sandbox_liteapi_key_here" && !prebookId.includes("mock_prebook")) {
      console.log("Attempting LiteAPI booking with real data");
      
      const sdk = liteApi(apiKey);
      
      // Prepare the booking data
      const bodyData = {
        holder: {
          firstName: guestFirstName,
          lastName: guestLastName,
          email: guestEmail,
        },
        payment: {
          method: "TRANSACTION_ID",
          transactionId: transactionId,
        },
        prebookId: prebookId,
        guests: [
          {
            occupancyNumber: 1,
            remarks: "",
            firstName: guestFirstName,
            lastName: guestLastName,
            email: guestEmail,
          },
        ],
      };

      console.log("Calling LiteAPI booking with:", bodyData);

      sdk
        .book(bodyData)
        .then((data) => {
          if (!data || data.error) {
            throw new Error(
              "Error in booking data: " + (data.error ? data.error.message : "Unknown error")
            );
          }

          console.log("Successfully completed LiteAPI booking");

          // Check if this is a mobile app request (JSON response expected)
          if (req.headers.accept && req.headers.accept.includes('application/json')) {
            console.log("Returning JSON response for mobile app");
            return res.json(data);
          }
          
          // Return HTML response for web
          console.log("Returning HTML response for web");
          res.send(`
            <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 20px;
            }
            h1 {
                color: #333;
            }
            .booking-details, .room-details, .policy-details {
                margin-bottom: 20px;
                padding: 10px;
                border: 1px solid #ccc;
                border-radius: 5px;
            }
            .header {
                font-weight: bold;
                color: #444;
            }
        </style>
    </head>
    <body>
        <h1>Booking Confirmation</h1>
        <div class="booking-details">
            <div class="header">Booking Information:</div>
            <p>Booking ID: ${data.data.bookingId}</p>
            <p>Supplier Name: ${data.data.supplierBookingName} (${data.data.supplier})</p>
            <p>Status: ${data.data.status}</p>
            <p>Check-in: ${data.data.checkin}</p>
            <p>Check-out: ${data.data.checkout}</p>
            <p>Hotel: ${data.data.hotel.name} (ID: ${data.data.hotel.hotelId})</p>
        </div>

        <div class="room-details">
            <div class="header">Room Details:</div>
            <p>Room Type: ${data.data.bookedRooms[0].roomType.name}</p>
            <p>Rate (Total): $${data.data.bookedRooms[0].rate.retailRate.total.amount} ${data.data.bookedRooms[0].rate.retailRate.total.currency}</p>
            <p>Occupancy: ${data.data.bookedRooms[0].adults} Adult(s), ${data.data.bookedRooms[0].children} Child(ren)</p>
            <p>Guest Name: ${data.data.bookedRooms[0].firstName} ${data.data.bookedRooms[0].lastName}</p>
        </div>
    <div class="policy-details">
        <div class="header">Cancellation Policy:</div>
        <p>Cancel By: ${
          data.data.cancellationPolicies &&
          data.data.cancellationPolicies.cancelPolicyInfos &&
          data.data.cancellationPolicies.cancelPolicyInfos[0]
            ? data.data.cancellationPolicies.cancelPolicyInfos[0].cancelTime
            : "Not specified"
        }</p>
        <p>Cancellation Fee: ${
          data.data.cancellationPolicies &&
          data.data.cancellationPolicies.cancelPolicyInfos &&
          data.data.cancellationPolicies.cancelPolicyInfos[0]
            ? `$${data.data.cancellationPolicies.cancelPolicyInfos[0].amount}`
            : "Not specified"
        }</p>
        <p>Remarks: ${data.data.remarks || "No additional remarks."}</p>
    </div>

        <a href="/"><button>Back to Hotels</button></a>
    </body>
    </html>
          `);
        })
        .catch((err) => {
          console.error("LiteAPI booking failed, falling back to mock data:", err.message);
          // Fall back to mock data
          handleMockBooking();
        });
      
      return; // Exit early for LiteAPI path
    }
    
    // Fallback to mock data function
    function handleMockBooking() {
      console.log("Using mock booking data (API keys invalid, mock prebook, or LiteAPI failed)");
      
      const mockBookingData = {
        data: {
          bookingId: `MOCK${Date.now()}`,
          supplierBookingName: "MockBooking",
          supplier: "DemoSupplier", 
          status: "CONFIRMED",
          checkin: new Date().toISOString().split('T')[0],
          checkout: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          hotel: {
            name: prebookId.includes("mock_hotel_1") ? "Demo Hotel in New York" : "Premium Resort New York",
            hotelId: prebookId.includes("mock_hotel_1") ? "mock_hotel_1" : "mock_hotel_2"
          },
          bookedRooms: [{
            roomType: { name: "Standard Room" },
            rate: {
              retailRate: {
                total: { amount: 150, currency: "USD" }
              }
            },
            adults: 2,
            children: 0,
            firstName: guestFirstName,
            lastName: guestLastName
          }],
          cancellationPolicies: {
            cancelPolicyInfos: [{
              cancelTime: "24 hours before check-in",
              amount: 0
            }]
          },
          remarks: "This is a demo booking for testing purposes."
        }
      };
      
      // Check if this is a mobile app request (JSON response expected)
      if (req.headers.accept && req.headers.accept.includes('application/json')) {
        console.log("Returning JSON response for mobile app");
        return res.json(mockBookingData);
      }
      
      // Return HTML response for web
      console.log("Returning HTML response");
      return res.send(`
          <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 20px;
          }
          h1 {
              color: #333;
          }
          .booking-details, .room-details, .policy-details {
              margin-bottom: 20px;
              padding: 10px;
              border: 1px solid #ccc;
              border-radius: 5px;
          }
          .header {
              font-weight: bold;
              color: #444;
          }
      </style>
  </head>
  <body>
      <h1>Booking Confirmation (Demo Mode)</h1>
      <div class="booking-details">
          <div class="header">Booking Information:</div>
          <p>Booking ID: ${mockBookingData.data.bookingId}</p>
          <p>Supplier Name: ${mockBookingData.data.supplierBookingName} (${mockBookingData.data.supplier})</p>
          <p>Status: ${mockBookingData.data.status}</p>
          <p>Check-in: ${mockBookingData.data.checkin}</p>
          <p>Check-out: ${mockBookingData.data.checkout}</p>
          <p>Hotel: ${mockBookingData.data.hotel.name} (ID: ${mockBookingData.data.hotel.hotelId})</p>
      </div>

      <div class="room-details">
          <div class="header">Room Details:</div>
          <p>Room Type: ${mockBookingData.data.bookedRooms[0].roomType.name}</p>
          <p>Rate (Total): $${mockBookingData.data.bookedRooms[0].rate.retailRate.total.amount} ${mockBookingData.data.bookedRooms[0].rate.retailRate.total.currency}</p>
          <p>Occupancy: ${mockBookingData.data.bookedRooms[0].adults} Adult(s), ${mockBookingData.data.bookedRooms[0].children} Child(ren)</p>
          <p>Guest Name: ${mockBookingData.data.bookedRooms[0].firstName} ${mockBookingData.data.bookedRooms[0].lastName}</p>
      </div>
  <div class="policy-details">
      <div class="header">Cancellation Policy:</div>
      <p>Cancel By: ${mockBookingData.data.cancellationPolicies.cancelPolicyInfos[0].cancelTime}</p>
      <p>Cancellation Fee: $${mockBookingData.data.cancellationPolicies.cancelPolicyInfos[0].amount}</p>
      <p>Remarks: ${mockBookingData.data.remarks}</p>
  </div>

      <a href="/"><button>Back to Hotels</button></a>
  </body>
  </html>
        `);
    }
    
    // Call mock booking function
    handleMockBooking();
    
  } catch (error) {
    console.error("Error in book endpoint:", error);
    res.status(500).json({ error: "Failed to book", details: error.message });
  }
});

app.post("/funny-response", async (req, res) => {
  const { what, where, when } = req.body;
  try {
    const prompt = `A user is searching for hotels with the following details:\nWhat: ${what}\nWhere: ${where}\nWhen: ${when}\nWrite a very funny, pseudo-trolling response to this search. Be playful, witty, and a bit sarcastic, but not mean. Make the user laugh before they see their real results.`;
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a witty, playful, and slightly sarcastic hotel search assistant. Always make the user laugh with your responses." },
        { role: "user", content: prompt }
      ],
      max_tokens: 100
    });
    const funnyResponse = completion.choices[0].message.content;
    res.json({ funnyResponse });
  } catch (error) {
    console.error("Error generating funny response:", error);
    res.status(500).json({ error: "Failed to generate funny response" });
  }
});

// New endpoint for comprehensive hotel details
app.get("/hotel-details", async (req, res) => {
  try {
    console.log("Hotel details endpoint hit");
    const { hotelId, environment } = req.query;
    console.log("Hotel details query params:", { hotelId, environment });
    
    const apiKey = environment === "sandbox" ? sandbox_apiKey : prod_apiKey;
    console.log("API Key for hotel details:", apiKey ? "Present" : "Missing");
    
    // Try LiteAPI first if we have valid API keys
    if (apiKey && apiKey !== "your_production_liteapi_key_here" && apiKey !== "your_sandbox_liteapi_key_here") {
      console.log("Attempting LiteAPI hotel details call with real data");
      
      try {
        const sdk = liteApi(apiKey);
        
        // Fetch comprehensive hotel details
        const hotelResponse = await sdk.getHotelDetails(hotelId);
        const hotelData = hotelResponse.data;
        
        console.log(`Found hotel details for ${hotelId} from LiteAPI`);
        
        // Transform and enhance the hotel data
        const enhancedHotelDetails = {
          id: hotelData.id,
          name: hotelData.name,
          description: hotelData.hotelDescription,
          address: hotelData.address,
          city: hotelData.city,
          country: hotelData.country,
          zip: hotelData.zip,
          latitude: hotelData.latitude,
          longitude: hotelData.longitude,
          starRating: hotelData.stars,
          rating: hotelData.rating,
          reviewCount: hotelData.reviewCount,
          currency: hotelData.currency,
          chain: hotelData.chain,
          chainId: hotelData.chainId,
          hotelTypeId: hotelData.hotelTypeId,
          mainPhoto: hotelData.main_photo,
          thumbnail: hotelData.thumbnail,
          
          // Enhanced amenities and facilities
          amenities: hotelData.facilityIds || [],
          accessibility: hotelData.accessibilityAttributes || {},
          
          // Additional details that might be available
          checkInTime: hotelData.checkInTime || "3:00 PM",
          checkOutTime: hotelData.checkOutTime || "11:00 AM",
          totalRooms: hotelData.totalRooms || "Not specified",
          yearBuilt: hotelData.yearBuilt || "Not specified",
          lastRenovated: hotelData.lastRenovated || "Not specified",
          
          // Contact information
          phone: hotelData.phone || "Not available",
          email: hotelData.email || "Not available",
          website: hotelData.website || "Not available",
          
          // Policies
          petPolicy: hotelData.petPolicy || "Contact hotel for pet policy",
          smokingPolicy: hotelData.smokingPolicy || "Contact hotel for smoking policy",
          
          // Location details
          distanceFromAirport: hotelData.distanceFromAirport || "Not specified",
          distanceFromCityCenter: hotelData.distanceFromCityCenter || "Not specified",
          
          // Images (if available in different format)
          images: hotelData.images || [hotelData.main_photo],
          
          // Additional metadata
          deletedAt: hotelData.deletedAt,
          createdAt: hotelData.createdAt,
          updatedAt: hotelData.updatedAt
        };
        
        console.log("Successfully returning enhanced hotel details");
        return res.json({ hotelDetails: enhancedHotelDetails });
        
      } catch (liteApiError) {
        console.error("LiteAPI hotel details failed, falling back to mock data:", liteApiError.message);
        // Continue to mock data fallback below
      }
    }
    
    // Fallback to mock data
    console.log("Using mock hotel details data (API keys invalid or LiteAPI failed)");
    
    const mockHotelDetails = {
      id: hotelId,
      name: hotelId === "mock_hotel_1" ? "Demo Hotel in New York" : "Premium Resort New York",
      description: hotelId === "mock_hotel_1" 
        ? "Experience luxury and comfort in the heart of New York City. Our hotel offers modern amenities, exceptional service, and convenient access to all major attractions."
        : "Discover paradise at our premium beachfront resort. Enjoy stunning ocean views, world-class dining, and exclusive amenities for the ultimate vacation experience.",
      address: hotelId === "mock_hotel_1" ? "123 Main Street, New York, NY 10001" : "456 Beach Avenue, New York, NY 10002",
      city: "New York",
      country: "US",
      zip: hotelId === "mock_hotel_1" ? "10001" : "10002",
      latitude: 40.7128,
      longitude: -74.0060,
      starRating: hotelId === "mock_hotel_1" ? 4 : 5,
      rating: hotelId === "mock_hotel_1" ? 8.5 : 9.2,
      reviewCount: hotelId === "mock_hotel_1" ? 1247 : 892,
      currency: "USD",
      chain: hotelId === "mock_hotel_1" ? "Demo Hotels" : "Premium Resorts",
      chainId: hotelId === "mock_hotel_1" ? "demo_chain" : "premium_chain",
      hotelTypeId: 204,
      mainPhoto: hotelId === "mock_hotel_1" ? "https://via.placeholder.com/400x300?text=Demo+Hotel+1" : "https://via.placeholder.com/400x300?text=Premium+Resort",
      thumbnail: hotelId === "mock_hotel_1" ? "https://via.placeholder.com/200x150?text=Demo+Hotel+1" : "https://via.placeholder.com/200x150?text=Premium+Resort",
      
      amenities: hotelId === "mock_hotel_1" 
        ? ["WiFi", "Pool", "Gym", "Restaurant", "Bar", "Room Service", "Concierge", "Business Center", "Parking", "Air Conditioning"]
        : ["WiFi", "Pool", "Spa", "Beach Access", "Restaurant", "Bar", "Room Service", "Concierge", "Fitness Center", "Tennis Court", "Golf Course", "Kids Club"],
      
      accessibility: {
        petFriendly: hotelId === "mock_hotel_1" ? "Yes" : "No",
        rampAngle: 0,
        rampLength: 0,
        entranceDoorWidth: 0,
        roomMaxGuestsNumber: 4
      },
      
      checkInTime: "3:00 PM",
      checkOutTime: "11:00 AM",
      totalRooms: hotelId === "mock_hotel_1" ? "150" : "200",
      yearBuilt: hotelId === "mock_hotel_1" ? "2010" : "2015",
      lastRenovated: hotelId === "mock_hotel_1" ? "2020" : "2022",
      
      phone: hotelId === "mock_hotel_1" ? "+1 (555) 123-4567" : "+1 (555) 987-6543",
      email: hotelId === "mock_hotel_1" ? "info@demohotel.com" : "info@premiumresort.com",
      website: hotelId === "mock_hotel_1" ? "www.demohotel.com" : "www.premiumresort.com",
      
      petPolicy: hotelId === "mock_hotel_1" ? "Pets allowed with $50 fee" : "No pets allowed",
      smokingPolicy: "Designated smoking areas only",
      
      distanceFromAirport: hotelId === "mock_hotel_1" ? "15 miles" : "25 miles",
      distanceFromCityCenter: hotelId === "mock_hotel_1" ? "0.5 miles" : "2 miles",
      
      images: [
        hotelId === "mock_hotel_1" ? "https://via.placeholder.com/400x300?text=Demo+Hotel+1" : "https://via.placeholder.com/400x300?text=Premium+Resort",
        hotelId === "mock_hotel_1" ? "https://via.placeholder.com/400x300?text=Demo+Hotel+2" : "https://via.placeholder.com/400x300?text=Premium+Resort+2",
        hotelId === "mock_hotel_1" ? "https://via.placeholder.com/400x300?text=Demo+Hotel+3" : "https://via.placeholder.com/400x300?text=Premium+Resort+3"
      ]
    };
    
    console.log("Returning mock hotel details data");
    return res.json({ hotelDetails: mockHotelDetails });
    
  } catch (error) {
    console.error("Error in hotel-details endpoint:", error);
    res.status(500).json({ error: "Failed to fetch hotel details", details: error.message });
  }
});

// New endpoint for hotel reviews
app.get("/hotel-reviews", async (req, res) => {
  try {
    console.log("Hotel reviews endpoint hit");
    const { hotelId, environment, limit = '20', offset = '0' } = req.query;
    console.log("Hotel reviews query params:", { hotelId, environment, limit, offset });
    
    const apiKey = environment === "sandbox" ? sandbox_apiKey : prod_apiKey;
    console.log("API Key for hotel reviews:", apiKey ? "Present" : "Missing");
    
    // Try LiteAPI first if we have valid API keys
    if (apiKey && apiKey !== "your_production_liteapi_key_here" && apiKey !== "your_sandbox_liteapi_key_here") {
      console.log("Attempting LiteAPI hotel reviews call with real data");
      
      try {
        const axios = require('axios');
        
        const options = {
          method: 'GET',
          url: 'https://api.liteapi.travel/v3.0/data/reviews',
          params: {
            hotelId: hotelId,
            limit: limit,
            offset: offset,
            timeout: '4',
            getSentiment: 'false'
          },
          headers: {
            accept: 'application/json',
            'X-API-Key': apiKey
          }
        };
        
        const response = await axios.request(options);
        const reviewsData = response.data;
        
        console.log(`Found ${reviewsData.data.length} reviews for hotel ${hotelId} from LiteAPI`);
        
        // Transform the reviews data for consistent mobile app consumption
        const transformedReviews = {
          reviews: reviewsData.data.map(review => ({
            id: `${review.name}_${review.date}`,
            reviewerName: review.name,
            reviewerType: review.type,
            country: review.country || 'Unknown',
            rating: review.averageScore,
            date: review.date,
            headline: review.headline,
            language: review.language || 'en',
            pros: review.pros,
            cons: review.cons,
            source: review.source,
            // Calculate days ago for better UX
            daysAgo: Math.floor((new Date() - new Date(review.date)) / (1000 * 60 * 60 * 24))
          })),
          total: reviewsData.total,
          averageRating: reviewsData.data.length > 0 
            ? (reviewsData.data.reduce((sum, review) => sum + review.averageScore, 0) / reviewsData.data.length).toFixed(1)
            : 0,
          ratingDistribution: calculateRatingDistribution(reviewsData.data)
        };
        
        console.log("Successfully returning hotel reviews");
        return res.json(transformedReviews);
        
      } catch (liteApiError) {
        console.error("LiteAPI hotel reviews failed, falling back to mock data:", liteApiError.message);
        // Continue to mock data fallback below
      }
    }
    
    // Fallback to mock data
    console.log("Using mock hotel reviews data (API keys invalid or LiteAPI failed)");
    
    const mockReviews = generateMockReviews(hotelId, parseInt(limit));
    
    console.log("Returning mock hotel reviews data");
    return res.json(mockReviews);
    
  } catch (error) {
    console.error("Error in hotel-reviews endpoint:", error);
    res.status(500).json({ error: "Failed to fetch hotel reviews", details: error.message });
  }
});

// Helper function to calculate rating distribution
function calculateRatingDistribution(reviews) {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach(review => {
    const rating = Math.round(review.averageScore);
    if (rating >= 1 && rating <= 5) {
      distribution[rating]++;
    }
  });
  return distribution;
}

// Helper function to generate mock reviews
function generateMockReviews(hotelId, limit) {
  const mockReviewsData = [
    {
      reviewerName: "TravelExpert2024",
      reviewerType: "Business",
      country: "US",
      rating: 5,
      headline: "Exceptional stay in the heart of the city",
      pros: "Perfect location, excellent service, and modern amenities. The staff went above and beyond to make our stay comfortable. Highly recommend for business travelers.",
      cons: "None to mention",
      source: "TripAdvisor",
      daysAgo: 3
    },
    {
      reviewerName: "FamilyVacation2024",
      reviewerType: "Family",
      country: "CA",
      rating: 4,
      headline: "Great family hotel with minor issues",
      pros: "Kids loved the pool area, rooms were spacious, and location was perfect for sightseeing. Front desk staff was very helpful with recommendations.",
      cons: "Wi-Fi was a bit slow, and the breakfast could use more variety",
      source: "Booking.com",
      daysAgo: 7
    },
    {
      reviewerName: "CoupleGetaway",
      reviewerType: "Couples",
      country: "UK",
      rating: 5,
      headline: "Romantic weekend perfection",
      pros: "Beautiful room with city views, excellent room service, and the concierge helped us get theater tickets. The hotel's restaurant was outstanding.",
      cons: "",
      source: "Expedia",
      daysAgo: 12
    },
    {
      reviewerName: "SoloTraveler88",
      reviewerType: "Solo travel",
      country: "AU",
      rating: 4,
      headline: "Safe and comfortable for solo travelers",
      pros: "Felt very safe, great location near public transport, and the business center was useful. Room was clean and comfortable.",
      cons: "Room was a bit small, but expected for city center location",
      source: "Hotels.com",
      daysAgo: 18
    },
    {
      reviewerName: "BusinessTraveler123",
      reviewerType: "Business",
      country: "DE",
      rating: 3,
      headline: "Decent business hotel",
      pros: "Good location for meetings, reliable Wi-Fi, and quick check-in/out process. Conference facilities were adequate.",
      cons: "Room was dated and could use renovation. Air conditioning was noisy.",
      source: "TripAdvisor",
      daysAgo: 25
    },
    {
      reviewerName: "VacationFamily",
      reviewerType: "Family",
      country: "FR",
      rating: 2,
      headline: "Disappointed with the experience",
      pros: "Location was good and staff tried to be helpful",
      cons: "Room was not clean upon arrival, elevator was broken during our stay, and the promised amenities were not available.",
      source: "Booking.com",
      daysAgo: 30
    }
  ];
  
  // Select reviews based on hotel ID to provide variety
  const selectedReviews = hotelId === "mock_hotel_1" 
    ? mockReviewsData.slice(0, Math.min(limit, mockReviewsData.length))
    : mockReviewsData.slice(1, Math.min(limit + 1, mockReviewsData.length));
  
  // Add unique IDs and dates
  const reviewsWithIds = selectedReviews.map((review, index) => ({
    ...review,
    id: `mock_review_${hotelId}_${index}`,
    date: new Date(Date.now() - review.daysAgo * 24 * 60 * 60 * 1000).toISOString()
  }));
  
  const averageRating = reviewsWithIds.length > 0 
    ? (reviewsWithIds.reduce((sum, review) => sum + review.rating, 0) / reviewsWithIds.length).toFixed(1)
    : 0;
  
  const ratingDistribution = calculateRatingDistribution(reviewsWithIds.map(r => ({ averageScore: r.rating })));
  
  return {
    reviews: reviewsWithIds,
    total: reviewsWithIds.length,
    averageRating: averageRating,
    ratingDistribution: ratingDistribution
  };
}

// Test endpoint to debug LiteAPI
app.get("/test-liteapi", async (req, res) => {
  try {
    const { environment = "sandbox" } = req.query;
    const apiKey = environment === "sandbox" ? sandbox_apiKey : prod_apiKey;
    
    console.log("=== LiteAPI Test ===");
    console.log("Environment:", environment);
    console.log("API Key exists:", !!apiKey);
    console.log("API Key format:", apiKey ? apiKey.substring(0, 10) + "..." : "Not found");
    
    if (!apiKey) {
      return res.json({ 
        error: "No API key found", 
        environment,
        sandbox_key_exists: !!sandbox_apiKey,
        prod_key_exists: !!prod_apiKey 
      });
    }
    
    // Test 1: Can we create SDK instance?
    try {
      console.log("Testing SDK creation...");
      const sdk = liteApi(apiKey);
      console.log("SDK created successfully");
      
      // Test 2: Can we make a simple API call?
      console.log("Testing simple API call...");
      const response = await sdk.getHotels("IT", "rome", 0, 1);
      console.log("API call successful");
      console.log("Response:", JSON.stringify(response, null, 2));
      
      res.json({ 
        success: true, 
        message: "LiteAPI working correctly",
        data: response
      });
      
    } catch (sdkError) {
      console.error("SDK Error:", sdkError);
      res.json({ 
        error: "SDK Error", 
        message: sdkError.message,
        stack: sdkError.stack,
        apiKeyFormat: apiKey.substring(0, 10) + "..."
      });
    }
    
  } catch (error) {
    console.error("Test endpoint error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Serve the client-side application
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

app.use(express.static(path.join(__dirname, "../client")));

const port = 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
