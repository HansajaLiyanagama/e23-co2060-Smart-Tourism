import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileService, systemService, bookingService, itineraryService } from '../services';
import './DashboardPage.css';

import { 
  FaMapMarkedAlt, 
  FaListAlt, 
  FaUsers, 
  FaSignOutAlt, 
  FaUserTie,
  FaBriefcase,
  FaIdCard,
  FaHistory,
  FaLanguage,
  FaCamera,
  FaClock,
  FaCheckCircle,
  FaTrashAlt
} from 'react-icons/fa';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const editFormRef = useRef(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [memberSince, setMemberSince] = useState(null);
  
  // Stats state
  const [guideStats, setGuideStats] = useState({
    pending: 0,
    accepted: 0,
    total: 0
  });
  const [touristStats, setTouristStats] = useState({
    itineraries: 0,
    reviews: 0,
    savedPlaces: 0,
    xp: 0
  });

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      if (user && user.id) {
        // Fetch profile
        const profileResponse = await profileService.getProfile(user.id);
        const profile = profileResponse.data.profile;
        if (profile.profile_image_url) {
          setImagePreview(profile.profile_image_url);
        }

        // Extract joined_at for Member Since display
        if (profile.joined_at) {
          setMemberSince(profile.joined_at);
        }

        setFormData({
          full_name: profile.full_name || '',
          bio: profile.bio || '',
          location: profile.covered_locations || profile.location || '',
          contact_number: profile.contact_number || '',
          hourly_rate: profile.hourly_rate || 0,
          experience_years: profile.experience_years || 0,
          languages: profile.languages || '',
          license_number: profile.license_number || '',
          specialization: profile.specialization || ''
        });

        // Fetch Role-Specific Stats
        if (user.role === 'guide') {
          const bookingsRes = await bookingService.getGuideBookings(user.id);
          const bookings = bookingsRes.data.bookings || [];
          setGuideStats({
            pending: bookings.filter(b => b.status === 'pending').length,
            accepted: bookings.filter(b => b.status === 'accepted').length,
            total: bookings.length
          });
        } else {
          // Tourist stats - Fetching real data
          try {
            const statsRes = await profileService.getUserStats(user.id);
            if (statsRes.data.success) {
              setTouristStats(statsRes.data.stats);
            }
          } catch (statsErr) {
            console.error('Error fetching tourist stats:', statsErr);
            // Fallback: fetch itineraries at least
            const itinerariesRes = await itineraryService.getUserItineraries(user.id);
            setTouristStats({
              itineraries: itinerariesRes.data.data?.length || 0,
              reviews: 0,
              savedPlaces: 0,
              xp: (itinerariesRes.data.data?.length || 0) * 50
            });
          }
        }
      }
      
      const statusResponse = await systemService.getStatus();
      setSystemStatus(statusResponse.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      if (!user || !user.id) throw new Error('User not available');

      // Coordinate field mappings for server expectations
      const payload = {
          ...formData,
          covered_locations: user.role === 'guide' ? formData.location : undefined,
          nationality: user.role === 'tourist' ? formData.location : undefined,
          profile_image_url: profileImage || imagePreview
      };

      // send the updated data along with the user's role so the proper endpoint is used
      await profileService.updateProfile(user.id, payload, user.role);
      setEditMode(false);
      setProfileImage(null);
      alert('Portfolio updated successfully!');
    } catch (err) {
      console.error('Profile update error', err);
      setError('Failed to update profile');
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        setProfileImage(base64);
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeleteAccount = async () => {
    try {
      if (!user || !user.id) throw new Error('User not available');
      
      setLoading(true);
      await profileService.deleteAccount(user.id);
      
      // Clear all auth data
      logout();
      alert('Your account has been permanently deleted.');
      navigate('/');
    } catch (err) {
      console.error('Account deletion error:', err);
      setError('Failed to delete account');
      setShowDeleteModal(false);
      setLoading(false);
    }
  };

  const toggleEdit = () => {
    setEditMode(prev => {
      const nextMode = !prev;
      if (nextMode) {
        // Small delay to ensure the DOM element is rendered before scrolling
        setTimeout(() => {
          editFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
      return nextMode;
    });
  };

  if (loading) {
    return <main className="loading">Loading dashboard...</main>;
  }

  return (
    <main className="dashboard-page">
      <div className="container">
        <h1>My Dashboard</h1>

        {error && <div className="error">{error}</div>}

        <div className="dashboard-main-content">
          {/* User Info Card */}
          <section className="dashboard-card user-info">
            <h2>My Profile</h2>
            <div className="info-content">
              <div className="info-item">
                <strong>Email:</strong>
                <span>{user?.email}</span>
              </div>
              <div className="info-item">
                <strong>Role:</strong>
                <span className="role-badge">{user?.role || 'Tourist'}</span>
              </div>
              <div className="info-item">
                <strong>Member Since:</strong>
                <span>{memberSince ? new Date(memberSince).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
            <button onClick={toggleEdit} className="btn btn-primary" style={{ marginTop: '16px', padding: '10px 24px', fontWeight: '700' }}>
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </section>

          {/* System Status */}
          {systemStatus && (
            <section className="dashboard-card system-status">
              <h2>System Status</h2>
              <div className="status-content">
                <p>
                  <strong>Status:</strong>
                  <span className="status-badge status-online">{systemStatus.status}</span>
                </p>
                <p><strong>Message:</strong> {systemStatus.message}</p>
                <p>
                  <strong>Server Time:</strong> {new Date(systemStatus.database_time).toLocaleString()}
                </p>
              </div>
            </section>
          )}

          {/* Quick Actions */}
          <section className="dashboard-card quick-actions">
            <h2>Quick Actions</h2>
            <div className="actions-grid">
              {user?.role === 'tourist' && (
                <>
                  <a href="/places" className="action-btn">
                    <FaMapMarkedAlt /> Explore Places
                  </a>
                  <a href="/itinerary" className="action-btn">
                    <FaListAlt /> My Itineraries
                  </a>
                </>
              )}
              {user?.role === 'guide' && (
                <>
                  <button 
                    onClick={() => navigate('/travel-guides', { state: { openProfileId: user.id } })}
                    className="action-btn"
                  >
                    <FaUserTie /> View My Portfolio
                  </button>
                  <a href="/clients" className="action-btn">
                    <FaBriefcase /> My Clients
                  </a>
                </>
              )}
              {user?.role === 'tourist' && (
                <a href="/travel-guides" className="action-btn">
                  <FaUsers /> Find Guides
                </a>
              )}
              <button 
                onClick={logout} 
                className="action-btn action-danger"
              >
                <FaSignOutAlt /> Logout
              </button>
              <button 
                onClick={() => setShowDeleteModal(true)} 
                className="action-btn action-danger"
                style={{ 
                  backgroundColor: '#ef4444', 
                  color: 'white', 
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)'
                }}
              >
                <FaTrashAlt style={{ color: 'white' }} /> Delete Account
              </button>
            </div>
          </section>

          {/* Delete Account Confirmation Modal */}
          {showDeleteModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 2000,
              backdropFilter: 'blur(5px)'
            }} onClick={() => setShowDeleteModal(false)}>
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '2px solid #ef4444',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
                textAlign: 'center'
              }} onClick={e => e.stopPropagation()}>
                <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⚠️</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#ef4444', marginBottom: '16px' }}>
                  Delete Your Account?
                </h3>
                <p style={{ color: 'var(--text-body)', marginBottom: '8px', lineHeight: '1.6' }}>
                  This action <strong>cannot be undone</strong>. All your personal data, bookings, itineraries, and messages will be permanently deleted from the database.
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                  Are you sure you want to proceed?
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button 
                    onClick={() => setShowDeleteModal(false)}
                    className="btn btn-secondary"
                    style={{ 
                      padding: '10px 24px', 
                      borderRadius: '8px',
                      backgroundColor: 'rgba(79,70,229,0.1)',
                      color: 'var(--primary)',
                      border: '1px solid rgba(79,70,229,0.3)',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    style={{ 
                      padding: '10px 24px', 
                      borderRadius: '8px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      fontWeight: '700',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1
                    }}
                  >
                    {loading ? 'Deleting...' : 'Yes, Delete My Account'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Profile Form - Full Width under the cards if active */}
        {editMode && (
          <section ref={editFormRef} className="dashboard-card edit-form" style={{ marginTop: '32px' }}>
            <h2>Edit Profile</h2>
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name || ''}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="form-group">
                <label>Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio || ''}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself"
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label>{user.role === 'guide' ? 'Covered Locations' : 'Location'}</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                  placeholder={user.role === 'guide' ? "Locations you guide (e.g. Sigiriya)" : "Your location"}
                />
              </div>

              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="tel"
                  name="contact_number"
                  value={formData.contact_number || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., 0712345678"
                  pattern="^0[0-9]{9}$"
                  title="Please enter a 10-digit phone number starting with 0"
                  maxLength="10"
                  required
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Please enter a 10-digit phone number starting with 0.</p>
              </div>

              {user.role === 'guide' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaIdCard style={{ color: 'var(--primary)' }} /> License Number
                    </label>
                    <input
                      type="text"
                      name="license_number"
                      value={formData.license_number || ''}
                      onChange={handleInputChange}
                      placeholder="License number"
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaHistory style={{ color: 'var(--primary)' }} /> Experience (Years)
                    </label>
                    <input
                      type="number"
                      name="experience_years"
                      value={formData.experience_years || 0}
                      onChange={handleInputChange}
                      placeholder="Years"
                    />
                  </div>
                </div>
              )}

              {user.role === 'guide' && (
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaLanguage style={{ color: 'var(--primary)' }} /> Languages (comma separated)
                  </label>
                  <input
                    type="text"
                    name="languages"
                    value={formData.languages || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. English, Sinhala, French"
                  />
                </div>
              )}

              {user.role === 'guide' && (
                <>
                  <div className="form-group">
                    <label style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-head)' }}>
                      <FaCamera style={{ color: 'var(--primary)' }} /> Profile Picture
                    </label>
                    {imagePreview && (
                      <div style={{ 
                        marginBottom: '16px',
                        padding: '12px',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderRadius: '12px',
                        border: '1px solid var(--border)',
                        display: 'inline-block'
                      }}>
                        <img 
                          src={imagePreview} 
                          alt="Profile Preview" 
                          style={{ 
                            maxWidth: '180px', 
                            maxHeight: '180px', 
                            borderRadius: '10px',
                            display: 'block'
                          }}
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      id="dashboard-profile-upload"
                      style={{ display: 'none' }}
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="dashboard-profile-upload" className="btn btn-primary" style={{ width: 'fit-content' }}>
                      Change Photo
                    </label>
                  </div>
                  {/* ... other guide fields ... */}
                </>
              )}

              <button type="submit" className="btn btn-success" style={{ width: 'fit-content', marginTop: '20px', padding: '12px 40px' }}>
                Save Changes
              </button>
            </form>
          </section>
        )}


        {/* Statistics - Full Width at Bottom */}
        <section className="dashboard-card stats" style={{ marginTop: '32px' }}>
          <h2>Dashboard Statistics</h2>
          <div className="stats-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '20px' 
          }}>
            {user?.role === 'guide' ? (
              <>
                <div className="stat-item" style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                  <FaClock style={{ fontSize: '1.5rem', color: 'var(--warning)', marginBottom: '10px' }} />
                  <div className="stat-value" style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>{guideStats.pending}</div>
                  <div className="stat-label" style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.5px' }}>Pending Requests</div>
                </div>
                <div className="stat-item" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                  <FaCheckCircle style={{ fontSize: '1.5rem', color: '#10b981', marginBottom: '10px' }} />
                  <div className="stat-value" style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>{guideStats.accepted}</div>
                  <div className="stat-label" style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.5px' }}>Accepted Clients</div>
                </div>
                <div className="stat-item" style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                  <FaBriefcase style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '10px' }} />
                  <div className="stat-value" style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>{guideStats.total}</div>
                  <div className="stat-label" style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.5px' }}>Total Jobs</div>
                </div>
              </>
            ) : (
              <>
                <div className="stat-item" style={{ backgroundColor: 'rgba(79, 70, 229, 0.05)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                  <FaListAlt style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '10px' }} />
                  <div className="stat-value" style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary)' }}>{touristStats.itineraries}</div>
                  <div className="stat-label" style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.5px' }}>Total Itineraries</div>
                </div>
                <div className="stat-item" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                  <FaHistory style={{ fontSize: '1.5rem', color: '#10b981', marginBottom: '10px' }} />
                  <div className="stat-value" style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>{touristStats.reviews}</div>
                  <div className="stat-label" style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.5px' }}>Total Reviews</div>
                </div>
              </>
            )}
          </div>
        </section>

      </div>
    </main>
  );
};

export default DashboardPage;
