import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlace } from '../context/PlaceContext';
import { itineraryService, placeService, bookingService } from '../services';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './ItineraryPage.css';

// GraphHopper free demo key — replace with your own from graphhopper.com
const GRAPHHOPPER_API_KEY = 'f8512521-29f8-40cc-ad0a-64bed3f3c40b';

const fetchGraphHopperRoute = async (coordPairs) => {
  if (coordPairs.length < 2) return null;
  const pointsParam = coordPairs
    .map(([lat, lng]) => `point=${lat},${lng}`)
    .join('&');
  const url = `https://graphhopper.com/api/1/route?${pointsParam}&vehicle=car&locale=en&calc_points=true&instructions=false&key=${GRAPHHOPPER_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('GraphHopper request failed');
  const data = await res.json();
  if (!data.paths || !data.paths.length) throw new Error('No route found');
  const path = data.paths[0];
  // Decode the encoded polyline points
  const points = decodePolyline(path.points);
  return {
    points,
    distanceKm: (path.distance / 1000).toFixed(1),
    durationMin: Math.round(path.time / 60000),
  };
};

// Google-style encoded polyline decoder
const decodePolyline = (encoded) => {
  const poly = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let b, shift = 0, result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5; } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : result >> 1;
    poly.push([lat / 1e5, lng / 1e5]);
  }
  return poly;
};

const PRICE_PER_KM = 120; // LKR per km (mock rate)

// Fix for default Leaflet marker icons in React
let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const ItineraryPage = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { places } = usePlace();
  const navigate = useNavigate();

  // Core State
  const [itineraries, setItineraries] = useState([]);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newItinerary, setNewItinerary] = useState({ title: '', startDate: '', endDate: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availablePlaces, setAvailablePlaces] = useState([]);

  // UI State
  const [showAddPlaceDropdown, setShowAddPlaceDropdown] = useState(false);
  const [searchPlaceTerm, setSearchPlaceTerm] = useState('');

  // GraphHopper Route State
  const [ghRoute, setGhRoute] = useState(null);
  const [ghLoading, setGhLoading] = useState(false);
  const [ghError, setGhError] = useState('');

  const loadPlaces = useCallback(async () => {
    try {
      if (places && places.length > 0) {
        setAvailablePlaces(places);
      } else {
        const response = await placeService.getAllPlaces();
        setAvailablePlaces(response.data.data || []);
      }
    } catch (err) {
      console.error('Error loading places:', err);
    }
  }, [places]);

  const fetchItineraries = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await itineraryService.getUserItineraries(user.id);
      const data = response.data.data || [];
      setItineraries(data);
      
      // Update selected itinerary with fresh data from backend
      if (selectedItinerary) {
        const updated = data.find(it => it.id === selectedItinerary.id);
        if (updated) setSelectedItinerary(updated);
      } else if (data.length > 0) {
        setSelectedItinerary(data[0]);
      }
    } catch (err) {
      setError('Failed to load itineraries');
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedItinerary]);

  useEffect(() => {
    if (user && user.role === 'guide') {
      navigate('/dashboard');
      return;
    }
    fetchItineraries();
    loadPlaces();

    const placeToAdd = searchParams.get('add');
    if (placeToAdd) {
      setSuccess('Select an itinerary to add this place');
    }
  }, [user, navigate, loadPlaces]); // Note: fetchItineraries excluded to prevent loops

  const handleCreateItinerary = async (e) => {
    e.preventDefault();
    if (!newItinerary.title) return setError('Please enter a title');

    try {
      const response = await itineraryService.createItinerary({
        tourist_id: user.id,
        title: newItinerary.title,
        start_date: newItinerary.startDate || null,
        end_date: newItinerary.endDate || null
      });
      const created = response.data.itinerary || response.data.data;
      setItineraries([...itineraries, created]);
      setSelectedItinerary(created);
      setNewItinerary({ title: '', startDate: '', endDate: '' });
      setSuccess('Itinerary created successfully!');
      
      const placeToAddId = searchParams.get('add');
      if (placeToAddId) handleAddPlaceToItinerary(created.id, parseInt(placeToAddId));
    } catch (err) {
      setError('Failed to create itinerary');
    }
  };

  const handleAddPlaceToItinerary = async (itineraryId, placeId) => {
    try {
      await itineraryService.addPlaceToItinerary(itineraryId, placeId);
      setSuccess('Place added to itinerary!');
      setShowAddPlaceDropdown(false);
      setSearchPlaceTerm('');
      fetchItineraries();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add place');
    }
  };

  const handleRemovePlace = async (itineraryId, placeId) => {
    try {
      await itineraryService.removePlaceFromItinerary(itineraryId, placeId);
      setSuccess('Place removed');
      fetchItineraries();
    } catch (err) {
      setError('Failed to remove place');
    }
  };

  const handleDeleteItinerary = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await itineraryService.deleteItinerary(id);
        setItineraries(itineraries.filter(it => it.id !== id));
        setSelectedItinerary(null);
        setSuccess('Deleted');
      } catch (err) { setError('Failed to delete'); }
    }
  };

  const handleRequestGuides = async () => {
    if (!selectedItinerary?.places?.length) return setError('Add places first!');
    try {
      setLoading(true);
      await bookingService.requestGuides(selectedItinerary.id, { touristId: user.id });
      setSuccess('Guide requests sent!');
    } catch (err) { setError('Request failed'); }
    finally { setLoading(false); }
  };

  // Map Data Helper
  const getMapData = () => {
    if (!selectedItinerary?.places) return { markers: [], polyline: [] };
    const valid = selectedItinerary.places.filter(p => p.latitude && p.longitude);
    const coords = valid.map(p => [parseFloat(p.latitude), parseFloat(p.longitude)]);
    return { markers: valid, polyline: coords };
  };

  const filteredPlaces = availablePlaces.filter(place =>
    place.name.toLowerCase().includes(searchPlaceTerm.toLowerCase()) ||
    (place.category && place.category.toLowerCase().includes(searchPlaceTerm.toLowerCase()))
  );

  // Fetch GraphHopper route whenever the selected itinerary's places change
  useEffect(() => {
    const validPlaces = (selectedItinerary?.places || []).filter(p => p.latitude && p.longitude);
    if (validPlaces.length < 2) {
      setGhRoute(null);
      setGhError('');
      return;
    }
    const coords = validPlaces.map(p => [parseFloat(p.latitude), parseFloat(p.longitude)]);
    setGhLoading(true);
    setGhError('');
    fetchGraphHopperRoute(coords)
      .then(route => { setGhRoute(route); })
      .catch(err => {
        console.error('GraphHopper error:', err);
        setGhError('Could not load road route — showing straight lines instead.');
        setGhRoute(null);
      })
      .finally(() => setGhLoading(false));
  }, [selectedItinerary?.places]);

  const { markers, polyline } = getMapData();
  const today = new Date().toISOString().split('T')[0];
  const placeToAdd = searchParams.get('add');

  return (
    <main className="itinerary-page">
      <div className="container">
        <h1>My Travel Itineraries</h1>
        <p>Plan and organize your trips</p>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <div className="itinerary-layout">
          <aside className="itinerary-sidebar">
            <div className="create-itinerary">
              <h3>Create New Itinerary</h3>
              <form onSubmit={handleCreateItinerary} className="form">
                <input type="text" placeholder="Title" value={newItinerary.title} onChange={(e) => setNewItinerary({...newItinerary, title: e.target.value})} required />
                <input type="date" min={today} value={newItinerary.startDate} onChange={(e) => setNewItinerary({...newItinerary, startDate: e.target.value})} />
                <input type="date" min={newItinerary.startDate || today} value={newItinerary.endDate} onChange={(e) => setNewItinerary({...newItinerary, endDate: e.target.value})} />
                <button type="submit" className="btn btn-primary btn-block">Create Itinerary</button>
              </form>
            </div>

            <div className="itineraries-list">
              <h3>Your Itineraries</h3>
              {loading && !itineraries.length ? <p>Loading...</p> : itineraries.map(it => (
                <div key={it.id} className={`itinerary-item ${selectedItinerary?.id === it.id ? 'active' : ''}`} onClick={() => setSelectedItinerary(it)}>
                  <strong>{it.title}</strong>
                  <small>{it.start_date || 'No dates'}</small>
                </div>
              ))}
            </div>
          </aside>

          <section className="itinerary-content">
            {selectedItinerary ? (
              <div className="itinerary-detail">
                <div className="detail-header">
                  <h2>{selectedItinerary.title}</h2>
                  <button onClick={() => handleDeleteItinerary(selectedItinerary.id)} className="btn btn-danger btn-sm">Delete</button>
                </div>

                {/* LEAFLET MAP with GraphHopper road route */}
                <div className="map-preview-container">
                  <MapContainer 
                    center={polyline.length > 0 ? polyline[0] : [7.8731, 80.7718]} 
                    zoom={polyline.length > 0 ? 9 : 7} 
                    className="itinerary-map"
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    {markers.map((place, idx) => {
                      const customIcon = L.divIcon({
                        className: '',
                        html: `
                          <div class="map-marker-pin">
                            <div class="map-marker-img-wrap">
                              ${place.image_url
                                ? `<img src="${place.image_url}" class="map-marker-img" alt="${place.name}" />`
                                : `<div class="map-marker-fallback">🏞️</div>`
                              }
                            </div>
                            <div class="map-marker-tail"></div>
                          </div>`,
                        iconSize: [52, 62],
                        iconAnchor: [26, 62],
                        popupAnchor: [0, -66],
                      });
                      return (
                        <Marker key={idx} position={[parseFloat(place.latitude), parseFloat(place.longitude)]} icon={customIcon}>
                          <Popup>
                            <div class="map-popup">
                              {place.image_url && <img src={place.image_url} alt={place.name} class="map-popup-img" />}
                              <strong>{place.name}</strong>
                              {place.category && <span class="map-popup-cat">{place.category}</span>}
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                    {/* GraphHopper road route — falls back to straight-line dashes if unavailable */}
                    {ghRoute ? (
                      <Polyline positions={ghRoute.points} color="#667eea" weight={4} opacity={0.85} />
                    ) : (
                      polyline.length > 1 && <Polyline positions={polyline} color="#667eea" dashArray="5, 10" />
                    )}
                  </MapContainer>
                </div>

                {/* JOURNEY SUMMARY */}
                {(ghRoute || ghLoading || ghError) && (
                  <div className="journey-summary">
                    {ghLoading && (
                      <div className="journey-summary__loading">
                        <span className="journey-spinner" /> Calculating road route…
                      </div>
                    )}
                    {ghError && !ghLoading && (
                      <p className="journey-summary__error">⚠️ {ghError}</p>
                    )}
                    {ghRoute && !ghLoading && (
                      <div className="journey-summary__stats">
                        <div className="journey-stat">
                          <span className="journey-stat__icon">🗺️</span>
                          <div>
                            <span className="journey-stat__label">Total Distance</span>
                            <span className="journey-stat__value">{ghRoute.distanceKm} km</span>
                          </div>
                        </div>
                        <div className="journey-stat">
                          <span className="journey-stat__icon">⏱️</span>
                          <div>
                            <span className="journey-stat__label">Est. Drive Time</span>
                            <span className="journey-stat__value">
                              {ghRoute.durationMin >= 60
                                ? `${Math.floor(ghRoute.durationMin / 60)}h ${ghRoute.durationMin % 60}m`
                                : `${ghRoute.durationMin} min`}
                            </span>
                          </div>
                        </div>
                        <div className="journey-stat">
                          <span className="journey-stat__icon">💰</span>
                          <div>
                            <span className="journey-stat__label">Est. Transport Cost</span>
                            <span className="journey-stat__value">
                              LKR {(ghRoute.distanceKm * PRICE_PER_KM).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <p className="journey-summary__disclaimer">* Price is a mock estimate based on LKR {PRICE_PER_KM}/km by car</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="itinerary-actions">
                  <button onClick={handleRequestGuides} className="btn btn-success confirm-btn" disabled={loading || !selectedItinerary.places?.length}>
                    🚀 Confirm Timeline & Request Guides
                  </button>
                </div>

                {/* ADD PLACE LOGIC */}
                <div className="itinerary-places">
                  <h3>Places</h3>
                  {(showAddPlaceDropdown || placeToAdd) && (
                    <div className="add-place-section">
                      <div className="add-place-header">
                        <h3>{placeToAdd ? "Add Linked Place" : "Add a Place"}</h3>
                        <button onClick={() => { setShowAddPlaceDropdown(false); setSearchPlaceTerm(''); }} className="add-place-close">✕</button>
                      </div>
                      <div className="place-search-wrapper">
                        <span className="place-search-icon">🔍</span>
                        <input
                          type="text"
                          placeholder="Search by name or category…"
                          value={searchPlaceTerm}
                          onChange={(e) => setSearchPlaceTerm(e.target.value)}
                          className="place-search-input"
                          autoFocus
                        />
                        {searchPlaceTerm && (
                          <button className="place-search-clear" onClick={() => setSearchPlaceTerm('')}>✕</button>
                        )}
                      </div>
                      <div className="place-suggestions">
                        {filteredPlaces.length === 0 ? (
                          <div className="place-suggestions__empty">No places match "{searchPlaceTerm}"</div>
                        ) : (
                          filteredPlaces.map(p => (
                            <button
                              key={p.id}
                              className="place-suggestion-card"
                              onClick={() => handleAddPlaceToItinerary(selectedItinerary.id, p.id)}
                            >
                              <div className="place-suggestion-img-wrap">
                                {p.image_url
                                  ? <img src={p.image_url} alt={p.name} className="place-suggestion-img" />
                                  : <div className="place-suggestion-img-placeholder">🏞️</div>
                                }
                              </div>
                              <div className="place-suggestion-info">
                                <span className="place-suggestion-name">{p.name}</span>
                                {p.category && <span className="place-suggestion-cat">{p.category}</span>}
                              </div>
                              <span className="place-suggestion-add">+</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  {selectedItinerary.places?.map((item, index) => (
                    <div key={item.id || index} className="place-item">
                      <div className="place-order">{index + 1}</div>
                      <div className="place-details"><h4>{item.name}</h4></div>
                      <button onClick={() => handleRemovePlace(selectedItinerary.id, item.place_id)} className="btn btn-danger btn-sm">Remove</button>
                    </div>
                  ))}
                  
                  {!showAddPlaceDropdown && (
                    <button onClick={() => setShowAddPlaceDropdown(true)} className="btn btn-success add-btn-main">+ Add Another Place</button>
                  )}
                </div>
              </div>
            ) : <div className="empty-itinerary"><h3>No Itinerary Selected</h3></div>}
          </section>
        </div>
      </div>
    </main>
  );
};

export default ItineraryPage;