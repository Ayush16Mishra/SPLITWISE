const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');
const client = require('../db'); // Import the client from db.js

// Helper function to calculate group debt
const calculateGroupDebt = async (userEmail, groupId) => {
    try {
        const result = await client.query(
            `SELECT SUM(amount) AS totalDebt 
             FROM debts 
             WHERE debtor = $1 AND group_id = $2 AND status != 'settled'`, 
            [userEmail, groupId]
        );
        return result.rows[0].totaldebt || 0;
    } catch (error) {
        console.error('Error calculating group debt:', error);
        throw error;
    }
};

// Helper function to calculate group loans
const calculateGroupLoans = async (userEmail, groupId) => {
    try {
        const result = await client.query(
            `SELECT SUM(amount) AS totalLoans
             FROM debts 
             WHERE payer = $1 AND group_id = $2 AND status != 'settled'`, 
            [userEmail, groupId]
        );
        return result.rows[0].totalloans || 0;
    } catch (error) {
        console.error('Error calculating group loans:', error);
        throw error;
    }
};

// Helper function to calculate spending
const calculateSpending = async (userEmail, groupId) => {
    try {
        // Get the total spending by the user in the group
        const transactionResult = await client.query(
            `SELECT SUM(amount) AS totalSpending
             FROM transactions
             WHERE payer = $1 AND group_id = $2`, 
            [userEmail, groupId]
        );
        const totalSpending = parseFloat(transactionResult.rows[0].totalspending) || 0;

        // Get the total loans and debts
        const loansResult = await client.query(
            `SELECT SUM(amount) AS totalLoans 
             FROM debts
             WHERE payer = $1 AND group_id = $2`, 
            [userEmail, groupId]
        );
        const totalLoans = parseFloat(loansResult.rows[0].totalloans) || 0;

        const debtsResult = await client.query(
            `SELECT SUM(amount) AS totalDebts 
             FROM debts
             WHERE debtor = $1 AND group_id = $2 `, 
            [userEmail, groupId]
        );
         const totalDebts = parseFloat(debtsResult.rows[0].totaldebts) || 0;

        // Net spending formula
        return totalSpending-totalLoans+totalDebts; // Ensure it's a numeric value
    
    } catch (error) {
        console.error('Error calculating spending:', error);
        throw error;
    }
};

// Route to get total debt
router.get('/total-debt', verifyToken, async (req, res) => {
    const userEmail = req.user.email;

    try {
        const result = await client.query(
            `SELECT SUM(amount) AS totalDebt 
             FROM debts 
             WHERE debtor = $1 AND status != 'settled'`, 
            [userEmail]
        );

        const totalDebt = result.rows[0].totaldebt || 0;
        res.status(200).json({ success: true, totalDebt });
    } catch (error) {
        console.error("Error calculating total debt:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Route to get total loans
router.get('/total-loans', verifyToken, async (req, res) => {
    const userEmail = req.user.email;

    try {
        const result = await client.query(
            `SELECT SUM(amount) AS totalLoans 
             FROM debts 
             WHERE payer = $1 AND status != 'settled'`, 
            [userEmail]
        );

        const totalLoans = result.rows[0].totalloans || 0;
        res.status(200).json({ success: true, totalLoans });
    } catch (error) {
        console.error("Error calculating total loans:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
// Route to get latest group data
router.get('/latest', verifyToken, async (req, res) => {
    const userEmail = req.user.email;

    try {
        // Fetch the latest group the user is part of
        const groupsResult = await client.query(
            `SELECT g.group_id, g.name, g.created_at
             FROM groups g
             JOIN user_groups ug ON g.group_id = ug.group_id
             WHERE ug.user_id = (SELECT user_id FROM users WHERE email = $1)
             ORDER BY g.created_at DESC LIMIT 1`,
            [userEmail]
        );

        if (groupsResult.rows.length === 0) {
            return res.status(404).json({ message: "No groups found for the user" });
        }

        const latestGroup = groupsResult.rows[0];
        const groupId = latestGroup.group_id;

        // Calculate total debt, loans, and spending
        const totalLatestDebt = await calculateGroupDebt(userEmail, groupId);
        const totalLatestLoans = await calculateGroupLoans(userEmail, groupId);
        const totalSpending = await calculateSpending(userEmail, groupId);

        // Update spendings table
        const spendingsQuery = `
        INSERT INTO spending (group_id, payer, amount, reason, transaction_id)
        VALUES ($1, $2, $3, $4, NULL)
        ON CONFLICT (group_id, payer) 
        DO UPDATE SET amount = EXCLUDED.amount, reason = EXCLUDED.reason;
    `;
    

        await client.query(spendingsQuery, [
            groupId, 
            userEmail, 
            totalSpending,
            'Spending update' // Add actual reason here if needed
        ]);

        res.status(200).json({
            name: latestGroup.name,
            success: true,
            latestGroup,
            totalLatestDebt,
            totalLatestLoans,
            totalSpending,  // Corrected: return numeric value of total spending
            totalDebts: totalLatestDebt,  // Debt is how much you owe others
            totalLoans: totalLatestLoans 
        });
    } catch (error) {
        console.error("Error fetching latest group data:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
