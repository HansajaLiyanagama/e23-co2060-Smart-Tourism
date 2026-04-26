const itineraryRepo = require('../repositories/itineraryRepo');

const createTrip = async (req, res) => {
    try {
        // Get the verified user ID from the token
        const userId = req.user.id; 
        
        // Grab the trip details from the frontend form
        const { title, startDate, endDate } = req.body;

        const newItinerary = await itineraryRepo.createItinerary(
            userId, 
            title, 
            startDate, 
            endDate
        );

        res.status(201).json({
            message: 'Itinerary created successfully!',
            itinerary: newItinerary
        });

    } catch (error) {
        console.error('Error creating itinerary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { createTrip };