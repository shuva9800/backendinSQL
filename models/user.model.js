
const db = require('../config/database');


// insert a new user in DB
exports.createUser = (userData, callback) => {
    const query = 'INSERT INTO users SET ?';
    db.query(query, userData, callback);
};

// find the user by email
exports.findUserByEmail = (email, callback) => {
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], callback);
};
