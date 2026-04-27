import { useState, useEffect } from 'react';

function GuideDashboard() {
  // State for Profile Update Form
  const [bio, setBio] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [message, setMessage] = useState('');

  // NEW: State for Booking Requests
  const [requests, setRequests] = useState([]);
  const [requestMessage, setRequestMessage] = useState('');

  // NEW: Fetch requests as soon as the dashboard loads
  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:5000/api/requests/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (response.ok) {
          setRequests(data.requests);
        } else {
          setRequestMessage(`❌ Error: ${data.error}`);
        }
      } catch (error) {
        console.error("Error fetching requests:", error);
        setRequestMessage('❌ Failed to load requests from server.');
      }
    };

    fetchRequests();
  }, []);

  // Existing: Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('Updating profile...');
    const token = localStorage.getItem('token');
    if (!token) return setMessage('❌ You are not logged in!');

    try {
      const response = await fetch('http://localhost:5000/api/guide/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bio, licenseNumber, hourlyRate }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('✅ Profile updated successfully!');
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage('❌ Failed to connect to the server.');
    }
  };

  // NEW: Handle Accepting or Declining a Request
  const handleUpdateStatus = async (requestId, newStatus) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:5000/api/requests/${requestId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Instantly update the UI without needing to refresh the page
        setRequests(requests.map(req => 
          req.request_id === requestId ? { ...req, status: newStatus } : req
        ));
      } else {
        const data = await response.json();
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Failed to update request status.');
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '50px auto', padding: '0 20px' }}>
      <h2 style={{ textAlign: 'center' }}>🧭 Guide Dashboard</h2>
      
      {/* 1. Profile Update Section */}
      <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '40px', backgroundColor: '#f9f9f9' }}>
        <h3 style={{ marginTop: 0 }}>My Professional Profile</h3>
        {message && <p style={{ fontWeight: 'bold', color: message.includes('✅') ? 'green' : 'red' }}>{message}</p>}

        <form onSubmit={handleUpdateProfile}>
          <div style={{ marginBottom: '15px' }}>
            <label>Bio / About Me:</label> <br />
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} rows="3" placeholder="Tell tourists about yourself..."></textarea>
          </div>
          <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
            <div style={{ flex: 1 }}>
              <label>License Number:</label> <br />
              <input type="text" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} placeholder="e.g., SLTDA-123" />
            </div>
            <div style={{ flex: 1 }}>
              <label>Hourly Rate ($):</label> <br />
              <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px' }} placeholder="e.g., 20" />
            </div>
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
            Update Profile
          </button>
        </form>
      </div>

      {/* 2. Incoming Requests Section */}
      <div>
        <h3>📩 Tourist Requests</h3>
        {requestMessage && <p>{requestMessage}</p>}
        
        {requests.length === 0 && !requestMessage ? (
          <p>No requests right now. Hang tight!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {requests.map((req) => (
              <div key={req.request_id} style={{ padding: '15px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: '0 0 5px 0' }}>Trip: {req.trip_title}</h4>
                    <p style={{ margin: '0 0 5px 0', fontSize: '0.9em' }}>
                      <strong>Tourist:</strong> {req.tourist_name} ({req.nationality})
                    </p>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.9em', color: '#555' }}>
                      <strong>Dates:</strong> {new Date(req.start_date).toLocaleDateString()} to {new Date(req.end_date).toLocaleDateString()}
                    </p>
                    <p style={{ margin: 0, fontWeight: 'bold', color: req.status === 'pending' ? 'orange' : req.status === 'accepted' ? 'green' : 'red' }}>
                      Status: {req.status.toUpperCase()}
                    </p>
                  </div>
                  
                  {/* Action Buttons: Only show if the request is still pending */}
                  {req.status === 'pending' && (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => handleUpdateStatus(req.request_id, 'accepted')}
                        style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Accept
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(req.request_id, 'declined')}
                        style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GuideDashboard;