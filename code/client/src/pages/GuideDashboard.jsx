import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Icons fix
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

function GuideDashboard() {
  const [requests, setRequests] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null); // The trip currently being viewed on the map
  const [routePath, setRoutePath] = useState([]);
  const GRAPHHOPPER_API_KEY = 'YOUR_GRAPHHOPPER_API_KEY';

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:5000/api/requests/guide', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setRequests(data.requests);
  };

  // Fetch the road path when the guide clicks "View Route"
  const handleViewRoute = async (trip) => {
    setSelectedTrip(trip);
    if (!trip.places || trip.places.length < 2) {
      setRoutePath([]);
      return;
    }

    const pointsQuery = trip.places.map(p => `point=${p.latitude},${p.longitude}`).join('&');
    const url = `https://graphhopper.com/api/1/route?${pointsQuery}&profile=car&points_encoded=false&key=${GRAPHHOPPER_API_KEY}`;
    
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.paths) {
        const mapped = data.paths[0].points.coordinates.map(c => [c[1], c[0]]);
        setRoutePath(mapped);
      }
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', display: 'flex', gap: '20px' }}>
      
      {/* Left Side: Request List */}
      <div style={{ flex: 1 }}>
        <h3>📩 Trip Requests</h3>
        {requests.map(req => (
          <div key={req.request_id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
            <h4>{req.trip_title}</h4>
            <p><strong>Tourist:</strong> {req.tourist_name}</p>
            <p><strong>Dates:</strong> {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}</p>
            
            <button onClick={() => handleViewRoute(req)} style={{ backgroundColor: '#007BFF', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>
              📍 View Route on Map
            </button>
            
            {req.status === 'pending' && (
              <>
                <button style={{ backgroundColor: 'green', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer' }}>Accept</button>
                <button style={{ backgroundColor: 'red', color: '#fff', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', marginLeft: '5px' }}>Decline</button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Right Side: Read-Only Map */}
      <div style={{ flex: 1, height: '500px', position: 'sticky', top: '20px' }}>
        <h3>🗺️ Route Preview</h3>
        {selectedTrip ? (
          <div style={{ height: '100%', border: '2px solid #007BFF', borderRadius: '8px', overflow: 'hidden' }}>
            <MapContainer center={[selectedTrip.places[0].latitude, selectedTrip.places[0].longitude]} zoom={8} style={{ height: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              
              {routePath.length > 0 && <Polyline positions={routePath} color="blue" weight={4} />}

              {selectedTrip.places.map((p, idx) => (
                <Marker key={p.id} position={[p.latitude, p.longitude]}>
                  <Popup><strong>{idx + 1}. {p.name}</strong></Popup>
                </Marker>
              ))}
            </MapContainer>
            <p style={{ textAlign: 'center', fontWeight: 'bold' }}>Viewing: {selectedTrip.trip_title}</p>
          </div>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee', borderRadius: '8px' }}>
            Select a trip to view the route
          </div>
        )}
      </div>
    </div>
  );
}

export default GuideDashboard;