import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate(); // Hook to magically change pages

  const handleLogin = async (e) => {
    e.preventDefault(); 
    
    try {
      // 1. Send the POST request to your Node.js backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // 2. Check if the login was successful
      if (response.ok) {
        // Save the VIP pass (JWT) in the browser's memory
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        
        alert('Login Successful!');
        
        // The traffic Controller: Teleport them based on their specific role
        if (data.user.role === 'guide') {
          navigate('/guide-dashboard');
        } else {
          navigate('/tourist-dashboard'); 
        }
      } else {
        // If wrong password or email
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error("Error connecting to server:", error);
    }
  };

  return (
    <div>
      <h2>Login Page</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email: </label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <br />
        <div>
          <label>Password: </label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <br />
        <button type="submit">Login</button>
        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          <Link to="/register">Need an account? Sign up</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;