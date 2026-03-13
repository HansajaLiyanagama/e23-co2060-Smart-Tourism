const placesRepo = require('../repositories/placesRepo');

/**
 * PLACES CONTROLLER
 * Handles requests related to travel destinations/places.
 * Orchestrates between routes and database repository.
 */

/**
 * GET /api/places
 * Fetch all places (with optional search filter)
 */
async function getPlaces(req, res) {
    try {
        const { search, category } = req.query;

        let places;

        if (search) {
            // If search parameter provided, search for matching places
            places = await placesRepo.searchPlaces(search);
        } else if (category) {
            // If category parameter provided, filter by category
            places = await placesRepo.getPlacesByCategory(category);
        } else {
            // Return all places
            places = await placesRepo.getAllPlaces();
        }

        // Return success response
        res.status(200).json({
            success: true,
            data: places,
            count: places.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in getPlaces controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch places',
            error: error.message
        });
    }
}

/**
 * GET /api/places/:id
 * Fetch single place by ID
 */
async function getPlaceDetail(req, res) {
    try {
        const { id } = req.params;

        // Validate ID
        if (!id || isNaN(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid place ID'
            });
        }

        const place = await placesRepo.getPlaceById(parseInt(id));

        if (!place) {
            return res.status(404).json({
                success: false,
                message: 'Place not found'
            });
        }

        res.status(200).json({
            success: true,
            data: place,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error in getPlaceDetail controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch place details',
            error: error.message
        });
    }
}

module.exports = {
    getPlaces,
    getPlaceDetail
};
