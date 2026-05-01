import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';
import { FaMapMarkerAlt, FaRoute, FaUserTie, FaSearch } from 'react-icons/fa';

const HomePage = () => {
  const { user, isAuthenticated } = useAuth();
  const isGuide = user?.role === 'guide';

  return (
    <main className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>{isGuide ? 'Welcome Back, Travel Guide' : 'Discover the World, Plan Your Journey'}</h1>
          <p>
            {isGuide
              ? 'Manage your booking requests, update your guide profile, and connect with tourists.'
              : 'Smart Tourism Management System - Your Complete Travel Companion'}
          </p>
          <div className="hero-buttons">
            {isGuide ? (
              <>
                <Link to="/dashboard" className="btn btn-primary btn-large">
                  My Dashboard
                </Link>
                <Link to="/clients" className="btn btn-success btn-large">
                  Client Requests
                </Link>
              </>
            ) : (
              <>
                <Link to="/places" className="btn btn-primary btn-large">
                  Explore Places
                </Link>
                {!isAuthenticated() ? (
                  <Link to="/register" className="btn btn-success btn-large">
                    Get Started
                  </Link>
                ) : (
                  <Link to="/itinerary" className="btn btn-success btn-large">
                    Plan Your Trip
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>{isGuide ? 'Powerful Guide Tools' : 'Why Choose Us?'}</h2>
          <div className="features-grid">
            <div className="feature-card">
              <FaMapMarkerAlt className="feature-icon" />
              <h3>{isGuide ? 'Manage Requests' : 'Explore Places'}</h3>
              <p>
                {isGuide
                  ? 'Review and respond to traveler requests, set quotes, and confirm bookings.'
                  : 'Discover thousands of amazing travel destinations with detailed information and reviews.'}
              </p>
            </div>

            <div className="feature-card">
              <FaRoute className="feature-icon" />
              <h3>{isGuide ? 'Update Your Profile' : 'Plan Itineraries'}</h3>
              <p>
                {isGuide
                  ? 'Keep your guide profile, photos, locations, and experience up to date.'
                  : 'Create custom travel itineraries and organize places in a logical travel sequence.'}
              </p>
            </div>

            <div className="feature-card">
              <FaUserTie className="feature-icon" />
              <h3>{isGuide ? 'Connect with Tourists' : 'Travel Guides'}</h3>
              <p>
                {isGuide
                  ? 'Use the chat feature to stay in touch with tourists and clarify details.'
                  : 'Connect with experienced travel guides to enhance your journey with local insights.'}
              </p>
            </div>

            <div className="feature-card">
              <FaSearch className="feature-icon" />
              <h3>{isGuide ? 'Build Your Visibility' : 'Smart Search'}</h3>
              <p>
                {isGuide
                  ? 'Get discovered by travelers looking for local expertise and tour support.'
                  : 'Find places using advanced search algorithms - by name, location, or proximity.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2>{isGuide ? 'How Guide Accounts Work' : 'How It Works'}</h2>
          <div className="steps">
            {isGuide ? (
              <>
                <div className="step">
                  <div className="step-number">1</div>
                  <h3>Complete Your Profile</h3>
                  <p>Add experience, languages, photos, and service locations.</p>
                </div>

                <div className="step">
                  <div className="step-number">2</div>
                  <h3>Receive Requests</h3>
                  <p>Get notified when tourists send guide booking requests.</p>
                </div>

                <div className="step">
                  <div className="step-number">3</div>
                  <h3>Quote and Chat</h3>
                  <p>Provide prices, talk with tourists, and confirm bookings fast.</p>
                </div>

                <div className="step">
                  <div className="step-number">4</div>
                  <h3>Deliver Memorable Tours</h3>
                  <p>Use itinerary details and customer feedback to grow your guide reputation.</p>
                </div>
              </>
            ) : (
              <>
                <div className="step">
                  <div className="step-number">1</div>
                  <h3>Create Account</h3>
                  <p>Sign up to unlock all features.</p>
                </div>

                <div className="step">
                  <div className="step-number">2</div>
                  <h3>Explore Places</h3>
                  <p>Browse destinations and reviews.</p>
                </div>

                <div className="step">
                  <div className="step-number">3</div>
                  <h3>Plan Your Trip</h3>
                  <p>Create custom itineraries.</p>
                </div>

                <div className="step">
                  <div className="step-number">4</div>
                  <h3>Connect & Share</h3>
                  <p>Share experiences and reviews.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>{isGuide ? 'Ready to Grow Your Guide Business?' : 'Ready to Start Your Adventure?'}</h2>
          {!isAuthenticated() ? (
            <Link to="/register" className="btn btn-primary btn-large">
              Register Now
            </Link>
          ) : isGuide ? (
            <Link to="/dashboard" className="btn btn-primary btn-large">
              Go to Dashboard
            </Link>
          ) : (
            <Link to="/places" className="btn btn-primary btn-large">
              Explore Places
            </Link>
          )}
        </div>
      </section>
    </main>
  );
};

export default HomePage;
