const guideRepo = require('../repositories/guideRepo');

const updateProfile = async (req, res) => {
    try {
        // We will get the securely verified user ID from the JWT token
        const userId = req.user.id; 
        
        // Grab the new details from the frontend form
        const { bio, licenseNumber, hourlyRate } = req.body;

        const updatedProfile = await guideRepo.updateGuideProfile(
            userId, 
            bio, 
            licenseNumber, 
            hourlyRate
        );

        if (!updatedProfile) {
            return res.status(404).json({ error: 'Guide profile not found' });
        }

        res.status(200).json({
            message: 'Profile updated successfully!',
            profile: updatedProfile
        });

    } catch (error) {
        console.error('Error updating guide profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { updateProfile };