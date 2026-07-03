import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for missing Leaflet marker icons in React
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

function TouristDashboard() {
  // Trip Creation State
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [currentItineraryId, setCurrentItineraryId] = useState(null);

  // Dashboard Data State
  const [guides, setGuides] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [fetchMessage, setFetchMessage] = useState('');
  
  // Map & Places State
  const [allPlaces, setAllPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedLocations, setSelectedLocations] = useState([]);

  // GraphHopper States
  const [totalDistance, setTotalDistance] = useState(0);
  const [routePath, setRoutePath] = useState([]); 

  // Replace this with your actual GraphHopper API key
  const GRAPHHOPPER_API_KEY = '2572c6b5-bf00-43a3-b324-7d65f95e8200'; 

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      // 1. Fetch Places
      try {
        const placesRes = await fetch(`${import.meta.env.VITE_API_URL}/api/places`);
        const placesData = await placesRes.json();
        if (placesRes.ok) {
          setAllPlaces(placesData);
          setFilteredPlaces(placesData);
        }
      } catch (error) { console.error("Error fetching places:", error); }

      // 2. Fetch Guides
      try {
        const guidesRes = await fetch(`${import.meta.env.VITE_API_URL}/api/guide/all`, { 
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const guidesData = await guidesRes.json();
        if (guidesRes.ok) setGuides(guidesData.guides);
      } catch (error) { 
        console.error("Error fetching guides:", error); 
        setFetchMessage('Could not load guides.');
      }

      // 3. Fetch My Bookings
      try {
        const requestsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/tourist`, { 
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const requestsData = await requestsRes.json();
        if (requestsRes.ok) setMyRequests(requestsData.requests);
      } catch (error) { console.error("Error fetching my requests:", error); }
    };
    fetchData();
  }, []);

  // Fetch Route from GraphHopper whenever locations change
  useEffect(() => {
    const fetchRoute = async () => {
      if (selectedLocations.length < 2) {
        setTotalDistance(0);
        setRoutePath([]);
        return;
      }

      // Format points for the GraphHopper API (point=lat,lng&point=lat,lng...)
      const pointsQuery = selectedLocations
        .map(loc => `point=${loc.latitude},${loc.longitude}`)
        .join('&');

      const url = `https://graphhopper.com/api/1/route?${pointsQuery}&profile=car&locale=en&calc_points=true&points_encoded=false&key=${GRAPHHOPPER_API_KEY}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.paths && data.paths.length > 0) {
          // GraphHopper returns distance in meters, convert to km
          const distanceKm = (data.paths[0].distance / 1000).toFixed(2);
          setTotalDistance(distanceKm);

          // GraphHopper returns coordinates as [longitude, latitude], Leaflet needs [latitude, longitude]
          const mappedPath = data.paths[0].points.coordinates.map(coord => [coord[1], coord[0]]);
          setRoutePath(mappedPath);
        }
      } catch (error) {
        console.error("Error fetching route from GraphHopper:", error);
      }
    };

    fetchRoute();
  }, [selectedLocations]);

  // Handle Category Filtering
  const handleFilter = (category) => {
    setActiveCategory(category);
    if (category === 'all') {
      setFilteredPlaces(allPlaces);
    } else {
      setFilteredPlaces(allPlaces.filter(place => place.category === category));
    }
  };

  // Map Interaction: Add Place
  const handleAddLocation = (place) => {
    if (!selectedLocations.some(loc => loc.id === place.id)) {
      setSelectedLocations([...selectedLocations, place]);
    }
  };

  // Map Interaction: Remove Place
  const handleRemoveLocation = (placeId) => {
    setSelectedLocations(selectedLocations.filter(loc => loc.id !== placeId));
  };

  // Form Submit: Create Trip
  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setMessage('Saving trip...');
    const token = localStorage.getItem('token');
    if (!token) return setMessage('❌ Error: You are not logged in!');

    const placeIds = selectedLocations.map(loc => loc.id);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/itineraries/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ title, startDate, endDate, places: placeIds }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('✅ Trip saved! You can now request a guide below.');
        const newId = data.itinerary ? data.itinerary.id : data.id;
        setCurrentItineraryId(newId);
        setTitle(''); 
        setStartDate(''); 
        setEndDate(''); 
        setSelectedLocations([]);
        setRoutePath([]);
        setTotalDistance(0);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error creating trip:", error);
      setMessage('❌ Failed to connect to the server.');
    }
  };

  // Request a Guide
  const handleRequestGuide = async (guideId) => {
    if (!currentItineraryId) {
      alert('⚠️ Please create a trip first before requesting a guide!');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/requests/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ itineraryId: currentItineraryId, guideId: guideId })
      });

      if (response.ok) {
        alert('✅ Request sent to the guide successfully!');
        window.location.reload(); 
      } else {
        const data = await response.json();
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error sending request:', error);
      alert('❌ Failed to send request.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '0 20px' }}>
      <h2 style={{ textAlign: 'center' }}>🌍 Tourist Dashboard</h2>
      
      {/* 1. Trip Creation Form with Map */}
      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '40px', backgroundColor: '#f9f9f9' }}>
        <h3 style={{ marginTop: 0 }}>Plan a New Trip</h3>
        
        <div style={{ marginBottom: '20px' }}>
          
          {/* Category Filters */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            {['all', 'surfing', 'culture', 'wildlife'].map(cat => (
              <button 
                key={cat} 
                onClick={() => handleFilter(cat)}
                style={{ 
                  padding: '8px 16px', 
                  borderRadius: '20px', 
                  border: '1px solid #007BFF', 
                  backgroundColor: activeCategory === cat ? '#007BFF' : 'white', 
                  color: activeCategory === cat ? 'white' : '#007BFF', 
                  cursor: 'pointer', 
                  textTransform: 'capitalize', 
                  fontWeight: 'bold' 
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Map Container */}
          <div style={{ height: '350px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
            <MapContainer center={[7.8731, 80.7718]} zoom={7} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              
              {/* Using GraphHopper Road Path */}
              {routePath.length > 0 && (
                <Polyline positions={routePath} color="#007BFF" weight={5} opacity={0.8} />
              )}

              {filteredPlaces.map((place) => (
                <Marker key={place.id} position={[place.latitude, place.longitude]}>
                  <Popup>
                    <div style={{ textAlign: 'center' }}>
                      <h4 style={{ margin: '0 0 5px 0' }}>{place.name}</h4>
                      <p style={{ margin: '0 0 10px 0', fontSize: '0.85em', color: '#555' }}>{place.description}</p>
                      <button 
                        onClick={() => handleAddLocation(place)}
                        style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Add to Trip
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          
          {/* Selected Locations & Distance */}
          {selectedLocations.length > 0 && (
            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>📍 Destinations Selected:</strong>
                <span style={{ backgroundColor: '#007BFF', color: 'white', padding: '5px 10px', borderRadius: '15px', fontSize: '0.9em', fontWeight: 'bold' }}>
                  Driving Distance: {totalDistance} km
                </span>
              </div>
              <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px' }}>
                {selectedLocations.map((loc, index) => (
                  <li key={loc.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span><strong>{index + 1}.</strong> {loc.name}</span>
                    <span onClick={() => handleRemoveLocation(loc.id)} style={{ color: 'red', cursor: 'pointer', fontWeight: 'bold' }}>✖</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {message && <p style={{ fontWeight: 'bold', color: message.includes('✅') ? 'green' : 'red' }}>{message}</p>}

        {/* Trip Form */}
        <form onSubmit={handleCreateTrip}>
          <div style={{ marginBottom: '15px' }}>
            <label>Trip Title:</label> <br />
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} required />
          </div>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label>Start Date:</label> <br />
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} required />
            </div>
            <div style={{ flex: 1 }}>
              <label>End Date:</label> <br />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} required />
            </div>
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Save Trip & Locations
          </button>
        </form>
      </div>

      {/* 2. My Bookings Section */}
      <div style={{ marginBottom: '40px' }}>
        <h3>🏷️ My Bookings</h3>
        {myRequests.length === 0 ? (
          <p>You haven't requested any guides yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {myRequests.map((req) => (
              <div key={req.request_id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0' }}>{req.trip_title}</h4>
                  <p style={{ margin: '0', fontSize: '0.9em' }}><strong>Guide:</strong> {req.guide_name}</p>
                </div>
                <div style={{ 
                  padding: '5px 10px', 
                  borderRadius: '15px', 
                  fontWeight: 'bold', 
                  color: '#fff',
                  backgroundColor: req.status === 'pending' ? 'orange' : req.status === 'accepted' ? 'green' : 'red' 
                }}>
                  {req.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Available Guides Section */}
      <div>
        <h3>🗺️ Available Tour Guides</h3>
        {fetchMessage && <p>{fetchMessage}</p>}
        {guides.length === 0 && !fetchMessage ? (
          <p>No guides available right now.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {guides.map((guide) => (
              <div key={guide.user_id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#007BFF' }}>{guide.full_name}</h4>
                <p style={{ margin: '0 0 5px 0', fontStyle: 'italic', fontSize: '0.9em' }}>{guide.bio || "No bio available."}</p>
                <p style={{ margin: '0 0 5px 0' }}><strong>License:</strong> {guide.license_number || "N/A"}</p>
                <p style={{ margin: '0 0 15px 0' }}><strong>Rate:</strong> ${guide.hourly_rate}/hr</p>
                
                <button 
                  onClick={() => handleRequestGuide(guide.user_id)}
                  style={{ 
                    width: '100%', padding: '8px', 
                    backgroundColor: currentItineraryId ? '#007BFF' : '#ccc', 
                    color: 'white', border: 'none', borderRadius: '4px', 
                    cursor: currentItineraryId ? 'pointer' : 'not-allowed' 
                  }}
                  title={!currentItineraryId ? "Create a trip first!" : "Request this guide"}
                >
                  Request Guide
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TouristDashboard;