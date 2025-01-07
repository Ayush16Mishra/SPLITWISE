const express = require("express");
const db = require("../db"); // Assuming `db.js` is where your database connection is set up
const router = express.Router();

// Route to fetch all groups
router.get("/groups", async (req, res) => {
  try {
    const query = `
      SELECT group_id, name, created_by
      FROM groups
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Route to fetch all debts
router.get("/debts", async (req, res) => {
  try {
    const query = `
      SELECT debt_id, transaction_id, amount, reason, payer, debtor, status
      FROM debts
    `;
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching debts:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
