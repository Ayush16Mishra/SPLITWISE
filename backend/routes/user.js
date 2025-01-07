const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth'); // Import the verifyToken middleware
const client = require('../db'); // Import the client from db.js

// Endpoint to get user debts
router.get('/user-debts', verifyToken, async (req, res) => {
    const userEmail = req.user.email; // Extract the user's email from the JWT token
  
    try {
        // Fetch unsettled debts where the user is a debtor
        const result = await client.query(
            `SELECT * FROM debts 
             WHERE debtor = $1 AND status != 'settled'`,
            [userEmail]
        );
      
        // If no debts are found, return an empty list
        if (result.rows.length === 0) {
            return res.status(200).json({ debts: [] });
        }

        // Return the debts
        res.status(200).json({ debts: result.rows });
    } catch (error) {
        console.error("Error fetching user debts:", error);
        res.status(500).json({ message: "Internal server error while fetching debts." });
    }
});

// Endpoint to get the logged-in user's email
router.get('/', verifyToken, (req, res) => {
    const userEmail = req.user.email; // Extract the user's email from the JWT token
    res.status(200).json({ email: userEmail });
});

module.exports = router;
