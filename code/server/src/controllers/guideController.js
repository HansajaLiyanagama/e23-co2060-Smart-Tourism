const guideRepo = require('../repositories/guideRepo');

// Update guide profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bio, licenseNumber, hourlyRate } = req.body;

        const updatedProfile = await guideRepo.updateGuideProfile(userId, bio, licenseNumber, hourlyRate);

        if (!updatedProfile) {
            return res.status(404).json({ error: 'Guide profile not found' });
        }

        res.status(200).json({ message: 'Profile updated successfully!', profile: updatedProfile });
    } catch (error) {
        console.error('Error updating guide profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// NEW: Get all guides
const getGuides = async (req, res) => {
    try {
        const guides = await guideRepo.getAllGuides();
        res.status(200).json({
            message: 'Guides fetched successfully',
            guides: guides
        });
    } catch (error) {
        console.error('Error fetching guides:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { 
    updateProfile, 
    getGuides 
};