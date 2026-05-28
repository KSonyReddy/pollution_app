// Initialize the map centered on Telangana
const map = L.map('map').setView([17.385, 78.486], 7);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(map);

const getColor = (level) => {
    switch (level) {
        case "High": return "red";
        case "Moderate": return "blue";
        case "Low": return "green";
        default: return "gray";
    }
};

const getLevel = (avg) => {
    if (avg > 70) return "High";
    if (avg > 40) return "Moderate";
    return "Low";
};

const createPopup = (district) => {
    const avg = (district.air + district.water + district.noise) / 3;
    const level = getLevel(avg);
    return `
        <strong>${district.district}</strong><br>
        Air Pollution: ${district.air}%<br>
        Water Pollution: ${district.water}%<br>
        Noise Pollution: ${district.noise}%<br>
        Pollution Level: <b style="color:${getColor(level)}">${level}</b>
    `;
};

fetch('/pollution_data?' + new Date().getTime())
    .then(response => response.json())
    .then(data => {
        data.forEach(district => {
            const avg = (district.air + district.water + district.noise) / 3;
            const level = getLevel(avg);
            const marker = L.circleMarker([district.lat, district.lon], {
                color: getColor(level),
                radius: 10,
                fillOpacity: 0.7
            }).addTo(map);
            marker.bindPopup(createPopup(district));
        });
    });

const legend = L.control({ position: 'bottomright' });
legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');
    const levels = ['Low', 'Moderate', 'High'];
    const colors = ['green', 'blue', 'red'];
    for (let i = 0; i < levels.length; i++) {
        div.innerHTML +=
            '<i style="background:' + colors[i] + '"></i> ' +
            levels[i] + '<br>';
    }
    return div;
};
legend.addTo(map);


// Function to update district details in the info panel
function updateDistrictDetails(districtName, districtInfo) {
    const districtDetails = document.getElementById('district-details');
    
    districtDetails.innerHTML = `
        <h3>${districtName}</h3>
        <div class="district-stats">
            <div class="stat-item">
                <span class="stat-label">Pollution Level:</span>
                <span class="severity ${districtInfo.severity.toLowerCase()}">${districtInfo.severity}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Pollution Type:</span>
                <span class="stat-value">${districtInfo.pollution_type}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Reports:</span>
                <span class="stat-value">${districtInfo.reports}</span>
            </div>
        </div>
    `;
}

// Function to update reports summary
function updateReportsSummary() {
    // Count reports by severity
    const severityCounts = {
        high: 0,
        moderate: 0,
        low: 0
    };
    
    // Count reports from district data
    Object.values(districtData).forEach(district => {
        if (district.severity.toLowerCase() === 'high') {
            severityCounts.high += district.reports;
        } else if (district.severity.toLowerCase() === 'moderate') {
            severityCounts.moderate += district.reports;
        } else if (district.severity.toLowerCase() === 'low') {
            severityCounts.low += district.reports;
        }
    });
    
    // Update the summary stats
    document.getElementById('total-reports').textContent = 
        severityCounts.high + severityCounts.moderate + severityCounts.low;
    document.getElementById('high-severity').textContent = severityCounts.high;
    document.getElementById('moderate-severity').textContent = severityCounts.moderate;
    document.getElementById('low-severity').textContent = severityCounts.low;
}

// Function to add district markers to the map
function addDistrictMarkers() {
    // Clear existing markers
    markers.forEach(marker => marker.remove());
    markers = [];
    
    // Add markers for each district
    Object.entries(districtData).forEach(([districtName, districtInfo]) => {
        // Get district coordinates (this would normally come from a GeoJSON file)
        // For now, we'll use approximate coordinates for Telangana districts
        const coordinates = getDistrictCoordinates(districtName);
        
        if (coordinates) {
            const marker = L.marker(coordinates, {
                icon: createCustomIcon(districtInfo.severity)
            });
            
            marker.bindPopup(createPopupContent(districtName, districtInfo));
            marker.on('click', () => {
                updateDistrictDetails(districtName, districtInfo);
            });
            
            marker.addTo(map);
            markers.push(marker);
        }
    });
}

