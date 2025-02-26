// controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

class AuthController {
    static async register(req, res) {
        try {
            const { username, password } = req.body;
            const userExists = await User.findUser(username);
            if (userExists) {
                return res.status(400).json({ message: 'User already exists' });
            }

            const user = await User.createUser(username, password);
            res.status(201).json({ message: 'User registered successfully', user });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    static async login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await User.findUser(username);
            if (!user) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const isPasswordValid = await User.validatePassword(user, password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign({ username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }

    static getProtectedData(req, res) {
        res.json({ message: 'This is protected data', user: req.user });
    }
}

module.exports = AuthController;