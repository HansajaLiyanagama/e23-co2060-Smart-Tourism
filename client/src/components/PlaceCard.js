import React from 'react';
import './PlaceCard.css';

const PlaceCard = ({ place, onViewDetails, onAddToItinerary }) => {
  return (
    <div className="place-card">
      {place.image_url && (
        <div className="place-image">
          <img src={place.image_url} alt={place.name} />
        </div>
      )}
      <div className="place-content">
        <h3>{place.name}</h3>
        {place.category && <span className="category-tag">{place.category}</span>}
        
        <p className="description">{place.description?.substring(0, 100)}...</p>
        
        {place.latitude && place.longitude && (
          <p className="location">
            📍 {parseFloat(place.latitude).toFixed(4)}, {parseFloat(place.longitude).toFixed(4)}
          </p>
        )}
        
        {place.rating && (
          <p className="rating">⭐ {parseFloat(place.rating).toFixed(1)}/5</p>
        )}
        
        <div className="card-actions">
          {onViewDetails && (
            <button 
              className="btn btn-primary" 
              onClick={() => onViewDetails(place.id)}
            >
              View Details
            </button>
          )}
          {onAddToItinerary && (
            <button 
              className="btn btn-success" 
              onClick={() => onAddToItinerary(place.id)}
            >
              Add to Trip
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;
