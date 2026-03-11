const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const formattedEmail = email.toLowerCase();
        const existingUser = await User.findOne({ email: formattedEmail });
        if (existingUser) {
            return res.status(409).json({ message: 'Email is already registered. Please login.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            fullName,
            email: formattedEmail,
            password: hashedPassword
        });

        // Generate Token
        const token = jwt.sign(
            { id: newUser._id, isAdmin: newUser.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                name: newUser.fullName,
                email: newUser.email,
                isAdmin: newUser.isAdmin,
                savedTravelers: [],
                preferences: { berth: 'No Preference', food: 'Veg' }
            }
        });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const formattedEmail = email.toLowerCase();
        const user = await User.findOne({ email: formattedEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found. Please create an account.' });
        }

        // Compare password with hash
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Update Last Login
        user.lastLogin = new Date();
        await user.save();

        // Generate Token
        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.fullName,
                email: user.email,
                isAdmin: user.isAdmin,
                gender: user.gender,
                savedTravelers: user.savedTravelers,
                preferences: user.preferences
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ message: 'Email not found.' });
        }
        res.json({ message: 'Email verified.' });
    } catch (error) {
        console.error('Verify Email error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password updated successfully.' });
    } catch (error) {
        console.error('Reset Password error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;

        if (!userId || !oldPassword || !newPassword) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify old password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Incorrect old password' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });

    } catch (error) {
        console.error('Change Password error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, savedTravelers, preferences } = req.body;

        if (!fullName) {
            return res.status(400).json({ message: 'Full Name is required' });
        }

        const updateData = { fullName };
        if (savedTravelers) updateData.savedTravelers = savedTravelers;
        if (preferences) updateData.preferences = preferences;
        if (req.body.gender) updateData.gender = req.body.gender;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser._id,
                name: updatedUser.fullName,
                email: updatedUser.email,
                gender: updatedUser.gender,
                savedTravelers: updatedUser.savedTravelers,
                preferences: updatedUser.preferences
            }
        });

    } catch (error) {
        console.error('Update User error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// ADMIN: Get All Users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');

        // Transform _id to id for frontend compatibility if needed, though Mongoose returns _id. 
        // Frontend might expect 'id' string.
        const usersList = users.map(user => ({
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            isAdmin: user.isAdmin,
            lastLogin: user.lastLogin
        }));

        res.json(usersList);
    } catch (error) {
        console.error('Get All Users error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete User error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
