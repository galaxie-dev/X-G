import { userDB } from './database.js';

class UserService {
    constructor() {
        this.init();
    }

    async init() {
        await userDB.init();
    }

    // User Profile Operations
    async createProfile(userData) {
        const { email, username, handle } = userData;
        
        // Check if email, username or handle already exists
        try {
            const existingEmail = await userDB.queryByIndex('profiles', 'email', email);
            const existingUsername = await userDB.queryByIndex('profiles', 'username', username);
            const existingHandle = await userDB.queryByIndex('profiles', 'handle', handle);

            if (existingEmail.length > 0) throw new Error('Email already exists');
            if (existingUsername.length > 0) throw new Error('Username already exists');
            if (existingHandle.length > 0) throw new Error('Handle already exists');

            // Create new profile
            const profile = {
                ...userData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                followers: [],
                following: [],
                postCount: 0
            };

            const profileId = await userDB.add('profiles', profile);
            
            // Create default settings
            await userDB.add('settings', {
                userId: profileId,
                theme: 'light',
                notifications: true,
                privacy: {
                    isPrivate: false,
                    showEmail: false
                }
            });

            return profileId;
        } catch (error) {
            throw error;
        }
    }

    async getProfile(userId) {
        return userDB.get('profiles', userId);
    }

    async updateProfile(userId, updates) {
        const profile = await this.getProfile(userId);
        if (!profile) throw new Error('Profile not found');

        const updatedProfile = {
            ...profile,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        return userDB.put('profiles', updatedProfile);
    }

    async deleteProfile(userId) {
        // Delete profile and associated settings
        await userDB.delete('settings', userId);
        return userDB.delete('profiles', userId);
    }

    // User Settings Operations
    async getSettings(userId) {
        return userDB.get('settings', userId);
    }

    async updateSettings(userId, updates) {
        const settings = await this.getSettings(userId);
        if (!settings) throw new Error('Settings not found');

        const updatedSettings = {
            ...settings,
            ...updates
        };

        return userDB.put('settings', updatedSettings);
    }

    // Follow/Unfollow Operations
    async followUser(userId, targetUserId) {
        const [user, targetUser] = await Promise.all([
            this.getProfile(userId),
            this.getProfile(targetUserId)
        ]);

        if (!user || !targetUser) throw new Error('User not found');

        // Update following list for current user
        if (!user.following.includes(targetUserId)) {
            user.following.push(targetUserId);
            await this.updateProfile(userId, { following: user.following });
        }

        // Update followers list for target user
        if (!targetUser.followers.includes(userId)) {
            targetUser.followers.push(userId);
            await this.updateProfile(targetUserId, { followers: targetUser.followers });
        }
    }

    async unfollowUser(userId, targetUserId) {
        const [user, targetUser] = await Promise.all([
            this.getProfile(userId),
            this.getProfile(targetUserId)
        ]);

        if (!user || !targetUser) throw new Error('User not found');

        // Update following list for current user
        user.following = user.following.filter(id => id !== targetUserId);
        await this.updateProfile(userId, { following: user.following });

        // Update followers list for target user
        targetUser.followers = targetUser.followers.filter(id => id !== userId);
        await this.updateProfile(targetUserId, { followers: targetUser.followers });
    }

    // Search Operations
    async searchUsers(query) {
        const allProfiles = await userDB.getAll('profiles');
        return allProfiles.filter(profile => 
            profile.username.toLowerCase().includes(query.toLowerCase()) ||
            profile.handle.toLowerCase().includes(query.toLowerCase())
        );
    }
}

export const userService = new UserService();
