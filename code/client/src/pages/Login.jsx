import { useState } from 'react';

function Login() {
  // State variables to hold the user's input
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Function to handle the form submission
  const handleLogin = (e) => {
    e.preventDefault(); // Stops the page from refreshing
    
    // For now, we will just print it to the browser console
    console.log("Attempting to login with:", email, password);
    
    // In the next step, we will send this to your Node.js backend!
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
      </form>
    </div>
  );
}

export default Login;