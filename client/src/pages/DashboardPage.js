import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileService, systemService } from '../services';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile (must provide the currently logged in user's id)
      if (user && user.id) {
        const profileResponse = await profileService.getProfile(user.id);
        const profile = profileResponse.data.profile;
        setProfile(profile);

        // copy server values into form state
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
      }
      
      // Fetch system status
      const statusResponse = await systemService.getStatus();
      setSystemStatus(statusResponse.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      if (!user || !user.id) throw new Error('User not available');

      // Coordinate field mappings for server expectations
      const payload = {
          ...formData,
          covered_locations: user.role === 'guide' ? formData.location : undefined,
          nationality: user.role === 'tourist' ? formData.location : undefined
      };

      // send the updated data along with the user's role so the proper endpoint is used
      await profileService.updateProfile(user.id, payload, user.role);
      setProfile(prev => ({ ...prev, ...formData }));
      setEditMode(false);
      alert('Portfolio updated successfully!');
    } catch (err) {
      console.error('Profile update error', err);
      setError('Failed to update profile');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <main className="loading">Loading dashboard...</main>;
  }

  return (
    <main className="dashboard-page">
      <div className="container">
        <h1>My Dashboard</h1>

        {error && <div className="error">{error}</div>}

        <div className="dashboard-grid">
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
                <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
            </div>
            <button onClick={() => setEditMode(!editMode)} className="btn btn-primary">
              {editMode ? 'Cancel' : 'Edit Profile'}
            </button>
          </section>

          {/* Edit Profile Form */}
          {editMode && (
            <section className="dashboard-card edit-form">
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

                {user.role === 'guide' && (
                  <>
                    <div className="form-group">
                      <label>Contact Number</label>
                      <input
                        type="text"
                        name="contact_number"
                        value={formData.contact_number || ''}
                        onChange={handleInputChange}
                        placeholder="Your contact number"
                      />
                    </div>
                    
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Hourly Rate ($)</label>
                        <input
                          type="number"
                          name="hourly_rate"
                          value={formData.hourly_rate || ''}
                          onChange={handleInputChange}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="form-group">
                        <label>Years of Experience</label>
                        <input
                          type="number"
                          name="experience_years"
                          value={formData.experience_years || ''}
                          onChange={handleInputChange}
                          placeholder="5"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Languages (comma separated)</label>
                      <input
                        type="text"
                        name="languages"
                        value={formData.languages || ''}
                        onChange={handleInputChange}
                        placeholder="English, Sinhala, French"
                      />
                    </div>

                    <div className="form-group">
                      <label>Specialization</label>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization || ''}
                        onChange={handleInputChange}
                        placeholder="e.g. Historical & Cultural"
                      />
                    </div>

                    <div className="form-group">
                      <label>License Number</label>
                      <input
                        type="text"
                        name="license_number"
                        value={formData.license_number || ''}
                        onChange={handleInputChange}
                        placeholder="GUIDE-XXXX"
                      />
                    </div>
                  </>
                )}

                <button type="submit" className="btn btn-success">
                  Save Portfolio Changes
                </button>
              </form>
            </section>
          )}

          {/* Statistics */}
          <section className="dashboard-card stats">
            <h2>Statistics</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">Itineraries</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">Reviews</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">Saved Places</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">0</div>
                <div className="stat-label">Experience Points</div>
              </div>
            </div>
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
                    🗺️ Explore Places
                  </a>
                  <a href="/itinerary" className="action-btn">
                    📋 My Itineraries
                  </a>
                </>
              )}
              {user?.role === 'guide' && (
                <a href="/travel-guides" className="action-btn">
                  👤 View My Portfolio
                </a>
              )}
              <a href="/travel-guides" className="action-btn">
                👨‍🏫 Find Guides
              </a>
              <button 
                onClick={logout} 
                className="action-btn action-danger"
              >
                🚪 Logout
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default DashboardPage;
