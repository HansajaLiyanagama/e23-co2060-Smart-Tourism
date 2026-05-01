import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services';
import { FaMapMarkerAlt, FaCompass, FaUser, FaSignOutAlt, FaHome } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    let interval;
    if (isAuthenticated() && user?.role === 'guide') {
      const fetchCount = async () => {
        try {
          const res = await bookingService.getNotificationCount(user.id);
          setNotifications(res.data.count || 0);
        } catch (err) {
          console.error(err);
        }
      };
      fetchCount();
      interval = setInterval(fetchCount, 30000); // Poll every 30s
    }
    return () => clearInterval(interval);
  }, [user, isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <FaCompass className="navbar-icon" />
          Tourism System
        </Link>
        
        <ul className="nav-menu">
          <li>
            <Link to="/" className="nav-link">
              <FaHome /> Home
            </Link>
          </li>
          {(!isAuthenticated() || user?.role === 'tourist') && (
            <li>
              <Link to="/places" className="nav-link">
                <FaMapMarkerAlt /> Places
              </Link>
            </li>
          )}
          <li>
            <Link to="/travel-guides" className="nav-link">
              <FaCompass /> Travel Guides
            </Link>
          </li>
          
          {isAuthenticated() ? (
            <>
              {user?.role === 'tourist' && (
                <li>
                  <Link to="/itinerary" className="nav-link">
                    📋 My Itinerary
                  </Link>
                </li>
              )}
              {user?.role === 'guide' && (
                <li>
                  <Link to="/clients" className="nav-link" style={{ position: 'relative' }}>
                    👥 Clients
                    {notifications > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        borderRadius: '50%',
                        padding: '2px 6px',
                        fontSize: '10px',
                        fontWeight: 'bold'
                      }}>
                        {notifications}
                      </span>
                    )}
                  </Link>
                </li>
              )}
              <li>
                <Link to="/dashboard" className="nav-link">
                  <FaUser /> Dashboard
                </Link>
              </li>
              <li className="nav-user">
                <span className="user-name">{user?.email}</span>
                <button onClick={handleLogout} className="nav-link logout-btn">
                  <FaSignOutAlt /> Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login" className="nav-link login-link">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="nav-link register-link">
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
