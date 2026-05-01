import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { placeService } from '../services';
import './AuthPages.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '',
    role: 'tourist',
    full_name: '',
    contact_number: '',
    covered_locations: '',
    profile_image: null
  });
  const [places, setPlaces] = useState([]);
  const [placeSearchTerm, setPlaceSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const response = await placeService.getAllPlaces();
        setPlaces(response.data.data || []);
      } catch (err) {
        console.error('Error fetching places:', err);
      }
    };
    fetchPlaces();
  }, []);

  const filteredPlaces = places.filter(place =>
    place.name.toLowerCase().includes(placeSearchTerm.toLowerCase()) ||
    (place.category || '').toLowerCase().includes(placeSearchTerm.toLowerCase())
  );

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const handleLocationToggle = (locationName) => {
    let current = formData.covered_locations ? formData.covered_locations.split(', ') : [];
    // Clean up empty strings if any
    current = current.filter(l => l !== "");
    
    if (current.includes(locationName)) {
      current = current.filter(l => l !== locationName);
    } else {
      current.push(locationName);
    }
    setFormData(prev => ({ ...prev, covered_locations: current.join(', ') }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        setFormData(prev => ({ ...prev, profile_image: base64 }));
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    
    const { full_name, contact_number, covered_locations, profile_image, ...baseData } = formData;
    const result = await register(formData.email, formData.password, formData.role, {
        full_name,
        contact_number,
        covered_locations,
        profile_image_url: profile_image
    });
    
    if (result.success) {
      // Auto-login after registration
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <h1>Create Account</h1>
        <p>Join us to explore amazing travel destinations</p>
        
        {error && <div className="error">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="full_name">Full Name</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          {(formData.role === 'guide' || formData.role === 'tourist') && (
            <div className="form-group">
              <label htmlFor="contact_number">Contact Number</label>
              <input
                type="text"
                id="contact_number"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                placeholder="e.g., +1234567890"
                required
              />
            </div>
          )}

          {formData.role === 'guide' && (
            <div className="form-group">
              <label>Locations I can Guide (Multiple)</label>
              <input
                type="text"
                value={placeSearchTerm}
                onChange={(e) => setPlaceSearchTerm(e.target.value)}
                placeholder="Search places by name or category..."
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  marginBottom: '12px',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box'
                }}
              />
              <div className="location-checkbox-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr', 
                gap: '10px',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                marginTop: '5px',
                maxHeight: '250px',
                overflowY: 'auto',
                backgroundColor: '#f9fafb'
              }}>
                {filteredPlaces.length > 0 ? filteredPlaces.map(place => (
                  <label key={place.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    transition: 'background-color 0.2s',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <input
                      type="checkbox"
                      checked={formData.covered_locations.split(', ').includes(place.name)}
                      onChange={() => handleLocationToggle(place.name)}
                      style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                    />
                    <span>{place.name}</span>
                  </label>
                )) : (
                  <div style={{ color: '#999', fontSize: '0.9rem', padding: '10px' }}>
                    No matching places found.
                  </div>
                )}
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  fontSize: '0.95rem', 
                  cursor: 'pointer',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  transition: 'background-color 0.2s',
                  userSelect: 'none'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <input
                    type="checkbox"
                    checked={formData.covered_locations.split(', ').includes('Island Wide')}
                    onChange={() => handleLocationToggle('Island Wide')}
                    style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                  />
                  <span>Island Wide</span>
                </label>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#666', marginTop: '8px', fontWeight: '500' }}>
                📍 Selected: <span style={{ color: '#2c3e50', fontWeight: '600' }}>{formData.covered_locations || 'None'}</span>
              </p>
            </div>
          )}

          {formData.role === 'guide' && (
            <div className="form-group">
              <label style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '12px', display: 'block' }}>
                📸 Profile Picture
              </label>
              {imagePreview && (
                <div style={{ 
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: '#f0f5f9',
                  borderRadius: '12px',
                  border: '2px solid #e0e8f0',
                  display: 'inline-block'
                }}>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '180px', 
                      maxHeight: '180px', 
                      borderRadius: '10px',
                      display: 'block',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                  />
                </div>
              )}
              <div style={{
                position: 'relative',
                display: 'inline-block',
                width: '100%'
              }}>
                <input
                  type="file"
                  id="profile_image"
                  name="profile_image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{
                    display: 'none'
                  }}
                />
                <label
                  htmlFor="profile_image"
                  style={{
                    display: 'block',
                    padding: '16px 20px',
                    borderRadius: '8px',
                    border: '2px dashed #3498db',
                    backgroundColor: '#ecf0f1',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    fontSize: '0.95rem',
                    fontWeight: '500',
                    color: '#2c3e50'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#d5e8f7';
                    e.currentTarget.style.borderColor = '#2980b9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ecf0f1';
                    e.currentTarget.style.borderColor = '#3498db';
                  }}
                >
                  ⬆️ Click to upload or drag and drop
                </label>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#7f8c8d', marginTop: '8px' }}>
                Supported formats: JPG, PNG, WebP (Max 10MB)
              </p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="role">I am a:</label>
            <select 
              id="role" 
              name="role" 
              value={formData.role}
              onChange={handleChange}
            >
              <option value="tourist">Tourist</option>
              <option value="guide">Travel Guide</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
