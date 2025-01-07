// finance.js (Backend)
const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const client = require('../db'); // PostgreSQL client

// Route to get unsettled loans and debts
router.get('/get-unsettled-loans-debts', verifyToken, async (req, res) => {
    const userEmail = req.user.email;  // Extract the email from the decoded token

    try {
        // Query to get unsettled loans and debts (assuming a 'debts' table)
        const query = `
            SELECT d.amount AS amount, d.reason, d.payer, d.debtor, d.status
            FROM debts d
            WHERE (d.payer = $1 OR d.debtor = $1) AND d.status != 'settled'
        `;
        
        const result = await client.query(query, [userEmail]);

        // Map the results to match the frontend's expected data structure
        const unsettledDebts = result.rows.map(row => ({
            amount: row.amount,
            reason: row.reason,
            payer: row.payer,
            debtor: row.debtor,
            status: row.status,  // Settled flag (false for unsettled debts)
        }));

        console.log("Fetching unsettled loans and debts for user:", userEmail);
        console.log("Unsettled Debts:", unsettledDebts);

        res.status(200).json({ success: true, unsettledDebts });
    } catch (error) {
        console.error("Error fetching unsettled loans and debts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
