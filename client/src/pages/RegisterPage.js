import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { placeService } from '../services';
import { FaCamera, FaMapPin, FaUpload, FaTimes, FaCheckCircle, FaIdCard, FaHistory, FaLanguage, FaUserTie } from 'react-icons/fa';
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
    profile_image: null,
    experience_years: '',
    license_number: '',
    primary_language: '',
    other_languages: ''
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
    
    const { full_name, contact_number, covered_locations, profile_image, experience_years, license_number, primary_language, other_languages } = formData;
    const result = await register(formData.email, formData.password, formData.role, {
        full_name,
        contact_number,
        covered_locations,
        profile_image_url: profile_image,
        experience_years,
        license_number,
        languages: primary_language + (other_languages ? `, ${other_languages}` : '')
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
          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label htmlFor="role" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-head)', fontWeight: '800', textTransform: 'uppercase', fontSize: '0.85rem' }}>
              <FaUserTie style={{ color: 'var(--text-head)' }} /> I am a:
            </label>
            <select 
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="auth-input"
              style={{ fontWeight: '700', border: '1px solid var(--primary)', background: 'rgba(79, 70, 229, 0.05)' }}
            >
              <option value="tourist">Tourist</option>
              <option value="guide">Travel Guide</option>
            </select>
          </div>

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
                type="tel"
                id="contact_number"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                placeholder="e.g., 0712345678"
                pattern="^0[0-9]{9}$"
                title="Please enter a 10-digit phone number starting with 0"
                maxLength="10"
                required
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Please enter a 10-digit phone number starting with 0.</p>
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
                className="auth-input"
                style={{ marginBottom: '12px' }}
              />
              <div className="location-checkbox-grid" style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr', 
                gap: '8px',
                padding: '16px',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                marginTop: '5px',
                maxHeight: '220px',
                overflowY: 'auto',
                backgroundColor: 'var(--bg-page)'
              }}>
                {filteredPlaces.length > 0 ? filteredPlaces.map(place => (
                  <label key={place.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    padding: '10px',
                    borderRadius: '8px',
                    transition: 'all 0.2s',
                    userSelect: 'none',
                    color: 'var(--text-body)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <input
                      type="checkbox"
                      checked={formData.covered_locations.split(', ').includes(place.name)}
                      onChange={() => handleLocationToggle(place.name)}
                      style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                    />
                    <span>{place.name}</span>
                  </label>
                )) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '10px' }}>
                    No matching places found.
                  </div>
                )}
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  fontSize: '0.95rem', 
                  cursor: 'pointer',
                  padding: '10px',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                  userSelect: 'none',
                  color: 'var(--text-body)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <input
                    type="checkbox"
                    checked={formData.covered_locations.split(', ').includes('Island Wide')}
                    onChange={() => handleLocationToggle('Island Wide')}
                    style={{ cursor: 'pointer', width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                  />
                  <span>Island Wide</span>
                </label>
              </div>
              <div style={{ marginTop: '16px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }}>
                  <FaMapPin style={{ color: 'var(--text-head)' }} /> Selected Locations
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {formData.covered_locations ? formData.covered_locations.split(', ').filter(l => l).map(loc => (
                    <span 
                      key={loc} 
                      style={{ 
                        background: 'var(--primary)', 
                        color: 'white', 
                        padding: '6px 12px', 
                        borderRadius: '999px', 
                        fontSize: '0.8rem', 
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {loc}
                      <FaTimes 
                        style={{ cursor: 'pointer', fontSize: '0.7rem', opacity: '0.8' }} 
                        onClick={() => handleLocationToggle(loc)}
                        onMouseEnter={(e) => e.target.style.opacity = '1'}
                        onMouseLeave={(e) => e.target.style.opacity = '0.8'}
                      />
                    </span>
                  )) : (
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>None selected yet</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Professional Details Section */}
          {formData.role === 'guide' && (
            <div className="professional-details-section" style={{ 
              backgroundColor: 'rgba(79, 70, 229, 0.03)', 
              padding: '24px', 
              borderRadius: '16px', 
              border: '1px solid var(--border)',
              marginTop: '24px',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-head)' }}>
                <FaUserTie style={{ color: 'var(--text-head)' }} /> Professional Qualifications
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-head)', fontWeight: '600', marginBottom: '8px' }}>
                    <FaIdCard style={{ color: 'var(--text-head)' }} /> License Number
                  </label>
                  <input
                    type="text"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleChange}
                    placeholder="e.g., LKR-9921"
                    className="auth-input"
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Leave blank if not yet licensed</p>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-head)', fontWeight: '600', marginBottom: '8px' }}>
                    <FaHistory style={{ color: 'var(--text-head)' }} /> Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    className="auth-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-head)', fontWeight: '600', marginBottom: '8px' }}>
                    <FaLanguage style={{ color: 'var(--text-head)' }} /> Primary Language
                  </label>
                  <select 
                    name="primary_language" 
                    value={formData.primary_language} 
                    onChange={handleChange}
                    className="auth-input"
                    style={{ width: '100%', height: '52px', background: 'var(--bg-page)', color: 'var(--text-body)', border: '1px solid var(--border)', borderRadius: '12px', padding: '0 16px' }}
                  >
                    <option value="">Select Primary</option>
                    <option value="English">English</option>
                    <option value="Sinhala">Sinhala</option>
                    <option value="Tamil">Tamil</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Chinese">Chinese</option>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-head)', fontWeight: '600', marginBottom: '8px' }}>
                     <FaLanguage style={{ color: 'var(--text-head)' }} /> Other Languages
                  </label>
                  <input
                    type="text"
                    name="other_languages"
                    value={formData.other_languages}
                    onChange={handleChange}
                    placeholder="e.g. Japanese, Italian"
                    className="auth-input"
                  />
                </div>
              </div>
            </div>
          )}

          {formData.role === 'guide' && (
            <div className="form-group">
              <label style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-head)' }}>
                <FaCamera style={{ color: 'var(--primary)' }} /> Profile Picture
              </label>
              {imagePreview && (
                <div style={{ 
                  marginBottom: '20px',
                  padding: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  display: 'inline-block'
                }}>
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    style={{ 
                      maxWidth: '160px', 
                      maxHeight: '160px', 
                      borderRadius: '12px',
                      display: 'block',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
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
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '24px 20px',
                    borderRadius: '12px',
                    border: '2px dashed var(--primary)',
                    backgroundColor: 'rgba(79, 70, 229, 0.05)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    color: 'var(--text-head)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.1)';
                    e.currentTarget.style.borderColor = 'var(--primary-hover)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(79, 70, 229, 0.05)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <FaUpload style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '4px' }} />
                  Click to upload or drag and drop
                </label>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#7f8c8d', marginTop: '8px' }}>
                Supported formats: JPG, PNG, WebP (Max 10MB)
              </p>
            </div>
          )}
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
