//group.js

const express = require('express');
const fs = require('fs');
const router = express.Router();
const { verifyToken } = require('./auth'); // Import the verifyToken middleware
const client = require('../db'); // Import the client from db.js
const crypto = require('crypto'); // Importing the crypto module for hashing


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


// Middleware to handle group creation
router.post('/create', verifyToken, async (req, res) => {
  const { groupName } = req.body;
  const userEmail = req.user.email; // Extract the user email from the JWT token

  if (!groupName) {
    return res.status(400).json({ message: "Group name is required" });
  }
  const groupId = Date.now(); // Generate a numeric group ID using the timestamp

  try {
    // Step 1: Create the new group in the groups table
    const result = await client.query(
      `INSERT INTO groups (group_id, name, created_by)
       VALUES ($1, $2, $3) 
       RETURNING group_id, name, created_by`,
      [groupId,groupName, userEmail]
    );

    const newGroup = result.rows[0];
    // Step 2: Get the user ID based on the email
    const userResult = await client.query(
      `SELECT user_id FROM users WHERE email = $1`,
      [userEmail]
    );


    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const userId = userResult.rows[0].user_id;

    // Step 3: Insert the user into the user_groups table to link the user to the new group
    await client.query(
      `INSERT INTO user_groups (user_id, group_id)
       VALUES ($1, $2)`,
      [userId, groupId]
    );

    res.status(201).json({ message: "Group created successfully", group: newGroup });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Internal server error while creating the group." });
  }
});


router.get('/user-groups', verifyToken, async (req, res) => {
  const userEmail = req.user.email; // Extract the user email from the JWT token

  try {
    // Step 1: Get the user_id based on the email
    const userResult = await client.query(
      `SELECT user_id FROM users WHERE email = $1`,
      [userEmail]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const userId = userResult.rows[0].user_id;

    // Step 2: Get all group_ids the user is part of
    const groupsResult = await client.query(
      `SELECT g.group_id, g.name, g.created_by, g.created_at
       FROM groups g
       JOIN user_groups ug ON g.group_id = ug.group_id
       WHERE ug.user_id = $1`,
      [userId]
    );

    // Step 3: Check if the user has any groups
    if (groupsResult.rows.length === 0) {
      return res.status(404).json({ message: "No groups found for this user." });
    }

    // Return the groups the user is part of
    res.status(200).json({ groups: groupsResult.rows });
  } catch (error) {
    console.error("Error fetching user groups:", error);
    res.status(500).json({ message: "Internal server error while fetching user groups." });
  }
});


// Route to fetch a specific group by ID
router.get('/:groupId', verifyToken, async (req, res) => {
  const { groupId } = req.params;

  if (!groupId) {
    return res.status(400).json({ message: "Group ID is required" });
  }

  try {
    const groupResult  = await client.query("SELECT * FROM groups WHERE group_id = $1", [groupId]);
    if (groupResult.rows.length === 0) {
      return res.status(404).json({ message: "Group not found" });
    }

    const group = groupResult.rows[0];

      // Fetch participants for the group
      const participantsResult = await client.query(
        `SELECT u.user_id, u.name, u.email, u.username
         FROM users u
         JOIN user_groups ug ON u.user_id = ug.user_id
         WHERE ug.group_id = $1`,
        [groupId]
      );
  
      const participants = participantsResult.rows;

    // Return group details with participants
    res.json({ group: { ...group, participants } });
  } catch (error) {
    console.error("Error fetching group:", error);
    res.status(500).json({ message: "Internal server error while fetching group." });
  }
});


router.post('/join', verifyToken, async (req, res) => {
  const { groupId } = req.body;
  const userEmail = req.user.email; // Extract the user email from the JWT token

  try {
    // Check if the group exists
    const groupResult = await client.query(
      `SELECT group_id FROM groups WHERE group_id = $1`,
      [groupId]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ message: "Group not found." });
    }

    const userResult = await client.query(
      `SELECT user_id FROM users WHERE email = $1`,
      [userEmail]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const userId = userResult.rows[0].user_id;

    // Check if the user is already a participant
    const userGroupResult = await client.query(
      `SELECT * FROM user_groups WHERE user_id  = $1 AND group_id = $2`,
      [userId, groupId]
    );

    if (userGroupResult.rows.length > 0) {
      return res.status(400).json({ message: "You are already a participant in this group." });
    }

    // Add user to the group in the user_groups table
    await client.query(
      `INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2)`,
      [userId, groupId]
    );

    
    res.status(200).json({ message: "Successfully joined the group." });
  } catch (error) {
    console.error("Error joining group:", error);
    res.status(500).json({ message: "Internal server error while joining the group." });
  }
});


// Route to delete a group
router.delete('/:groupId', verifyToken, async (req, res) => {
  const { groupId } = req.params;
  const userEmail = req.user.email;

  try {
    // Check if the group exists and get the creator
    const groupResult = await client.query(
      `SELECT group_id, created_by FROM groups WHERE group_id = $1`,
      [groupId]
    );

    if (groupResult.rows.length === 0) {
      return res.status(404).json({ message: "Group not found." });
    }

    const group = groupResult.rows[0];

    // Check if the user is the creator of the group
    if (group.created_by !== userEmail) {
      return res.status(403).json({ message: "You are not authorized to delete this group." });
    }
    await client.query(`DELETE FROM groups WHERE group_id = $1`, [groupId]);

    // First, delete all references to the group in the user_groups table
    await client.query(`DELETE FROM user_groups WHERE group_id = $1`, [groupId]);

    // Then, delete the group from the groups table
   


    res.status(200).json({ message: "Group deleted successfully." });
  } catch (error) {
    console.error("Error deleting group:", error);
    res.status(500).json({ message: "Internal server error while deleting group." });
  }
});

router.get('/:groupId/details', verifyToken, async (req, res) => {
  const userEmail = req.user.email;
  const { groupId } = req.params;

  try {
      // Check if the user is part of the group
      const groupCheckResult = await client.query(
          `SELECT * 
           FROM user_groups 
           WHERE user_id = (SELECT user_id FROM users WHERE email = $1) AND group_id = $2`,
          [userEmail, groupId]
      );

      if (groupCheckResult.rows.length === 0) {
          return res.status(403).json({ message: "User is not a part of this group" });
      }

      // Calculate total debt, loans, and spending for the specified group
      const totalGroupDebt = await calculateGroupDebt(userEmail, groupId);
      const totalGroupLoans = await calculateGroupLoans(userEmail, groupId);
      const totalGroupSpending = await calculateSpending(userEmail, groupId);

      // Optionally update spending table for this group and user
      const spendingsQuery = `
          INSERT INTO spending (group_id, payer, amount, reason, transaction_id)
          VALUES ($1, $2, $3, $4, NULL)
          ON CONFLICT (group_id, payer) 
          DO UPDATE SET amount = EXCLUDED.amount, reason = EXCLUDED.reason;
      `;
      await client.query(spendingsQuery, [
          groupId,
          userEmail,
          totalGroupSpending,
          'Spending update' // Add actual reason here if needed
      ]);

      res.status(200).json({
          success: true,
          groupId,
          totalGroupDebt,
          totalGroupLoans,
          totalGroupSpending,
      });
  } catch (error) {
      console.error("Error fetching group details:", error);
      res.status(500).json({ message: "Internal server error" });
  }
});




module.exports = router;