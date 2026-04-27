const placeRepo = require('../repositories/placeRepo');

const getPlaces = async (req, res) => {
    try {
        const places = await placeRepo.getAllPlaces();
        res.status(200).json(places);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch places' });
    }
};

const addPlace = async (req, res) => {
    try {
        // NEW: Destructure category and district as well
        const { name, description, latitude, longitude, image_url, category, district } = req.body;
        
        // Pass the new fields to the repo
        const newPlace = await placeRepo.createPlace(
            name, 
            description, 
            latitude, 
            longitude, 
            image_url, 
            category, 
            district
        );
        res.status(201).json(newPlace);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create place' });
    }
};

module.exports = { getPlaces, addPlace };