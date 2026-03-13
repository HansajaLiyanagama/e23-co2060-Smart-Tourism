import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services';
import './DashboardPage.css'; // Reuse dashboard styles

const ClientsPage = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [quotePrice, setQuotePrice] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingService.getGuideBookings(user.id);
      setBookings(response.data.bookings || []);
    } catch (err) {
      setError('Failed to load client requests');
    } finally {
      setLoading(false);
    }
  };

  const handleQuotePrice = async (e) => {
    e.preventDefault();
    if (!quotePrice.trim()) {
      setError('Please enter a price quote');
      return;
    }

    try {
      setLoading(true);
      // Now sending as string to allow currency symbols
      await bookingService.quotePrice(selectedBooking.id, quotePrice);
      setSuccess('Quote sent successfully!');
      setSelectedBooking(null);
      setQuotePrice('');
      fetchBookings();
    } catch (err) {
      setError('Failed to send quote');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId) => {
    try {
      setLoading(true);
      await bookingService.acceptQuote(bookingId);
      setSuccess('Booking accepted!');
      fetchBookings();
    } catch (err) {
      setError('Failed to accept booking');
    } finally {
      setLoading(false);
    }
  };

  if (loading && bookings.length === 0) return <div className="container">Loading...</div>;

  return (
    <main className="dashboard-page">
      <div className="container">
        <h1>Client Requests</h1>
        <p>Manage your itinerary assistance requests from tourists</p>

        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="dashboard-grid">
          <section className="dashboard-card">
            <h2>Recent Requests</h2>
            {bookings.length === 0 ? (
              <p>No requests found yet.</p>
            ) : (
              <div className="bookings-list">
                {bookings.map(booking => (
                  <div key={booking.id} className="booking-item" style={{
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    marginBottom: '15px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0 }}>{booking.itinerary_title}</h4>
                      <span className={`status-badge status-${booking.status}`}>
                        {booking.status.toUpperCase()}
                      </span>
                    </div>
                    <p><strong>Tourist:</strong> {booking.tourist_email}</p>
                    <p><strong>Dates:</strong> {booking.start_date} to {booking.end_date}</p>
                    {booking.notes && <p><em>"{booking.notes}"</em></p>}
                    
                    {booking.status === 'pending' && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => setSelectedBooking(booking)}
                      >
                        Quote a Price
                      </button>
                    )}

                    {booking.status === 'quoted' && (
                      <p style={{ color: '#2ecc71', fontWeight: 'bold' }}>
                        Quoted Price: {booking.quoted_price}
                      </p>
                    )}

                    {booking.status === 'accepted' && (
                      <div style={{ backgroundColor: '#e8f5e9', padding: '15px', borderRadius: '4px', border: '1px solid #c8e6c9' }}>
                        <p style={{ color: '#2e7d32', margin: '0 0 10px 0', fontWeight: 'bold' }}>
                          ✅ Booking Confirmed for {booking.quoted_price}
                        </p>
                        <div style={{ fontSize: '0.9rem', borderTop: '1px solid #c8e6c9', paddingTop: '10px' }}>
                          <p><strong>Name:</strong> {booking.tourist_name}</p>
                          <p><strong>Contact:</strong> <a href={`tel:${booking.tourist_contact}`} style={{ color: '#2e7d32', fontWeight: 'bold' }}>{booking.tourist_contact}</a></p>
                          <p><strong>Email:</strong> {booking.tourist_email}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {selectedBooking && (
            <div className="modal-overlay" style={{
                position: 'fixed',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000
            }}>
              <div className="modal-box" style={{
                  backgroundColor: 'white',
                  padding: '30px',
                  borderRadius: '12px',
                  maxWidth: '400px',
                  width: '90%'
              }}>
                <h3>Quote Price for {selectedBooking.itinerary_title}</h3>
                <form onSubmit={handleQuotePrice}>
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <label>Assistance Fee (Include Currency)</label>
                    <input 
                      type="text" 
                      value={quotePrice}
                      onChange={(e) => setQuotePrice(e.target.value)}
                      placeholder="e.g. 50 USD or 5000 LKR"
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Send Quote</button>
                    <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setSelectedBooking(null)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ClientsPage;
