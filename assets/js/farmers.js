/*=============== FARMERS DATA ===============*/
const farmersData = [
    {
        id: 1,
        name: "Rajesh Kumar",
        phone: "+91 98765 43210",
        location: "Chennai - East",
        description: "Certified organic farmer with 15+ years of experience. Specializes in sustainable farming practices.",
        image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=500&h=500&fit=crop",
        crops: ["vegetables", "herbs"],
        cropsList: ["Tomatoes", "Carrots", "Basil"]
    },
    {
        id: 2,
        name: "Priya Sharma",
        phone: "+91 87654 32109",
        location: "Bangalore - North",
        description: "Specialist in exotic fruits and berries. Premium quality produce delivered weekly.",
        image: "https://images.unsplash.com/photo-1552499881-8c45e4a72c9a?w=500&h=500&fit=crop",
        crops: ["fruits", "herbs"],
        cropsList: ["Strawberries", "Blueberries", "Mint"]
    },
    {
        id: 3,
        name: "Amit Verma",
        phone: "+91 76543 21098",
        location: "Delhi - Central",
        description: "Traditional spice farmer with heritage recipes. Produces premium blend spices.",
        image: "https://images.unsplash.com/photo-1560694566-04078ca50b79?w=500&h=500&fit=crop",
        crops: ["spices", "herbs"],
        cropsList: ["Turmeric", "Cumin", "Coriander"]
    },
    {
        id: 4,
        name: "Kavya Nair",
        phone: "+91 65432 10987",
        location: "Kerala - South",
        description: "Eco-friendly farm focusing on organic vegetables and traditional herbs.",
        image: "https://images.unsplash.com/photo-1617957743335-59e88fcf2a66?w=500&h=500&fit=crop",
        crops: ["vegetables", "herbs", "spices"],
        cropsList: ["Broccoli", "Spinach", "Oregano", "Black Pepper"]
    },
    {
        id: 5,
        name: "Suresh Reddy",
        phone: "+91 54321 09876",
        location: "Hyderabad - West",
        description: "Grain specialist farmer. supplies quality pulses and cereals to local markets.",
        image: "https://images.unsplash.com/photo-1500582191375-122335933176?w=500&h=500&fit=crop",
        crops: ["grains", "spices"],
        cropsList: ["Rice", "Lentils", "Chickpeas", "Fenugreek"]
    },
    {
        id: 6,
        name: "Divya Singh",
        phone: "+91 43210 98765",
        location: "Pune - East",
        description: "Modern farmer using hydroponic techniques. Fresh herbs available daily.",
        image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&h=500&fit=crop",
        crops: ["herbs", "vegetables"],
        cropsList: ["Parsley", "Thyme", "Lettuce", "Bell Peppers"]
    },
    {
        id: 7,
        name: "Mohan Goel",
        phone: "+91 32109 87654",
        location: "Jaipur - North",
        description: "Fruit orchard farmer with varieties of apples, oranges and citrus fruits.",
        image: "https://images.unsplash.com/photo-1488459716781-6918f33015b5?w=500&h=500&fit=crop",
        crops: ["fruits"],
        cropsList: ["Apples", "Oranges", "Lemons", "Pomegranates"]
    },
    {
        id: 8,
        name: "Neha Patel",
        phone: "+91 21098 76543",
        location: "Ahmedabad - Central",
        description: "Organic farm producing fresh vegetables daily. Farm-to-table delivery available.",
        image: "https://images.unsplash.com/photo-1494453455637-23f279b90fe2?w=500&h=500&fit=crop",
        crops: ["vegetables", "herbs"],
        cropsList: ["Cucumber", "Zucchini", "Cilantro", "Rosemary"]
    },
    {
        id: 9,
        name: "Vikram Chopra",
        phone: "+91 10987 65432",
        location: "Lucknow - North",
        description: "Spice plantation farmer. Supplies to premium restaurants and food brands.",
        image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad576?w=500&h=500&fit=crop",
        crops: ["spices"],
        cropsList: ["Cardamom", "Cinnamon", "Cloves", "Star Anise"]
    },
    {
        id: 10,
        name: "Sneha Desai",
        phone: "+91 09876 54321",
        location: "Goa - South",
        description: "Tropical fruit and coconut farm. Produces natural coconut oil and fresh fruits.",
        image: "https://images.unsplash.com/photo-1506427537298-de4f2fe0a81f?w=500&h=500&fit=crop",
        crops: ["fruits", "spices"],
        cropsList: ["Coconut", "Pineapple", "Papaya", "Nutmeg"]
    },
    {
        id: 11,
        name: "Arun Nambiar",
        phone: "+91 98765 12345",
        location: "Thrissur - South",
        description: "Grain farming with advanced irrigation system. Supplies whole grains and flours.",
        image: "https://images.unsplash.com/photo-1556225286-d3cab5055fbc?w=500&h=500&fit=crop",
        crops: ["grains", "vegetables"],
        cropsList: ["Wheat", "Barley", "Rye", "Peas"]
    },
    {
        id: 12,
        name: "Pooja Gupta",
        phone: "+91 87654 12345",
        location: "Indore - Central",
        description: "Medicinal herbs and aromatic plant specialist. Supplies to ayurvedic companies.",
        image: "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&h=500&fit=crop",
        crops: ["herbs", "spices"],
        cropsList: ["Ashwagandha", "Tulsi", "Neem", "Ginger"]
    }
];

