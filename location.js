// Geolocation and mapping services helper for EcoSort

// Haversine formula to compute distance in km
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Get user's current GPS position
export function getUserLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by your browser."));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                let msg = "Location permission denied.";
                if (error.code === error.POSITION_UNAVAILABLE) msg = "Location info unavailable.";
                if (error.code === error.TIMEOUT) msg = "Location request timed out.";
                reject(new Error(msg));
            },
            {
                enableHighAccuracy: true,
                timeout: 8000,
                maximumAge: 0
            }
        );
    });
}

// Query Overpass API for recycling centers in a 5km radius
export async function fetchNearbyStations(lat, lon) {
    // Overpass API interpreter endpoint
    const url = "https://overpass-api.de/api/interpreter";
    
    // Query search for amenity=recycling within 5000m around lat, lon
    const query = `[out:json][timeout:25];
(
  node["amenity"="recycling"](around:5000,${lat},${lon});
  way["amenity"="recycling"](around:5000,${lat},${lon});
  relation["amenity"="recycling"](around:5000,${lat},${lon});
);
out center;`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "data=" + encodeURIComponent(query)
    });

    if (!response.ok) {
        throw new Error("Failed to contact Overpass API service.");
    }

    const data = await response.json();
    return formatOverpassResults(data.elements, lat, lon);
}

// Search Nominatim API by city/region name
export async function searchStationsByCity(cityName) {
    const queryStr = encodeURIComponent(`recycling in ${cityName}`);
    const url = `https://nominatim.openstreetmap.org/search?q=${queryStr}&format=json&limit=12&addressdetails=1`;

    const response = await fetch(url, {
        headers: {
            "User-Agent": "EcoSort-Recycle-Finder/1.0" // Required by Nominatim usage policy
        }
    });

    if (!response.ok) {
        throw new Error("Failed to contact OpenStreetMap Nominatim search service.");
    }

    const data = await response.json();
    return formatNominatimResults(data);
}

// Map Overpass API nodes/ways into usable stations list
function formatOverpassResults(elements, userLat, userLon) {
    if (!elements || elements.length === 0) return [];

    return elements
        .map((el) => {
            // center coordinates are stored in 'lat'/'lon' for nodes, or inside 'center' for ways/relations
            const lat = el.lat || (el.center && el.center.lat);
            const lon = el.lon || (el.center && el.center.lon);
            
            if (!lat || !lon) return null;

            const name = el.tags.name || el.tags.operator || `Recycling Drop-off (${el.tags.recycling_type || 'General'})`;
            const distance = calculateDistance(userLat, userLon, lat, lon);
            
            // Collect material tags if available
            const materials = [];
            for (const key in el.tags) {
                if (key.startsWith("recycling:") && el.tags[key] === "yes") {
                    materials.push(key.replace("recycling:", ""));
                }
            }

            const address = el.tags["addr:street"] 
                ? `${el.tags["addr:housenumber"] || ""} ${el.tags["addr:street"]}, ${el.tags["addr:city"] || ""}`.trim()
                : el.tags.description || "No specific address info.";

            return {
                name,
                lat,
                lon,
                distance,
                address,
                materials: materials.join(", "),
                mapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
            };
        })
        .filter(station => station !== null)
        .sort((a, b) => a.distance - b.distance);
}

// Map Nominatim API results
function formatNominatimResults(elements) {
    if (!elements || elements.length === 0) return [];

    return elements.map((el) => {
        const lat = parseFloat(el.lat);
        const lon = parseFloat(el.lon);
        const fullName = el.display_name;
        const parts = fullName.split(", ");
        const name = parts[0] || "Recycling Facility";
        const address = parts.slice(1, 4).join(", ") || fullName;

        return {
            name,
            lat,
            lon,
            distance: null, // Since we don't have user's coordinate relative to this center
            address,
            materials: "General waste recycling",
            mapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`
        };
    });
}
