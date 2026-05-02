const userRepo = require('../repositories/userRepo');

/**
 * USER CONTROLLER
 * Handles user profile operations
 */

/**
 * GET /api/users/:id/profile
 * Fetch user profile (either tourist or guide)
 */
async function getUserProfile(req, res) {
    try {
        const { id } = req.params;

        // Get user profile
        const profile = await userRepo.getUserProfile(id);

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }

        res.status(200).json({
            success: true,
            profile
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
}

/**
 * POST /api/users/:id/profile
 * Create or update tourist profile
 */
async function updateTouristProfile(req, res) {
    try {
        const { id } = req.params;
        const { full_name, nationality } = req.body;

        if (!full_name) {
            return res.status(400).json({ error: 'Full name is required' });
        }

        const profile = await userRepo.updateTouristProfile(id, full_name, nationality);

        res.status(200).json({
            success: true,
            message: 'Tourist profile updated successfully',
            profile
        });
    } catch (error) {
        console.error('Error updating tourist profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
}

/**
 * POST /api/users/:id/guide-profile
 * Create or update guide profile
 */
async function updateGuideProfile(req, res) {
    try {
        const { id } = req.params;
        const { 
            full_name, 
            bio, 
            license_number, 
            hourly_rate, 
            contact_number, 
            profile_image_url, 
            specialization, 
            experience_years, 
            languages,
            covered_locations
        } = req.body;

        if (!full_name) {
            return res.status(400).json({ error: 'Full name is required' });
        }

        const profile = await userRepo.updateGuideProfile(
            id,
            full_name,
            bio,
            license_number,
            hourly_rate,
            contact_number,
            profile_image_url,
            specialization,
            experience_years,
            languages,
            covered_locations
        );

        res.status(200).json({
            success: true,
            message: 'Guide profile updated successfully',
            profile
        });
    } catch (error) {
        console.error('Error updating guide profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
}

/**
 * DELETE /api/users/:id/account
 * Permanently delete user account and all related data
 */
async function deleteAccount(req, res) {
    try {
        const { id } = req.params;
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'No authorization token provided' });
        }

        // Delete the user
        const deletedUser = await userRepo.deleteUser(id);

        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Account and all associated data have been permanently deleted'
        });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ error: 'Failed to delete account' });
    }
}

/**
 * GET /api/users/:id/stats
 * Fetch dashboard statistics for a user
 */
async function getUserStats(req, res) {
    try {
        const { id } = req.params;
        const stats = await userRepo.getUserStats(id);
        res.status(200).json({
            success: true,
            stats
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
}

module.exports = {
    getUserProfile,
    updateTouristProfile,
    updateGuideProfile,
    deleteAccount,
    getUserStats
};
