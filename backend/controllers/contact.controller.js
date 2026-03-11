const Contact = require('../models/Contact');
const jwt = require('jsonwebtoken');

exports.submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, Email, and Message are required' });
        }

        // Try to get userId from token if present (but don't fail if not)
        let userId = null;
        try {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            }
        } catch (e) {
            // Silently fail, userId remains null
        }

        const newContact = await Contact.create({
            userId,
            name,
            email,
            subject: subject || 'General Inquiry',
            message
        });

        res.status(201).json({ success: true, id: newContact._id });
    } catch (error) {
        console.error('Submit Contact Error:', error);
        res.status(500).json({ error: 'Failed to submit contact message' });
    }
};

exports.getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (error) {
        console.error('Get All Contacts Error:', error);
        res.status(500).json({ error: 'Failed to fetch contact messages' });
    }
};

exports.replyToContact = async (req, res) => {
    try {
        const { reply } = req.body;
        if (!reply) return res.status(400).json({ error: 'Reply content is required' });

        const updated = await Contact.findByIdAndUpdate(
            req.params.id,
            {
                reply,
                status: 'replied',
                repliedAt: new Date()
            },
            { new: true }
        );

        if (!updated) return res.status(404).json({ error: 'Message not found' });
        res.json({ success: true, message: 'Reply sent successfully' });
    } catch (error) {
        console.error('Reply Contact Error:', error);
        res.status(500).json({ error: 'Failed to send reply' });
    }
};

exports.deleteContact = async (req, res) => {
    try {
        const deleted = await Contact.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Message not found' });
        res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Delete Contact Error:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
};

exports.getUserMessages = async (req, res) => {
    try {
        const contacts = await Contact.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(contacts);
    } catch (error) {
        console.error('Get User Messages Error:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
};

exports.userDeleteContact = async (req, res) => {
    try {
        const deleted = await Contact.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!deleted) return res.status(404).json({ error: 'Message not found or unauthorized' });
        res.json({ success: true, message: 'Message deleted successfully' });
    } catch (error) {
        console.error('User Delete Contact Error:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
};

exports.userReplyToContact = async (req, res) => {
    try {
        const { reply } = req.body;
        if (!reply) return res.status(400).json({ error: 'Reply content is required' });

        const updated = await Contact.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            {
                userReply: reply,
                status: 'user-replied',
                userRepliedAt: new Date()
            },
            { new: true }
        );

        if (!updated) return res.status(404).json({ error: 'Message not found or unauthorized' });
        res.json({ success: true, message: 'Your reply has been sent' });
    } catch (error) {
        console.error('User Reply Contact Error:', error);
        res.status(500).json({ error: 'Failed to send reply' });
    }
};
