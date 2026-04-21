import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function Home() {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  
  // Filter States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  // --- NEW: Itinerary State ---
  const [itinerary, setItinerary] = useState([]);

  const fetchPlaces = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/places');
      const data = await response.json();
      if (response.ok) setPlaces(data);
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    fetchPlaces(); 
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  // --- NEW: Itinerary Functions ---
  const addToItinerary = (place) => {
    // Check if the place is already in the list so we don't add duplicates!
    if (!itinerary.find(p => p.id === place.id)) {
      setItinerary([...itinerary, place]);
    }
  };

  const removeFromItinerary = (placeId) => {
    // Keep everything EXCEPT the one we are removing
    setItinerary(itinerary.filter(p => p.id !== placeId));
  };

  const categories = ['All', ...new Set(places.map(p => p.category).filter(Boolean))];
  const districts = ['All', ...new Set(places.map(p => p.district).filter(Boolean))];

  const filteredPlaces = places.filter(place => {
    const matchesCategory = selectedCategory === 'All' || place.category === selectedCategory;
    const matchesDistrict = selectedDistrict === 'All' || place.district === selectedDistrict;
    return matchesCategory && matchesDistrict;
  });

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Smart Tourism Map</h2>
        <button onClick={handleLogout} style={{ backgroundColor: 'red', color: 'white', padding: '10px', cursor: 'pointer' }}>Logout</button>
      </div>
      
      {/* The Filtering UI */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '5px' }}>
        <h3>Find Destinations by Interest</h3>
        <label style={{ marginRight: '10px' }}>Category:</label>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ marginRight: '20px', padding: '5px' }}>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <label style={{ marginRight: '10px' }}>District:</label>
        <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)} style={{ padding: '5px' }}>
          {districts.map(dist => <option key={dist} value={dist}>{dist}</option>)}
        </select>
      </div>

      {/* --- NEW: Side-by-Side Layout for Itinerary and Map --- */}
      <div style={{ display: 'flex', gap: '20px' }}>
        
        {/* Left Side: The Itinerary Panel */}
        <div style={{ width: '30%', padding: '15px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#fff' }}>
          <h3>Your Trip Plan</h3>
          {itinerary.length === 0 ? (
            <p style={{ color: 'gray' }}>Click a map pin to add places to your route.</p>
          ) : (
            <ul style={{ paddingLeft: '20px' }}>
              {itinerary.map((item, index) => (
                <li key={item.id} style={{ marginBottom: '10px' }}>
                  <strong>{index + 1}. {item.name}</strong> 
                  <br/>
                  <small>{item.district}</small>
                  <button 
                    onClick={() => removeFromItinerary(item.id)} 
                    style={{ marginLeft: '10px', color: 'white', backgroundColor: '#ff4d4d', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right Side: The Map */}
        <div style={{ width: '70%', height: '600px', border: '2px solid black', borderRadius: '5px', overflow: 'hidden' }}>
          <MapContainer center={[7.8731, 80.7718]} zoom={7} style={{ height: '100%', width: '100%' }}>
            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filteredPlaces.map((place) => (
              <Marker key={place.id} position={[place.latitude, place.longitude]}>
                <Popup>
                  <strong>{place.name}</strong> <br />
                  {place.category} | {place.district} <br />
                  {/* --- NEW: Add to Itinerary Button inside the map popup --- */}
                  <button 
                    onClick={() => addToItinerary(place)}
                    style={{ marginTop: '8px', padding: '5px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                    + Add to Trip
                  </button>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

      </div>
    </div>
  );
}

export default Home;