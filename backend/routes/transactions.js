const express = require('express');
const router = express.Router();
const { verifyToken } = require('./auth');  
const { v4: uuidv4 } = require('uuid');
const client = require('../db'); // Import the client from db.js

// Route to add a transaction
router.post('/:groupId/transactions', verifyToken, async (req, res) => {
    const { groupId } = req.params;
    const { amount, reason, sponsor } = req.body;  // Including reason for sponsorship
    const userEmail = req.user.email;

    if (!amount || !reason) {
        return res.status(400).json({ message: 'Amount and reason are required' });
    }

    try {
        // Fetch group participants from the user_groups table
        const groupParticipantsResult = await client.query(
            `SELECT u.email FROM users u 
             JOIN user_groups ug ON u.user_id = ug.user_id 
             WHERE ug.group_id = $1`,
            [groupId]
        );

        const groupParticipants = groupParticipantsResult.rows.map(row => row.email);

        const group = groupParticipants.length > 0 ? { groupId, participants: groupParticipants } : null;
        if (!group) {
            return res.status(404).json({ message: 'Group not found or no participants.' });
        }

        // Sponsor validation after fetching participants
        if (sponsor && !groupParticipants.includes(sponsor)) {
            return res.status(400).json({ message: "Sponsor is not part of the group." });
        }

        // Create a new transaction
        const transactionId = uuidv4();
        await client.query(
            `INSERT INTO transactions (transaction_id, group_id, payer, amount, reason) 
             VALUES ($1, $2, $3, $4, $5)`,
            [transactionId, groupId, userEmail, amount, reason]
        );

        // Calculate share and debts
        const numParticipants = groupParticipants.length;
        const share = amount / numParticipants;

        const debts = groupParticipants
            .filter((participant) => participant !== userEmail)  // Exclude the person who made the transaction
            .map((debtor) => {
                // If this person is sponsored, they should not owe any debt
                if (sponsor && debtor === sponsor) {
                    return null;  // Skip the sponsored person from being added to debts
                }

                return {
                    debtId: uuidv4(),
                    transactionId,
                    groupId,
                    amount: share,
                    reason,
                    payer: userEmail,
                    debtor,
                    status: "unsettled",
                };
            })
            .filter(Boolean);  // Remove null values (sponsored person won't have debt)

        // Insert debts into the database
        for (const debt of debts) {
            await client.query(
                `INSERT INTO debts (debt_id, transaction_id, group_id, amount, reason, payer, debtor, status) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [debt.debtId, debt.transactionId, debt.groupId, debt.amount, debt.reason, debt.payer, debt.debtor, debt.status]
            );
        }

        // If there is a sponsor, log the sponsorship
        if (sponsor) {
            const sponsorId = uuidv4();
            await client.query(
                `INSERT INTO sponsor (id, group_id, amount, reason, user_email) 
                 VALUES ($1, $2, $3, $4, $5)`,
                [sponsorId, groupId, share, reason, userEmail]
            );
        }

        res.status(201).json({ success: true, message: 'Transaction added successfully', transactionId, debts });
    } catch (error) {
        console.error("Error adding transaction:", error);
        res.status(500).json({ message: 'Internal server error while adding transaction' });
    }
});

// Route to get user debts for a group
router.get('/:groupId/debts', verifyToken, async (req, res) => {
    const { groupId } = req.params;
    const userEmail = req.user.email;

    try {
        // Fetch debts where user is either payer or debtor
        const result = await client.query(
            `SELECT * FROM debts 
             WHERE group_id = $1 AND debtor = $2`,
            [groupId, userEmail]
        );

        res.status(200).json({ success: true, debts: result.rows });
    } catch (error) {
        console.error("Error fetching debts:", error);
        res.status(500).json({ message: 'Error fetching debts' });
    }
});

// Add this route to your existing code

router.get('/:groupId/loans', verifyToken, async (req, res) => {
    const { groupId } = req.params;
    const userEmail = req.user.email;

    try {
        // Query the database to get the debts where the user is the payer and the status is "unsettled"
        const result = await client.query(
            `SELECT * FROM debts
             WHERE group_id = $1 AND payer = $2 AND status != 'settled'`,
            [groupId, userEmail]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "No loans found for this user in the group." });
        }

        // Return the debts (loans) in the response
        res.status(200).json({ success: true, loans: result.rows });
    } catch (error) {
        console.error("Error fetching loans:", error);
        res.status(500).json({ success: false, message: "Failed to fetch loans" });
    }
});


// Route to calculate total debt for a user
router.get('/groups/total-debt', verifyToken, async (req, res) => {
    const userEmail = req.user.email;

    try {
        // Fetch all unsettled debts where user is the debtor
        const result = await client.query(
            `SELECT SUM(amount) AS total_debt FROM debts 
             WHERE debtor = $1 AND status = 'unsettled'`,
            [userEmail]
        );

        res.status(200).json({ success: true, totalDebt: result.rows[0].total_debt || 0 });
    } catch (error) {
        console.error("Error fetching total debt:", error);
        res.status(500).json({ message: "Error fetching total debt" });
    }
});

// Route to calculate total loans (amounts lent by the user)
router.get('/groups/total-loans', verifyToken, async (req, res) => {
    const userEmail = req.user.email;

    try {
        // Fetch all unsettled debts where user is the payer
        const result = await client.query(
            `SELECT SUM(amount) AS total_loans FROM debts 
             WHERE payer = $1 AND status = 'unsettled'`,
            [userEmail]
        );

        res.status(200).json({ success: true, totalLoans: result.rows[0].total_loans || 0 });
    } catch (error) {
        console.error("Error fetching total loans:", error);
        res.status(500).json({ message: "Error fetching total loans" });
    }
});

// Route to settle debt
router.post('/:groupId/debts/:debtId/settle-request', verifyToken, async (req, res) => {
    const { groupId, debtId } = req.params;
    const userEmail = req.user.email;

    try {
        console.log("Debt ID:", debtId);  // Add this to debug if debtId is missing

        // Find the debt record in the database
        const result = await client.query(
            `SELECT * FROM debts WHERE debt_id = $1 AND debtor = $2 AND group_id = $3`,
            [debtId, userEmail, groupId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Debt not found or you are not authorized" });
        }

        // Update debt status to "requested"
        await client.query(
            `UPDATE debts SET status = 'requested' WHERE debt_id = $1`,
            [debtId]
        );

        res.status(200).json({ success: true, message: "Settlement request sent" });
    } catch (error) {
        console.error("Error settling debt:", error);
        res.status(500).json({ message: "Error settling debt" });
    }
});

// Route to accept debt settlement
router.post('/:groupId/debts/:debtId/accept-settlement', verifyToken, async (req, res) => {
    const { groupId, debtId } = req.params;
    const userEmail = req.user.email;

    try {
        // Find the debt record in the database
        const result = await client.query(
            `SELECT * FROM debts WHERE debt_id = $1 AND payer = $2 AND group_id = $3 AND status = 'requested'`,
            [debtId, userEmail, groupId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Debt not found or not requested for settlement" });
        }

        // Update debt status to "settled"
        await client.query(
            `UPDATE debts SET status = 'settled' WHERE debt_id = $1`,
            [debtId]
        );

        res.status(200).json({ success: true, message: "Debt marked as settled" });
    } catch (error) {
        console.error("Error accepting settlement:", error);
        res.status(500).json({ message: "Error accepting settlement" });
    }
});

module.exports = router;
