import { useState, useEffect } from 'react';

function Home() {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    // This function reaches out to your backend to get the places
    const fetchPlaces = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/places');
        const data = await response.json();
        
        if (response.ok) {
          // Save the array of places into our React state
          setPlaces(data);
        }
      } catch (error) {
        console.error("Error fetching places:", error);
      }
    };

    // Call the function immediately when the component loads
    fetchPlaces();
  }, []); // The empty array means "only run this once when the page opens"

  return (
    <div>
      <h2>Tourist Map</h2>
      <p>Welcome to the Smart Tourism System!</p>
      
      <hr />
      
      <h3>Destinations:</h3>
      {places.length === 0 ? (
        <p>Loading places...</p>
      ) : (
        <ul>
          {places.map((place) => (
            // We use the database ID as a unique key for React
            <li key={place.id}>
              <strong>{place.name}</strong> <br />
              Coordinates: {place.latitude}, {place.longitude}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Home;