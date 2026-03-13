import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlace } from '../context/PlaceContext';
import { itineraryService, placeService, bookingService } from '../services';
import './ItineraryPage.css';

const ItineraryPage = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { places } = usePlace();

  const [itineraries, setItineraries] = useState([]);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newItinerary, setNewItinerary] = useState({ title: '', startDate: '', endDate: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddPlaceDropdown, setShowAddPlaceDropdown] = useState(false);
  const [searchPlaceTerm, setSearchPlaceTerm] = useState('');
  const [availablePlaces, setAvailablePlaces] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'guide') {
      navigate('/dashboard');
      return;
    }
    
    fetchItineraries();
    loadPlaces();
    const placeToAdd = searchParams.get('add');
    if (placeToAdd) {
      setTimeout(() => {
        setSuccess('Select an itinerary to add this place');
      }, 500);
    }
  }, [user, navigate]);

  const loadPlaces = async () => {
    try {
      if (places && places.length > 0) {
        setAvailablePlaces(places);
      } else {
        const response = await placeService.getAllPlaces();
        // The server returns the array in the 'data' property of the response body
        setAvailablePlaces(response.data.data || []);
      }
    } catch (err) {
      console.error('Error loading places:', err);
    }
  };

  const fetchItineraries = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await itineraryService.getUserItineraries(user.id);
      setItineraries(response.data.data || []);
      if (response.data.data?.length > 0) {
        setSelectedItinerary(response.data.data[0]);
      }
    } catch (err) {
      setError('Failed to load itineraries');
      console.error('Error fetching itineraries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItinerary = async (e) => {
    e.preventDefault();
    if (!newItinerary.title) {
      setError('Please enter a title');
      return;
    }

    try {
      const response = await itineraryService.createItinerary({
        tourist_id: user.id,
        title: newItinerary.title,
        start_date: newItinerary.startDate || null,
        end_date: newItinerary.endDate || null
      });
      
      const createdItinerary = response.data.itinerary || response.data.data;
      setItineraries([...itineraries, createdItinerary]);
      setSelectedItinerary(createdItinerary);
      setNewItinerary({ title: '', startDate: '', endDate: '' });
      setSuccess('Itinerary created successfully!');
      setError('');
      
      const placeToAddId = searchParams.get('add');
      if (placeToAddId) {
        handleAddPlaceToItinerary(createdItinerary.id, parseInt(placeToAddId));
      }
    } catch (err) {
      console.error('Create itinerary error:', err);
      setError(err.response?.data?.error || 'Failed to create itinerary');
    }
  };

  const handleAddPlaceToItinerary = async (itineraryId, placeId) => {
    try {
      console.log(`Adding place ${placeId} to itinerary ${itineraryId}`);
      await itineraryService.addPlaceToItinerary(itineraryId, placeId);
      setSuccess('Place added to itinerary!');
      setError('');
      setShowAddPlaceDropdown(false);
      setSearchPlaceTerm('');
      fetchItineraries();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Add place error:', err);
      setError(err.response?.data?.error || 'Failed to add place');
    }
  };

  // Filter places based on search term
  const filteredPlaces = availablePlaces.filter(place =>
    place.name.toLowerCase().includes(searchPlaceTerm.toLowerCase()) ||
    (place.category && place.category.toLowerCase().includes(searchPlaceTerm.toLowerCase()))
  );

  const handleRemovePlace = async (itineraryId, placeId) => {
    try {
      await itineraryService.removePlaceFromItinerary(itineraryId, placeId);
      setSuccess('Place removed from itinerary');
      fetchItineraries();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to remove place');
    }
  };

  const handleDeleteItinerary = async (itineraryId) => {
    if (window.confirm('Are you sure you want to delete this itinerary?')) {
      try {
        await itineraryService.deleteItinerary(itineraryId);
        setItineraries(itineraries.filter(it => it.id !== itineraryId));
        setSelectedItinerary(null);
        setSuccess('Itinerary deleted');
      } catch (err) {
        setError('Failed to delete itinerary');
      }
    }
  };

  const handleRequestGuides = async () => {
    if (!selectedItinerary) return;
    if (!selectedItinerary.places || selectedItinerary.places.length === 0) {
      setError('Please add some places to your itinerary first!');
      return;
    }
    
    try {
      setLoading(true);
      const response = await bookingService.requestGuides(selectedItinerary.id, {
        touristId: user.id,
        notes: `Requesting guides for ${selectedItinerary.title}`
      });
      
      setSuccess(response.data.message || 'Guide requests sent successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      console.error('Request guides error:', err);
      setError(err.response?.data?.error || 'Failed to send guide requests');
    } finally {
      setLoading(false);
    }
  };

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
          {/* Sidebar - Create New Itinerary */}
          <aside className="itinerary-sidebar">
            <div className="create-itinerary">
              <h3>Create New Itinerary</h3>
              <form onSubmit={handleCreateItinerary} className="form">
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={newItinerary.title}
                    onChange={(e) => setNewItinerary({ ...newItinerary, title: e.target.value })}
                    placeholder="e.g., Summer Vacation 2024"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={newItinerary.startDate}
                    min={today}
                    onChange={(e) => setNewItinerary({ ...newItinerary, startDate: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={newItinerary.endDate}
                    min={newItinerary.startDate || today}
                    onChange={(e) => setNewItinerary({ ...newItinerary, endDate: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-block">
                  Create Itinerary
                </button>
              </form>
            </div>

            {/* Itineraries List */}
            <div className="itineraries-list">
              <h3>Your Itineraries</h3>
              {loading ? (
                <p className="loading-text">Loading...</p>
              ) : itineraries.length > 0 ? (
                itineraries.map(itinerary => (
                  <div
                    key={itinerary.id}
                    className={`itinerary-item ${selectedItinerary?.id === itinerary.id ? 'active' : ''}`}
                    onClick={() => setSelectedItinerary(itinerary)}
                  >
                    <strong>{itinerary.title}</strong>
                    <small>
                      {itinerary.start_date && itinerary.end_date
                        ? `${itinerary.start_date} to ${itinerary.end_date}`
                        : 'No dates'}
                    </small>
                  </div>
                ))
              ) : (
                <p className="no-data">No itineraries yet</p>
              )}
            </div>
          </aside>

          {/* Main Content - Itinerary Details */}
          <section className="itinerary-content">
            {selectedItinerary ? (
              <div className="itinerary-detail">
                <div className="detail-header">
                  <h2>{selectedItinerary.title}</h2>
                  <button
                    onClick={() => handleDeleteItinerary(selectedItinerary.id)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </div>

                <div className="detail-info">
                  {selectedItinerary.start_date && (
                    <p><strong>Start Date:</strong> {selectedItinerary.start_date}</p>
                  )}
                  {selectedItinerary.end_date && (
                    <p><strong>End Date:</strong> {selectedItinerary.end_date}</p>
                  )}
                </div>

                <div className="itinerary-actions" style={{ marginBottom: '20px' }}>
                  <button 
                    onClick={handleRequestGuides}
                    disabled={loading || !selectedItinerary.places || selectedItinerary.places.length === 0}
                    className="btn btn-success"
                    style={{ width: '100%', padding: '12px', fontWeight: 'bold' }}
                  >
                    🚀 Confirm Timeline & Request Guides
                  </button>
                </div>

                {/* Add Place Section */}
                {placeToAdd && (
                  <div className="add-place-section" style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h3>Add Place to this Itinerary</h3>
                    {filteredPlaces.length > 0 ? (
                      <select defaultValue="" onChange={(e) => {
                        if (e.target.value) {
                          handleAddPlaceToItinerary(selectedItinerary.id, parseInt(e.target.value));
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ddd'
                      }}>
                        <option value="">Select a place...</option>
                        {filteredPlaces.map(place => (
                          <option key={place.id} value={place.id}>
                            {place.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p style={{ color: '#999' }}>Loading places...</p>
                    )}
                  </div>
                )}

                {/* Add Place Dropdown */}
                {showAddPlaceDropdown && (
                  <div className="add-place-section" style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h3>Add Place to this Itinerary</h3>
                    <div style={{ marginBottom: '10px' }}>
                      <input
                        type="text"
                        placeholder="Search places by name or category..."
                        value={searchPlaceTerm}
                        onChange={(e) => setSearchPlaceTerm(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          marginBottom: '10px',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                          fontSize: '14px'
                        }}
                      />
                    </div>

                    {filteredPlaces.length > 0 ? (
                      <select 
                        defaultValue="" 
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddPlaceToItinerary(selectedItinerary.id, parseInt(e.target.value));
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '8px',
                          marginBottom: '10px',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                          fontSize: '14px'
                        }}
                      >
                        <option value="">Select a place...</option>
                        {filteredPlaces.map(place => (
                          <option key={place.id} value={place.id}>
                            {place.name} {place.category ? `(${place.category})` : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p style={{ color: '#999', textAlign: 'center', padding: '10px' }}>
                        {availablePlaces.length === 0 ? 'Loading places...' : 'No places found matching your search'}
                      </p>
                    )}

                    <button 
                      onClick={() => {
                        setShowAddPlaceDropdown(false);
                        setSearchPlaceTerm('');
                      }}
                      className="btn btn-secondary"
                      style={{ width: '100%', marginTop: '10px' }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Places in Itinerary */}
                <div className="itinerary-places">
                  <h3>Places in This Itinerary</h3>
                  {selectedItinerary.places && selectedItinerary.places.length > 0 ? (
                    <div className="places-list">
                      {selectedItinerary.places.map((item, index) => (
                        <div key={item.item_id || item.id} className="place-item">
                          <div className="place-order">{index + 1}</div>
                          <div className="place-details">
                            <h4>{item.name || 'Unknown Place'}</h4>
                            {item.notes && <p className="place-notes">{item.notes}</p>}
                          </div>
                          <button
                            onClick={() => handleRemovePlace(selectedItinerary.id, item.place_id)}
                            className="btn btn-danger btn-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-places">No places added yet</p>
                  )}

                  <button
                    onClick={() => setShowAddPlaceDropdown(true)}
                    className="btn btn-success"
                    style={{ marginTop: '20px' }}
                  >
                    Add Another Place
                  </button>
                </div>
              </div>
            ) : (
              <div className="empty-itinerary">
                <h3>No Itinerary Selected</h3>
                <p>Create a new itinerary or select an existing one to get started</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default ItineraryPage;
