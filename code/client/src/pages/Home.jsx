import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// CRITICAL: Leaflet CSS must be imported for the map to render correctly
import 'leaflet/dist/leaflet.css';

function Home() {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
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

    fetchPlaces();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Smart Tourism Map</h2>
      <p>Explore our database of destinations.</p>
      
      <hr />
      
      {/* The map container MUST have a defined height, or it will collapse to 0 pixels */}
      <div style={{ height: '600px', width: '100%', border: '2px solid black' }}>
        <MapContainer 
          center={[7.8731, 80.7718]} // Coordinates centering on Sri Lanka
          zoom={7} 
          style={{ height: '100%', width: '100%' }}
        >
          {/* The visual map layer (OpenStreetMap) */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Loop through the database places and drop a pin for each */}
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