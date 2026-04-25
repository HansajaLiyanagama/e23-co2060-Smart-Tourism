import { useState } from 'react';

function GuideDashboard() {
  // State for our form fields
  const [bio, setBio] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  
  // State for user feedback (success/error messages)
  const [message, setMessage] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setMessage('Saving...');

    // 1. Get the VIP pass (JWT) from local storage
    const token = localStorage.getItem('token');

    if (!token) {
      setMessage('Error: You are not logged in!');
      return;
    }

    try {
      // 2. Send the securely verified request to the backend
      const response = await fetch('http://localhost:5000/api/guide/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Passing the token to the Gatekeeper!
        },
        body: JSON.stringify({
          bio: bio,
          licenseNumber: licenseNumber,
          hourlyRate: Number(hourlyRate) // Ensure this is sent as a number
        }),
      });

      const data = await response.json();

      // 3. Handle the response
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

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px' }}>
      <div style={{ width: '400px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2 style={{ textAlign: 'center' }}>🧭 Guide Dashboard</h2>
        <p style={{ textAlign: 'center' }}>Complete your profile to get verified.</p>
        
        {message && <p style={{ textAlign: 'center', fontWeight: 'bold' }}>{message}</p>}

        <form onSubmit={handleUpdateProfile}>
          <div style={{ marginBottom: '15px' }}>
            <label>Bio (Tell tourists about yourself):</label> <br />
            <textarea 
              rows="4"
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }} 
              placeholder="I am an expert in historical tours..."
              required
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label>License Number:</label> <br />
            <input 
              type="text" 
              value={licenseNumber} 
              onChange={(e) => setLicenseNumber(e.target.value)} 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }} 
              placeholder="e.g. TG-12345"
              required 
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>Hourly Rate ($):</label> <br />
            <input 
              type="number" 
              step="0.01"
              value={hourlyRate} 
              onChange={(e) => setHourlyRate(e.target.value)} 
              style={{ width: '100%', padding: '8px', marginTop: '5px' }} 
              placeholder="25.00"
              required 
            />
          </div>

          <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Save Profile Details
          </button>
        </form>
      </div>
    </div>
  );
}

export default GuideDashboard;