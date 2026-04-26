const requestRepo = require('../repositories/requestRepo');

const createBookingRequest = async (req, res) => {
    try {
        const touristId = req.user.id; // Securely pulled from the JWT token
        const { itineraryId, guideId } = req.body; // Pulled from the frontend button click

        if (!itineraryId || !guideId) {
            return res.status(400).json({ error: 'Please create an itinerary first before requesting a guide.' });
        }

        const newRequest = await requestRepo.createRequest(itineraryId, touristId, guideId);
        
        res.status(201).json({ 
            message: 'Request sent to guide successfully!', 
            request: newRequest 
        });
    } catch (error) {
        console.error('Error creating booking request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { createBookingRequest };