/*=============== DOM ELEMENTS ===============*/
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.farmers__filter-btn');
const farmersContainer = document.getElementById('farmersContainer');
const noResults = document.getElementById('noResults');

// Current filter state
let currentFilter = 'all';

/*=============== RENDER FARMERS CARDS ===============*/
function renderFarmers(farmers) {
    farmersContainer.innerHTML = '';
    
    if (farmers.length === 0) {
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    farmers.forEach(farmer => {
        const farmerCard = document.createElement('article');
        farmerCard.classList.add('farmers__card');
        
        // Create crop badges
        const badgesHTML = farmer.crops.slice(0, 3).map(crop => {
            return `<span class="farmers__badge">${capitalizeFirstLetter(crop)}</span>`;
        }).join('');
        
        // Create crop tags
        const cropsHTML = farmer.cropsList.map(crop => {
            return `<span class="farmers__crop-tag">${crop}</span>`;
        }).join('');
        
        farmerCard.innerHTML = `
            <div class="farmers__img-container">
                <img src="${farmer.image}" alt="${farmer.name}" class="farmers__img">
                <div class="farmers__badges">
                    ${badgesHTML}
                </div>
            </div>
            
            <div class="farmers__content">
                <h3 class="farmers__name">${farmer.name}</h3>
                
                <div class="farmers__info">
                    <div class="farmers__info-item">
                        <i class="ri-phone-line farmers__info-icon"></i>
                        <span>${farmer.phone}</span>
                    </div>
                    <div class="farmers__info-item">
                        <i class="ri-map-pin-line farmers__info-icon"></i>
                        <span>${farmer.location}</span>
                    </div>
                </div>
                
                <p class="farmers__description">${farmer.description}</p>
                
                <div class="farmers__crops">
                    ${cropsHTML}
                </div>
                
                <div class="farmers__actions">
                    <button class="farmers__btn">
                        <i class="ri-phone-line"></i> Call
                    </button>
                    <button class="farmers__btn farmers__btn--primary">
                        <i class="ri-calendar-line"></i> Schedule
                    </button>
                </div>
            </div>
        `;
        
        farmersContainer.appendChild(farmerCard);
    });
}

/*=============== FILTER FARMERS ===============*/
function filterFarmers(filter = 'all', searchTerm = '') {
    let filtered = farmersData;
    
    // Apply crop filter
    if (filter !== 'all') {
        filtered = filtered.filter(farmer => 
            farmer.crops.includes(filter)
        );
    }
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter(farmer =>
            farmer.name.toLowerCase().includes(term) ||
            farmer.location.toLowerCase().includes(term) ||
            farmer.cropsList.some(crop => crop.toLowerCase().includes(term))
        );
    }
    
    renderFarmers(filtered);
}

/*=============== SEARCH FUNCTIONALITY ===============*/
searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value;
    filterFarmers(currentFilter, searchTerm);
});

/*=============== FILTER BUTTONS FUNCTIONALITY ===============*/
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons
        filterBtns.forEach(b => b.classList.remove('farmers__filter-btn--active'));
        
        // Add active class to clicked button
        btn.classList.add('farmers__filter-btn--active');
        
        // Update current filter
        currentFilter = btn.dataset.filter;
        
        // Filter farmers based on search input value as well
        const searchTerm = searchInput.value;
        filterFarmers(currentFilter, searchTerm);
        
        // Smooth scroll to farmers section
        document.querySelector('#farmers').scrollIntoView({ behavior: 'smooth' });
    });
});

/*=============== UTILITY FUNCTIONS ===============*/
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/*=============== ADD EVENT LISTENERS TO ACTION BUTTONS ===============*/
function addActionListeners() {
    const callBtns = document.querySelectorAll('.farmers__btn:not(.farmers__btn--primary)');
    const scheduleBtns = document.querySelectorAll('.farmers__btn--primary');
    
    callBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.farmers__card');
            const phone = card.querySelector('.farmers__info-item:first-child span').textContent;
            alert(`Calling: ${phone}`);
        });
    });
    
    scheduleBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const card = this.closest('.farmers__card');
            const farmerName = card.querySelector('.farmers__name').textContent;
            const farmerPhone = card.querySelector('.farmers__info-item:first-child span').textContent;
            alert(`Schedule requested for ${farmerName}\nContact: ${farmerPhone}`);
        });
    });
}

/*=============== INITIALIZE ===============*/
// Initial render of all farmers
renderFarmers(farmersData);

// Add action listeners when cards are rendered
addActionListeners();

// Re-add action listeners after each filter/search
const originalRenderFarmers = renderFarmers;
renderFarmers = function(farmers) {
    originalRenderFarmers(farmers);
    addActionListeners();
};
