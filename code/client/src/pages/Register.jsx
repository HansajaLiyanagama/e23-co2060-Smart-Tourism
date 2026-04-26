import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('tourist');
  const [nationality, setNationality] = useState(''); 
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Make sure this URL matches your backend setup!
      const response = await fetch('http://localhost:5000/api/auth/register', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, role, nationality }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registration Successful! You can now log in.');
        navigate('/'); 
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to connect to the server.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
      <form onSubmit={handleRegister} style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', width: '320px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <h2 style={{ textAlign: 'center', color: '#333' }}>Create an Account</h2>
        
        {error && <p style={{ color: 'red', textAlign: 'center', fontSize: '0.9em' }}>{error}</p>}

        {/*Full Name Input*/}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold' }}>Full Name:</label> <br />
          <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }} />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold' }}>Email:</label> <br />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }} />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold' }}>Password:</label> <br />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold' }}>I am joining as a:</label> <br />
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px', boxSizing: 'border-box' }}>
            <option value="tourist">Tourist</option>
            <option value="guide">Tour Guide</option>
          </select>
        </div>

      {role === 'tourist' && (
        <div style={{ marginBottom: '15px' }}>
          <label>Nationality: </label>
          <input 
            type="text" 
            value={nationality} 
            onChange={(e) => setNationality(e.target.value)} 
            placeholder="e.g. American, British, etc."
            required={role === 'tourist'} 
          />
        </div>
      )}

        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1em' }}>
          Sign Up
        </button>

        <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.9em' }}>
          <Link to="/" style={{ color: '#0066cc', textDecoration: 'none' }}>Already have an account? Login here</Link>
        </div>
      </form>
    </div>
  );
}

export default Register;