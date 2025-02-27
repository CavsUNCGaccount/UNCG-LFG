require('dotenv').config();
const express = require('express');
const pool = require('./config/db');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());

// Test Route
app.get('/', (req, res) => {
    res.send('Welcome to UNCG LFG App! Let\'s play some games!');
});

/**
 * Start the app
 * Start the app normally with Node: node server.js
 * Start the app with nodemon: nodemon server.js
 * Kill the server with Ctrl + C (i.e also used to regain control of the terminal)
*/
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
