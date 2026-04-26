const requestRepo = require('../repositories/requestRepo');

// Existing: Create a request
const createBookingRequest = async (req, res) => {
    try {
        const touristId = req.user.id; 
        const { itineraryId, guideId } = req.body; 

        if (!itineraryId || !guideId) {
            return res.status(400).json({ error: 'Please create an itinerary first before requesting a guide.' });
        }

        const newRequest = await requestRepo.createRequest(itineraryId, touristId, guideId);
        res.status(201).json({ message: 'Request sent to guide successfully!', request: newRequest });
    } catch (error) {
        console.error('Error creating booking request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// NEW: Get all requests for the logged-in guide
const getRequestsForGuide = async (req, res) => {
    try {
        const guideId = req.user.id; // From the JWT token
        const requests = await requestRepo.getRequestsByGuideId(guideId);
        
        res.status(200).json({ requests });
    } catch (error) {
        console.error('Error fetching guide requests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// NEW: Update request status
const updateStatus = async (req, res) => {
    try {
        const guideId = req.user.id; // From the JWT token
        const requestId = req.params.id; // From the URL parameters
        const { status } = req.body; // 'accepted' or 'declined'

        const updatedRequest = await requestRepo.updateRequestStatus(requestId, guideId, status);
        
        if (!updatedRequest) {
            return res.status(404).json({ error: 'Request not found or unauthorized' });
        }

        res.status(200).json({ message: `Request ${status} successfully!`, request: updatedRequest });
    } catch (error) {
        console.error('Error updating request status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// NEW: Get all requests for the logged-in tourist
const getRequestsForTourist = async (req, res) => {
    try {
        const touristId = req.user.id; // From the JWT token
        const requests = await requestRepo.getRequestsByTouristId(touristId);
        
        res.status(200).json({ requests });
    } catch (error) {
        console.error('Error fetching tourist requests:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Add it to your exports at the bottom
module.exports = { 
    createBookingRequest, 
    getRequestsForGuide, 
    updateStatus, 
    getRequestsForTourist 
};

