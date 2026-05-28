// Initialize the map
let map;
let markers = [];

// Color scheme for pollution levels
const pollutionColors = {
    'Low': '#2ecc71',      // Green
    'Moderate': '#f1c40f', // Yellow
    'High': '#e74c3c'      // Red
};

// Initialize the map
function initMap() {
    // Center the map on India
    map = L.map('map').setView([20.5937, 78.9629], 5);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Load initial pollution data
    loadPollutionData();
    
    // Set up WebSocket connection for real-time updates
    setupWebSocket();
}

// Load pollution data from the server
function loadPollutionData() {
    fetch('/api/pollution_data')
        .then(response => response.json())
        .then(data => {
            // Clear existing markers
            markers.forEach(marker => marker.remove());
            markers = [];
            
            // Add new markers
            data.features.forEach(feature => {
                addMarker(feature);
            });
        })
        .catch(error => console.error('Error loading pollution data:', error));
}

// Add a single marker to the map
function addMarker(feature) {
    const coordinates = feature.geometry.coordinates;
    const properties = feature.properties;
    
    // Create marker with custom icon
    const marker = L.circleMarker([coordinates[1], coordinates[0]], {
        radius: 8,
        fillColor: pollutionColors[properties.severity],
        color: '#fff',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
    });

    // Add popup with information
    const popupContent = `
        <div class="marker-popup">
            <h3>${properties.name}</h3>
            <p>Severity: <span class="severity-${properties.severity.toLowerCase()}">${properties.severity}</span></p>
            <div class="pollution-types">
                ${Object.entries(properties.types).map(([type, value]) => 
                    `<p>${type}: ${value}</p>`
                ).join('')}
            </div>
        </div>
    `;

    marker.bindPopup(popupContent);
    marker.addTo(map);
    markers.push(marker);
}

// Set up WebSocket connection for real-time updates
function setupWebSocket() {
    // Create WebSocket connection
    const socket = new WebSocket('ws://' + window.location.host + '/ws/pollution_updates');
    
    // Connection opened
    socket.addEventListener('open', (event) => {
        console.log('WebSocket connection established');
    });
    
    // Listen for messages
    socket.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        console.log('Received update:', data);
        
        // Add new marker for the updated report
        if (data.type === 'new_report') {
            addMarker(data.feature);
        } else if (data.type === 'update_report') {
            // Update existing marker
            updateMarker(data.feature);
        }
    });
    
    // Connection closed
    socket.addEventListener('close', (event) => {
        console.log('WebSocket connection closed');
        // Try to reconnect after 5 seconds
        setTimeout(setupWebSocket, 5000);
    });
    
    // Connection error
    socket.addEventListener('error', (event) => {
        console.error('WebSocket error:', event);
    });
}

// Update an existing marker
function updateMarker(feature) {
    const coordinates = feature.geometry.coordinates;
    const properties = feature.properties;
    
    // Find the marker to update
    const markerIndex = markers.findIndex(marker => {
        const markerLatLng = marker.getLatLng();
        return markerLatLng.lat === coordinates[1] && markerLatLng.lng === coordinates[0];
    });
    
    if (markerIndex !== -1) {
        // Remove old marker
        markers[markerIndex].remove();
        
        // Create new marker with updated data
        const marker = L.circleMarker([coordinates[1], coordinates[0]], {
            radius: 8,
            fillColor: pollutionColors[properties.severity],
            color: '#fff',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        });

        // Add popup with information
        const popupContent = `
            <div class="marker-popup">
                <h3>${properties.name}</h3>
                <p>Severity: <span class="severity-${properties.severity.toLowerCase()}">${properties.severity}</span></p>
                <div class="pollution-types">
                    ${Object.entries(properties.types).map(([type, value]) => 
                        `<p>${type}: ${value}</p>`
                    ).join('')}
                </div>
            </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(map);
        markers[markerIndex] = marker;
    } else {
        // If marker doesn't exist, add a new one
        addMarker(feature);
    }
}

// Add legend to the map
function addLegend() {
    const legend = L.control({position: 'bottomright'});
    
    legend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'info legend');
        const severities = ['Low', 'Moderate', 'High'];
        
        div.innerHTML = '<h4>Pollution Level</h4>';
        
        severities.forEach(severity => {
            div.innerHTML += 
                `<i style="background:${pollutionColors[severity]}"></i> ${severity}<br>`;
        });
        
        return div;
    };
    
    legend.addTo(map);
}

// Initialize map when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    addLegend();
});

// Fetch pollution data from the server
async function fetchPollutionData() {
    try {
        const response = await fetch('/api/pollution_data');
        if (!response.ok) {
            throw new Error('Failed to fetch pollution data');
        }
        const data = await response.json();
        addMarkers(data);
    } catch (error) {
        console.error('Error fetching pollution data:', error);
        showNotification('Failed to load pollution data', 'error');
    }
}

// Add markers to the map
function addMarkers(data) {
    // Clear existing markers
    markers.forEach(marker => marker.remove());
    markers = [];

    data.forEach(point => {
        const marker = L.marker([point.latitude, point.longitude])
            .bindPopup(createPopupContent(point))
            .addTo(map);
        
        markers.push(marker);
    });
}

function createPopupContent(point) {
    const severityClass = getSeverityClass(point.severity);
    const severityText = point.severity.charAt(0).toUpperCase() + point.severity.slice(1);
    
    return `
        <div class="popup-content">
            <h3>${point.location}</h3>
            <p><strong>Type:</strong> ${point.type}</p>
            <p><strong>Level:</strong> ${point.level}</p>
            <p><strong>Pollution Levels:</strong></p>
<ul>
  ${Object.entries(point.types).map(([type, value]) => `<li>${type}: ${value}</li>`).join('')}
</ul>

            <p><strong>Reported:</strong> ${formatDate(point.timestamp)}</p>
            ${point.description ? `<p><strong>Description:</strong> ${point.description}</p>` : ''}
        </div>
    `;
}


// Get severity class based on pollution level
function getSeverityClass(severity) {
    switch (severity.toLowerCase()) {
        case 'high':
            return 'high';
        case 'moderate':
            return 'moderate';
        case 'low':
            return 'low';
        default:
            return 'moderate';
    }
}

// Format date for display
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Refresh map data periodically (every 5 minutes)
setInterval(fetchPollutionData, 5 * 60 * 1000);

// Function to get color based on pollution level
function getPollutionColor(level) {
    switch (level.toLowerCase()) {
        case 'high':
            return '#ff4444';
        case 'moderate':
            return '#ffbb33';
        case 'low':
            return '#00C851';
        default:
            return '#666666';
    }
}

// Function to create a custom icon for markers
function createCustomIcon(pollutionLevel) {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${getPollutionColor(pollutionLevel)}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
}

// Add event listener for the login button
document.querySelector('.login-button').addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = '/login';
}); 