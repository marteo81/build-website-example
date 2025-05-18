// Initialize the SDK with your API key

async function searchHotels() {
	document.getElementById("loader").style.display = "block";

	// Clear previous hotel elements and funny response
	const hotelsDiv = document.getElementById("hotels");
	hotelsDiv.innerHTML = "";
	document.getElementById("funny-response").innerHTML = "";

	// Get field values
	const whereInput = document.getElementById("where").value;
	const whyInput = document.getElementById("why").value;
	const checkin = document.getElementById("checkin").value;
	const checkout = document.getElementById("checkout").value;
	const adults = document.getElementById("adults").value;
	const environment = document.getElementById("environment").value;

	// Parse 'where' (expecting 'City, CountryCode')
	let city = "";
	let countryCode = "";
	if (whereInput.includes(",")) {
		[city, countryCode] = whereInput.split(",").map(s => s.trim());
	} else {
		city = whereInput.trim();
		countryCode = "US"; // fallback
	}

	// Compose OpenAI prompt fields
	const what = whyInput || `Hotel for ${adults} adult(s)`;
	const where = whereInput;
	const when = `${checkin} to ${checkout}`;

	try {
		// 1. Get funny response from backend
		const funnyRes = await fetch("http://localhost:3000/funny-response", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ what, where, when })
		});
		const funnyData = await funnyRes.json();
		if (funnyData.funnyResponse) {
			document.getElementById("funny-response").innerText = funnyData.funnyResponse;
		}

		// 2. Wait a moment for comedic effect
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// 3. Make a request to your backend server for hotels
		const response = await fetch(
			`http://localhost:3000/search-hotels?checkin=${encodeURIComponent(checkin)}&checkout=${encodeURIComponent(checkout)}&adults=${encodeURIComponent(adults)}&city=${encodeURIComponent(city)}&countryCode=${encodeURIComponent(countryCode)}&environment=${encodeURIComponent(environment)}`
		);
		const rates = (await response.json()).rates;
		console.log(rates);
		displayRatesAndHotels(rates);

		document.getElementById("loader").style.display = "none";
		// Do NOT clear the funny response after showing hotels
	} catch (error) {
		console.error("Error fetching hotels:", error);
		document.getElementById("loader").style.display = "none";
	}
}

function displayRatesAndHotels(rates) {
	const hotelsDiv = document.getElementById("hotels");
	hotelsDiv.innerHTML = "<div class='card-container' id='hotel-card-container'></div>";
	const cardContainer = document.getElementById("hotel-card-container");

	rates.forEach((rate) => {
		const minRate = rate.roomTypes.reduce((min, current) => {
			const minAmount = min.rates[0].retailRate.total[0].amount;
			const currentAmount = current.rates[0].retailRate.total[0].amount;
			return minAmount < currentAmount ? min : current;
		});
		const hotel = rate.hotel;
		// Placeholder/fallbacks for missing data
		const address = hotel.address || "Address not available";
		const distance = hotel.distanceFromCenter ? `${hotel.distanceFromCenter} m from centre` : "Distance unknown";
		const amenities = hotel.amenities ? hotel.amenities.join(", ") : "No amenities info";
		const rating = hotel.rating || "8.5";
		const reviews = hotel.reviews || "1000";
		const reviewText = hotel.reviewText || "Fabulous";
		const price = minRate.rates[0].retailRate.total[0].amount;
		const currency = minRate.rates[0].retailRate.total[0].currency;
		const cancellation = minRate.rates[0].cancellationPolicies.refundableTag == "NRFN" ? "Non refundable" : "Free cancellation";
		const boardName = minRate.rates[0].boardName || "Room Only";

		const hotelElement = document.createElement("div");
		hotelElement.className = "card horizontal-card";
		hotelElement.innerHTML = `
			<div class="hotel-img-col">
				<img src='${hotel.main_photo}' alt='hotel' class="hotel-img" />
			</div>
			<div class="hotel-details-col">
				<h3 class='hotel-title'>${hotel.name}</h3>
				<div class="hotel-address">${address}</div>
				<div class="hotel-distance">${distance}</div>
				<div class="hotel-amenities">${boardName} &bull; ${cancellation}</div>
				<div class="hotel-amenities-list">${amenities}</div>
			</div>
			<div class="hotel-price-col">
				<div class="hotel-rating-badge">${reviewText} <span>${rating}</span></div>
				<div class="hotel-reviews">${reviews} reviews</div>
				<div class="hotel-price">${currency} ${price}</div>
				<button class='see-availability-btn' onclick="proceedToBooking('${minRate.offerId}')">See availability</button>
			</div>
		`;
		cardContainer.appendChild(hotelElement);
	});
}

