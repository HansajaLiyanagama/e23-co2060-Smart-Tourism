import { useState, useEffect } from 'react';

function TouristDashboard() {
  // State for the trip form
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState('');

  // NEW: State to remember the newly created trip's ID
  const [currentItineraryId, setCurrentItineraryId] = useState(null);

  // State for the guides list
  const [guides, setGuides] = useState([]);
  const [fetchMessage, setFetchMessage] = useState('');

  // Fetch guides on load
  useEffect(() => {
    const fetchGuides = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:5000/api/guide/all', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok) {
          setGuides(data.guides);
        } else {
          setFetchMessage(`❌ Error: ${data.error}`);
        }
      } catch (error) {
        console.error("Error fetching guides:", error);
        setFetchMessage('❌ Failed to load guides from server.');
      }
    };

    fetchGuides();
  }, []);

  // Handle creating the trip
  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setMessage('Saving trip...');

    const token = localStorage.getItem('token');
    if (!token) return setMessage('❌ Error: You are not logged in!');

    try {
      const response = await fetch('http://localhost:5000/api/itineraries/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ title, startDate, endDate }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Trip saved! You can now request a guide below.');
        
        // Save the newly created itinerary ID so we can use it for bookings
        // (Fallback to data.id just in case your backend sends it directly)
        const newId = data.itinerary ? data.itinerary.id : data.id;
        setCurrentItineraryId(newId);

        setTitle('');
        setStartDate('');
        setEndDate('');
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error creating trip:", error);
      setMessage('❌ Failed to connect to the server.');
    }
  };

  // NEW: Handle sending the request to the guide
  const handleRequestGuide = async (guideId) => {
    if (!currentItineraryId) {
      alert('⚠️ Please create a trip first before requesting a guide!');
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:5000/api/requests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          itineraryId: currentItineraryId,
          guideId: guideId
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Request sent to the guide successfully!');
      } else {
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
      
      {/* 1. Trip Creation Form */}
      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '40px', backgroundColor: '#f9f9f9' }}>
        <h3 style={{ marginTop: 0 }}>Plan a New Trip</h3>
        {message && <p style={{ fontWeight: 'bold', color: message.includes('✅') ? 'green' : 'red' }}>{message}</p>}

        <form onSubmit={handleCreateTrip}>
          <div style={{ marginBottom: '15px' }}>
            <label>Trip Title:</label> <br />
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} placeholder="e.g., Summer Trip to Kandy" required />
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

      {/* 2. Available Guides Section */}
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
                
                {/* NEW: Updated onClick handler */}
                <button 
                  onClick={() => handleRequestGuide(guide.user_id)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    backgroundColor: currentItineraryId ? '#007BFF' : '#ccc', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
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