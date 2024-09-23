const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
require('dotenv').config();

// jwt token creation
const createToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Signup controller
exports.signup = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if the user is exists or not
        User.findUserByEmail(email, async (err, result) => {
            if (result.length > 0) {
                return res.status(400).json({ message: 'User already exists' });
            }

            // password hassing
            const hashedPassword = await bcrypt.hash(password, 10);

            // insert user info in DB
            const newUser = { firstName, lastName, email, password:hashedPassword};
            User.createUser(newUser, (err, result) => {
                if (err) {
                    return res.status(500).json({ message: 'Database error', error: err });
                }
                const token = createToken(result.insertId);
                res.status(201).json({ message: 'User created successfully', token });
            });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Login controller
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Find user by email
        User.findUserByEmail(email, async (err, result) => {
            if (result.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            const user = result[0];

            //password checking
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Wrong Password try again' });
            }

            // Generate JWT token
            const token = createToken(user.id);
            res.status(200).json({ message: 'Login successful', token });
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
