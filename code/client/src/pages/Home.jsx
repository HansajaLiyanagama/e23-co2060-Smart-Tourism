import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function Home() {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  
  // --- NEW: Filter States ---
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  // Form states (kept exactly the same for now)
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  const fetchPlaces = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/places');
      const data = await response.json();
      if (response.ok) {
        setPlaces(data);
      }
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

  const handleAddPlace = async (e) => {
    // ... (Keep your existing handleAddPlace logic exactly the same)
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return alert('You must be logged in to add a place!');

    try {
      const response = await fetch('http://localhost:5000/api/places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, latitude: parseFloat(latitude), longitude: parseFloat(longitude) }),
      });
      if (response.ok) {
        alert('Place added successfully!');
        setName(''); setLatitude(''); setLongitude('');
        fetchPlaces(); 
      }
    } catch (error) {
      console.error("Error saving place:", error);
    }
  };

  // --- NEW: Generate unique lists for the dropdowns ---
  // We use Set() to remove duplicates (e.g., if two places are in 'Galle', 'Galle' only shows once)
  const categories = ['All', ...new Set(places.map(p => p.category).filter(Boolean))];
  const districts = ['All', ...new Set(places.map(p => p.district).filter(Boolean))];

  // --- NEW: Filter the places before drawing them on the map ---
  const filteredPlaces = places.filter(place => {
    const matchesCategory = selectedCategory === 'All' || place.category === selectedCategory;
    const matchesDistrict = selectedDistrict === 'All' || place.district === selectedDistrict;
    return matchesCategory && matchesDistrict;
  });

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Smart Tourism Map</h2>
        <button onClick={handleLogout} style={{ backgroundColor: 'red', color: 'white', padding: '10px' }}>Logout</button>
      </div>
      
      {/* --- NEW: The Filtering UI --- */}
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

      {/* The Map uses 'filteredPlaces' instead of 'places' now! */}
      <div style={{ height: '600px', width: '100%', border: '2px solid black' }}>
        <MapContainer center={[7.8731, 80.7718]} zoom={7} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {filteredPlaces.map((place) => (
            <Marker key={place.id} position={[place.latitude, place.longitude]}>
              <Popup>
                <strong>{place.name}</strong> <br />
                {place.category} | {place.district}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default Home;