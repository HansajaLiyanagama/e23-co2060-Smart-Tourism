import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// --- NEW: Routing Component ---
// This component manages the lines on the map
function RoutingMachine({ waypoints }) {
  const map = useMap();

  useEffect(() => {
    if (!map || waypoints.length < 2) return;

    // Initialize the routing control
    const routingControl = L.Routing.control({
      waypoints: waypoints.map(p => L.latLng(p.latitude, p.longitude)),
      lineOptions: {
        styles: [{ color: '#3f51b5', weight: 4 }]
      },
      addWaypoints: false, // Prevents user from dragging the line
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false // We hide the text instructions to keep UI clean
    }).addTo(map);

    // Cleanup: Remove the lines when the itinerary changes or component unmounts
    return () => map.removeControl(routingControl);
  }, [map, waypoints]);

  return null;
}

function Home() {
  const navigate = useNavigate();
  const [places, setPlaces] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');

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
    if (!token) { navigate('/'); return; }
    fetchPlaces(); 
  }, [navigate]);

  const addToItinerary = (place) => {
    if (!itinerary.find(p => p.id === place.id)) {
      setItinerary([...itinerary, place]);
    }
  };

  const removeFromItinerary = (placeId) => {
    setItinerary(itinerary.filter(p => p.id !== placeId));
  };

  const filteredPlaces = places.filter(place => {
    const matchesCategory = selectedCategory === 'All' || place.category === selectedCategory;
    const matchesDistrict = selectedDistrict === 'All' || place.district === selectedDistrict;
    return matchesCategory && matchesDistrict;
  });

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Smart Tourism Plan</h2>
        <button onClick={() => { localStorage.removeItem('token'); navigate('/'); }} style={{ backgroundColor: 'red', color: 'white', padding: '10px' }}>Logout</button>
      </div>
      
      {/* Filters */}
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '5px' }}>
        <h3>Filters</h3>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ marginRight: '10px' }}>
          {['All', ...new Set(places.map(p => p.category).filter(Boolean))].map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <select value={selectedDistrict} onChange={(e) => setSelectedDistrict(e.target.value)}>
          {['All', ...new Set(places.map(p => p.district).filter(Boolean))].map(dist => <option key={dist} value={dist}>{dist}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        {/* Itinerary Panel */}
        <div style={{ width: '30%', padding: '15px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>Itinerary</h3>
          {itinerary.length === 0 ? <p>Add destinations to see the route!</p> : (
            <ul>
              {itinerary.map((item, idx) => (
                <li key={item.id} style={{ marginBottom: '5px' }}>
                  {idx + 1}. {item.name} 
                  <button onClick={() => removeFromItinerary(item.id)} style={{ marginLeft: '5px', color: 'red' }}>×</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Map Container */}
        <div style={{ width: '70%', height: '550px', border: '2px solid black' }}>
          <MapContainer center={[7.8731, 80.7718]} zoom={7} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {/* Draw markers for all filtered places */}
            {filteredPlaces.map((place) => (
              <Marker key={place.id} position={[place.latitude, place.longitude]}>
                <Popup>
                  <strong>{place.name}</strong><br/>
                  <button onClick={() => addToItinerary(place)}>Add to Route</button>
                </Popup>
              </Marker>
            ))}

            {/* --- THE ROUTE LINES COMPONENT --- */}
            <RoutingMachine waypoints={itinerary} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}

export default Home;