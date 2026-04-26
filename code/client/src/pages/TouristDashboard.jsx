import { useState } from 'react';

function TouristDashboard() {
  // State for our form fields
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // State for user feedback
  const [message, setMessage] = useState('');

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setMessage('Saving trip...');

    // 1. Get the VIP pass (JWT) from local storage
    const token = localStorage.getItem('token');

    if (!token) {
      setMessage('❌ Error: You are not logged in!');
      return;
    }

    try {
      // 2. Send the verified request to our new itinerary route
      const response = await fetch('http://localhost:5000/api/itineraries/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: title,
          startDate: startDate,
          endDate: endDate
        }),
      });

      const data = await response.json();

      // 3. Handle the response
      if (response.ok) {
        setMessage('✅ Itinerary created successfully!');
        // Optional: Clear the form after success
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

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <div style={{ width: '400px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2 style={{ textAlign: 'center' }}>🌍 Tourist Dashboard</h2>
        <p style={{ textAlign: 'center' }}>Plan your next adventure.</p>
        
        {message && <p style={{ textAlign: 'center', fontWeight: 'bold' }}>{message}</p>}

        <form onSubmit={handleCreateTrip}>
          <div style={{ marginBottom: '15px' }}>
            <label>Trip Title:</label> <br />
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }} 
              placeholder="e.g., Summer Trip to Kandy"
              required 
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>Start Date:</label> <br />
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }} 
              required 
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>End Date:</label> <br />
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }} 
              required 
            />
          </div>

          <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Create Itinerary
          </button>
        </form>
      </div>
    </div>
  );
}

export default TouristDashboard;