async function proceedToBooking(rateId) {
	console.log("Proceeding to booking for hotel ID:", rateId);

	// Clear existing HTML and display the loader
	const hotelsDiv = document.getElementById("hotels");
	const loader = document.getElementById("loader");
	hotelsDiv.innerHTML = "";
	loader.style.display = "block";

	// Create and append the form dynamically
	const formHtml = `
        <form id="bookingForm">
            <input type="hidden" name="prebookId" value="${rateId}">
            <label>Guest First Name:</label>
            <input type="text" name="guestFirstName" required><br>
            <label>Guest Last Name:</label>
            <input type="text" name="guestLastName" required><br>
            <label>Guest Email:</label>
            <input type="email" name="guestEmail" required><br><br>
            <label>Credit Card Holder Name:</label>
            <input type="text" name="holderName" required><br>
			<label>Voucher Code:</label>
            <input type="text" name="voucher"><br>
            <input type="submit" value="Book Now">
        </form>
    `;
	hotelsDiv.innerHTML = formHtml; // Insert the form into the 'hotels' div
	loader.style.display = "none";

	// Add event listener to handle form submission
	document.getElementById("bookingForm").addEventListener("submit", async function (event) {
		event.preventDefault();
		loader.style.display = "block";

		const formData = new FormData(event.target);
		const guestFirstName = formData.get('guestFirstName');
		const guestLastName = formData.get('guestLastName');
		const guestEmail = formData.get('guestEmail');
		const holderName = formData.get('holderName');
		const voucher = formData.get('voucher');
		const environment = document.getElementById("environment").value;

		try {
			// Include additional guest details in the payment processing request
			const bodyData = {
				environment,
				rateId
			};

			// Add voucher if it exists
			if (voucher) {
				bodyData.voucherCode = voucher;
			}
			console.log(bodyData);

			const prebookResponse = await fetch(`http://localhost:3000/prebook`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(bodyData),
			});

			const prebookData = await prebookResponse.json();
			console.log("preboook successful!", prebookData.success.data)
			// Assuming prebookData.success.data includes the necessary fields
			const paymentData = {
				currency: prebookData.success.data.currency,
				price: prebookData.success.data.price, // Ensure this field exists
				voucherTotalAmount: prebookData.success.data.voucherTotalAmount // Ensure this field exists or use a default if optional
			};
			displayPaymentInfo(paymentData);

			initializePaymentForm(
				prebookData.success.data.secretKey,
				prebookData.success.data.prebookId,
				prebookData.success.data.transactionId,
				guestFirstName,
				guestLastName,
				guestEmail
			);
		} catch (error) {
			console.error("Error in payment processing or booking:", error);
		} finally {
			loader.style.display = "none";
		}
	});
}

function displayPaymentInfo(data) {
	console.log("display payment data function called)")
	const paymentDiv = document.getElementById('hotels');
	if (!paymentDiv) {
		console.error('paymentInfo div not found');
		return;
	}
	// Destructure the necessary data from the object
	const { price, currency, voucherTotalAmount } = data;

	// Create content for the div
	let content = `<p>Amount: ${price} ${currency}</p>`;

	// Check if voucherTotalAmount is available and add it to the content
	if (voucherTotalAmount && voucherTotalAmount > 0) {
		content += `<p>Voucher Total Amount: ${voucherTotalAmount} ${currency}</p>`;
	}

	// Update the div's content
	paymentDiv.innerHTML = content;
}