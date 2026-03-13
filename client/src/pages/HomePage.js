import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HomePage.css';
import { FaMapMarkerAlt, FaRoute, FaUserTie, FaSearch } from 'react-icons/fa';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <main className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Discover the World, Plan Your Journey</h1>
          <p>Smart Tourism Management System - Your Complete Travel Companion</p>
          <div className="hero-buttons">
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
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <FaMapMarkerAlt className="feature-icon" />
              <h3>Explore Places</h3>
              <p>Discover thousands of amazing travel destinations with detailed information and reviews.</p>
            </div>

            <div className="feature-card">
              <FaRoute className="feature-icon" />
              <h3>Plan Itineraries</h3>
              <p>Create custom travel itineraries and organize places in a logical travel sequence.</p>
            </div>

            <div className="feature-card">
              <FaUserTie className="feature-icon" />
              <h3>Travel Guides</h3>
              <p>Connect with experienced travel guides to enhance your journey with local insights.</p>
            </div>

            <div className="feature-card">
              <FaSearch className="feature-icon" />
              <h3>Smart Search</h3>
              <p>Find places using advanced search algorithms - by name, location, or proximity.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2>How It Works</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Create Account</h3>
              <p>Sign up to unlock all features</p>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <h3>Explore Places</h3>
              <p>Browse destinations and reviews</p>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <h3>Plan Your Trip</h3>
              <p>Create custom itineraries</p>
            </div>

            <div className="step">
              <div className="step-number">4</div>
              <h3>Connect & Share</h3>
              <p>Share experiences and reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Start Your Adventure?</h2>
          {!isAuthenticated() ? (
            <Link to="/register" className="btn btn-primary btn-large">
              Register Now
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
