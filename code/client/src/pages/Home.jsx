import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function Home() {
  const navigate = useNavigate(); // Initialize navigation
  const [places, setPlaces] = useState([]);
  
  // New state variables to hold the form input
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // New Logout Function
  const handleLogout = () => {
    // Remove the VIP pass
    localStorage.removeItem('token');

    // Teleport back to the login screen
    navigate('/')
  };

  // We moved fetchPlaces outside the useEffect so we can call it again later!
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
    fetchPlaces(); // Load places when the page first opens
  }, []);

  // Function to handle the new form submission
  const handleAddPlace = async (e) => {
    e.preventDefault();

    // 1. Get the VIP pass (JWT) from the browser's memory
    const token = localStorage.getItem('token');

    if (!token) {
      alert('You must be logged in to add a place!');
      return;
    }

    try {
      // 2. Send the secure POST request to your Node.js server
      const response = await fetch('http://localhost:5000/api/places', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // <--- THIS IS THE MAGIC KEY
        },
        // We use parseFloat to ensure the coordinates are sent as numbers, not strings
        body: JSON.stringify({ 
          name: name, 
          latitude: parseFloat(latitude), 
          longitude: parseFloat(longitude) 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Place added successfully!');
        
        // 3. Clear the form boxes so they are empty again
        setName('');
        setLatitude('');
        setLongitude('');
        
        // 4. Re-fetch the database to instantly drop the new pin on the map!
        fetchPlaces(); 
      } else {
        alert(data.message || 'Failed to add place');
      }
    } catch (error) {
      console.error("Error saving place:", error);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Smart Tourism Map</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <button onClick={handleLogout} style={{backgroundColor: 'red', color: 'white', padding: '10px'}}>
        Logout
      </button>
    </div>
      
      {/* THE NEW INPUT FORM */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
        <h3>Add a New Destination</h3>
        <form onSubmit={handleAddPlace}>
          <input 
            type="text" 
            placeholder="Place Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            style={{ marginRight: '10px' }}
          />
          <input 
            type="number" 
            step="any" 
            placeholder="Latitude" 
            value={latitude} 
            onChange={(e) => setLatitude(e.target.value)} 
            required 
            style={{ marginRight: '10px' }}
          />
          <input 
            type="number" 
            step="any" 
            placeholder="Longitude" 
            value={longitude} 
            onChange={(e) => setLongitude(e.target.value)} 
            required 
            style={{ marginRight: '10px' }}
          />
          <button type="submit">Drop Pin</button>
        </form>
      </div>

      {/* THE MAP */}
      <div style={{ height: '600px', width: '100%', border: '2px solid black' }}>
        <MapContainer center={[7.8731, 80.7718]} zoom={7} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {places.map((place) => (
            <Marker key={place.id} position={[place.latitude, place.longitude]}>
              <Popup>
                <strong>{place.name}</strong> <br />
                Ready for tourists!
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

export default Home;