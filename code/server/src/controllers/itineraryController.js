const itineraryRepo = require('../repositories/itineraryRepo');

const createTrip = async (req, res) => {
    try {
        const touristId = req.user.id; // Comes from your verifyToken middleware
        
        // Extract 'places' alongside the other data from the frontend
        const { title, startDate, endDate, places } = req.body;

        if (!title || !startDate || !endDate) {
            return res.status(400).json({ error: 'Please provide title, start date, and end date.' });
        }

        // Pass the places array into the repo
        const newItinerary = await itineraryRepo.createItinerary(
            touristId, 
            title, 
            startDate, 
            endDate, 
            places
        );
        
        res.status(201).json({ 
            message: 'Trip and locations saved successfully!', 
            itinerary: newItinerary 
        });

    } catch (error) {
        console.error('Error creating trip with locations:', error);
        res.status(500).json({ error: 'Internal server error while creating trip' });
    }
};

module.exports = { createTrip };