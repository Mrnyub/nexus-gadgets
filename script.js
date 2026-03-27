// Wait for the entire website to load before running scripts
document.addEventListener('DOMContentLoaded', () => {

    /* =========================================
       1. PRODUCT SEARCH FILTER
       ========================================= */
    const searchInput = document.getElementById('searchInput');

    if (searchInput) {
        searchInput.addEventListener('keyup', function(event) {
            const query = event.target.value.toLowerCase();
            const productCards = document.querySelectorAll('.product-card');

            productCards.forEach(card => {
                // We use safety checks (?) just in case a card doesn't have a category (like on the homepage)
                const nameElement = card.querySelector('h3');
                const categoryElement = card.querySelector('.category');

                const productName = nameElement ? nameElement.textContent.toLowerCase() : '';
                const productCategory = categoryElement ? categoryElement.textContent.toLowerCase() : '';

                if (productName.includes(query) || productCategory.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }

    /* =========================================
       2. DYNAMIC CUSTOMER REVIEWS SYSTEM
       ========================================= */
    const reviewForm = document.getElementById('reviewForm');
    const reviewGrid = document.getElementById('dynamicReviewGrid');
    const successMessage = document.getElementById('reviewSuccessMessage');

    // Default reviews
    let reviewsData = [
        { name: "Mark D.", rating: 5, text: "The checkout process was incredibly smooth, and my new phone arrived the next day. Nexus Gadgets is my new go-to." },
        { name: "Sarah L.", rating: 5, text: "Excellent customer service and the gadgets are 100% authentic. Highly recommend their smartwatches!" }
    ];

    // Load saved reviews from memory
    if (localStorage.getItem('nexusReviews')) {
        reviewsData = JSON.parse(localStorage.getItem('nexusReviews'));
    }

    function renderReviews() {
        if (!reviewGrid) return;
        reviewGrid.innerHTML = ''; 
        
        const reversedReviews = [...reviewsData].reverse(); 
        
        reversedReviews.forEach(review => {
            let starsHTML = '⭐'.repeat(review.rating);
            const reviewHTML = `
                <div class="review-card">
                    <div class="stars">${starsHTML}</div>
                    <p>"${review.text}"</p>
                    <h4>- ${review.name}</h4>
                </div>
            `;
            reviewGrid.innerHTML += reviewHTML;
        });
    }

    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault(); 
            
            const name = document.getElementById('reviewName').value;
            const rating = parseInt(document.getElementById('reviewRating').value);
            const text = document.getElementById('reviewText').value;

            reviewsData.push({ name: name, rating: rating, text: text });
            localStorage.setItem('nexusReviews', JSON.stringify(reviewsData));
            
            renderReviews();
            
            reviewForm.reset();
            if (successMessage) {
                successMessage.style.display = "block";
                setTimeout(() => {
                    successMessage.style.display = "none";
                }, 4000); // Hides after 4 seconds
            }
        });
        renderReviews();
    }

    /* =========================================
       3. ORDER TRACKING SIMULATOR
       ========================================= */
    const trackingForm = document.getElementById('trackingForm');
    
    if (trackingForm) {
        trackingForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Stop page reload
            
            // Get the tracking number the user typed in
            const trackingInput = this.querySelector('input').value.trim();
            
            if (trackingInput) {
                // Pop up a fake shipping status
                alert(`Tracking status for ${trackingInput}:\n\n📦 In Transit - Currently passing through the Cebu City sorting center. Expected delivery in 1-2 business days.`);
                this.reset(); // Clear the text box
            }
        });
    }

});
