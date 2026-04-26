import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// --- Leaflet Map Click Handler ---
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

function TouristDashboard() {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');
  const [currentItineraryId, setCurrentItineraryId] = useState(null);

  const [guides, setGuides] = useState([]);
  const [fetchMessage, setFetchMessage] = useState('');
  const [myRequests, setMyRequests] = useState([]);

  // NEW: State to hold the locations the tourist clicks on the map
  const [selectedLocations, setSelectedLocations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const guidesRes = await fetch('http://localhost:5000/api/guide/all', { headers: { 'Authorization': `Bearer ${token}` }});
        const guidesData = await guidesRes.json();
        if (guidesRes.ok) setGuides(guidesData.guides);
      } catch (error) { console.error("Error fetching guides:", error); }

      try {
        const requestsRes = await fetch('http://localhost:5000/api/requests/tourist', { headers: { 'Authorization': `Bearer ${token}` }});
        const requestsData = await requestsRes.json();
        if (requestsRes.ok) setMyRequests(requestsData.requests);
      } catch (error) { console.error("Error fetching my requests:", error); }
    };
    fetchData();
  }, []);

  // Handle map clicks to drop pins
  const handleMapClick = (latlng) => {
    const newLocation = {
      lat: latlng.lat,
      lng: latlng.lng,
      label: `Stop ${selectedLocations.length + 1}`
    };
    setSelectedLocations([...selectedLocations, newLocation]);
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setMessage('Saving trip...');
    const token = localStorage.getItem('token');
    if (!token) return setMessage('❌ Error: You are not logged in!');

    // We will later update the backend to accept these selectedLocations too!
    try {
      const response = await fetch('http://localhost:5000/api/itineraries/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ title, startDate, endDate, locations: selectedLocations }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('✅ Trip saved! You can now request a guide below.');
        const newId = data.itinerary ? data.itinerary.id : data.id;
        setCurrentItineraryId(newId);
        setTitle('');
        setStartDate('');
        setEndDate('');
        // Keep the map pins visible so they know what they just planned!
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error creating trip:", error);
      setMessage('❌ Failed to connect to the server.');
    }
  };

  const handleRequestGuide = async (guideId) => {
    if (!currentItineraryId) {
      alert('⚠️ Please create a trip first before requesting a guide!');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/requests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
        
        {/* THE MAP IS BACK! */}
        <div style={{ marginBottom: '20px' }}>
          <p style={{ margin: '0 0 10px 0', fontSize: '0.9em', color: '#555' }}>
            <em>Click on the map to add destinations to your itinerary!</em>
          </p>
          <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
            <MapContainer center={[7.8731, 80.7718]} zoom={7} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapClickHandler onMapClick={handleMapClick} />
              
              {selectedLocations.map((loc, index) => (
                <Marker key={index} position={[loc.lat, loc.lng]}>
                  <Popup>{loc.label}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          
          {/* Show the selected coordinates as text (optional, but helpful for debugging) */}
          {selectedLocations.length > 0 && (
            <ul style={{ fontSize: '0.85em', color: '#666' }}>
              {selectedLocations.map((loc, i) => (
                <li key={i}>{loc.label}: [{loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}]</li>
              ))}
            </ul>
          )}
        </div>

        {message && <p style={{ fontWeight: 'bold', color: message.includes('✅') ? 'green' : 'red' }}>{message}</p>}

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
            Create Itinerary
          </button>
        </form>
      </div>

      {/* My Bookings Section */}
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
                <div style={{ padding: '5px 10px', borderRadius: '15px', fontWeight: 'bold', color: '#fff', backgroundColor: req.status === 'pending' ? 'orange' : req.status === 'accepted' ? 'green' : 'red' }}>
                  {req.status.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Guides Section */}
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
                  style={{ width: '100%', padding: '8px', backgroundColor: currentItineraryId ? '#007BFF' : '#ccc', color: 'white', border: 'none', borderRadius: '4px', cursor: currentItineraryId ? 'pointer' : 'not-allowed' }}
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