const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            throw new Error();
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};

const admin = (req, res, next) => {
    console.log(`Checking admin for user: ${req.user ? req.user.email : 'Unknown'}, isAdmin: ${req.user ? req.user.isAdmin : 'false'}`);
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        console.log(`Admin access denied for user: ${req.user ? req.user.email : 'Unknown'}`);
        res.status(403).json({ error: 'Access denied. Admin only.' });
    }
};

module.exports = { auth, admin };