// Function to get approximate coordinates for Telangana districts
function getDistrictCoordinates(districtName) {
    // This would normally come from a GeoJSON file
    // For now, we'll use approximate coordinates for Telangana districts
    const coordinates = {
        'Adilabad': [19.6657, 78.5322],
        'Bhadradri Kothagudem': [17.5517, 80.6197],
        'Hyderabad': [17.3850, 78.4867],
        'Jagtial': [18.8000, 78.9167],
        'Jangaon': [17.7167, 79.1833],
        'Jayashankar Bhupalpally': [18.0500, 79.8167],
        'Jogulamba Gadwal': [16.2333, 77.8000],
        'Kamareddy': [18.3167, 78.3333],
        'Karimnagar': [18.4333, 79.1500],
        'Khammam': [17.2500, 80.1500],
        'Komaram Bheem Asifabad': [19.1167, 79.2833],
        'Mahabubabad': [17.6000, 80.0167],
        'Mahabubnagar': [16.7333, 77.9833],
        'Mancherial': [18.8667, 79.4667],
        'Medak': [18.0333, 78.2667],
        'Medchal–Malkajgiri': [17.6333, 78.4833],
        'Mulugu': [17.9333, 80.1833],
        'Nagarkurnool': [16.4833, 78.3167],
        'Nalgonda': [17.0500, 79.2667],
        'Narayanpet': [16.7500, 77.4833],
        'Nirmal': [19.1000, 78.3500],
        'Nizamabad': [18.6833, 78.1167],
        'Peddapalli': [18.6167, 79.3667],
        'Rajanna Sircilla': [18.3833, 78.8333],
        'Rangareddy': [17.3667, 78.5667],
        'Sangareddy': [17.6333, 78.0833],
        'Siddipet': [18.1000, 78.8500],
        'Suryapet': [17.1333, 79.6167],
        'Vikarabad': [17.3333, 77.9000],
        'Wanaparthy': [16.3667, 78.0667],
        'Warangal Rural': [17.9667, 79.6000],
        'Warangal Urban': [17.9667, 79.6000],
        'Yadadri Bhuvanagiri': [17.6167, 78.8833]
    };
    
    return coordinates[districtName] || null;
}

// Function to update district data with user reports
function updateDistrictDataWithReports() {
    // This function would normally update the district data based on user reports
    // For now, we'll just use the initial data
    // In a real application, this would aggregate reports by district and update the severity
    
    // Example of how this might work:
     reports.forEach(report => {
     const district = determineDistrictFromLocation(report.location);
       if (district && districtData[district]) {
        districtData[district].reports++;
    //         // Update severity based on report severity
    if (report.severity === 'high' && districtData[district].severity !== 'high') {
        districtData[district].severity = 'high';
         } else if (report.severity === 'moderate' && districtData[district].severity === 'low') {
            districtData[district].severity = 'moderate';
             }
         }
     });
}
     

// Function to update district info in the info panel
function updateDistrictInfo(district, data) {
    const infoPanel = document.getElementById('district-info');
    if (!infoPanel) return;

    let content = `
        <h2>${district}</h2>
        <div class="severity-indicator ${data.severity}">Overall Severity: ${data.severity.toUpperCase()}</div>
        <div class="pollution-types">
            <h3>Pollution Types:</h3>`;

    // Add each pollution type with its severity and value
    for (const [type, info] of Object.entries(data.pollution_types)) {
        content += `
            <div class="pollution-type">
                <span class="type-name">${type}</span>
                <span class="severity ${info.severity}">${info.severity.toUpperCase()}</span>
                <span class="value">${info.value} ${info.unit}</span>
            </div>`;
    }

    content += `
        </div>
        <div class="reports-count">Total Reports: ${data.reports}</div>`;

    infoPanel.innerHTML = content;
}

// Function to update pollution chart
function updatePollutionChart(data) {
    const ctx = document.getElementById('pollution-chart');
    if (!ctx) return;

    // Destroy existing chart if it exists
    if (window.pollutionChart) {
        window.pollutionChart.destroy();
    }

    // Prepare data for the chart
    const labels = Object.keys(data.pollution_types);
    const values = Object.values(data.pollution_types).map(info => info.value);
    const backgroundColors = Object.values(data.pollution_types).map(info => getColor(info.severity));

    // Create new chart
    window.pollutionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Pollution Levels',
                data: values,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Value'
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Pollution Levels by Type'
                }
            }
        }
    });
}

// Initialize the map when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Get district data from the window object
    if (typeof window.districtData !== 'undefined') {
        districtData = window.districtData;
        
        // Check if there's a message indicating no reports
        if (districtData.message) {
            // Display message in the info panel
            const infoPanel = document.getElementById('district-info');
            if (infoPanel) {
                infoPanel.innerHTML = `
                    <h2>No Reports Available</h2>
                    <p>${districtData.message}</p>
                    <p>Please submit pollution reports to see data on the map.</p>
                `;
            }
            
            // Display message in the reports summary
            document.getElementById('total-reports').textContent = '0';
            document.getElementById('high-severity').textContent = '0';
            document.getElementById('moderate-severity').textContent = '0';
            document.getElementById('low-severity').textContent = '0';
            
            // Still add markers for districts, but with default values
            addDistrictMarkers();
            return;
        }
    }
    
    // Get reports data from the window object
    if (typeof window.reports !== 'undefined') {
        reports = window.reports;
    }
    
    // Update district data with user reports
    updateDistrictDataWithReports();
    
    // Add district markers to the map
    addDistrictMarkers();
    
    // Update reports summary
    updateReportsSummary();
    
    // Set up event listener for map clicks to clear district details
    map.on('click', () => {
        document.getElementById('district-details').innerHTML = '<p>Click on a district to view details</p>';
    });
}); 