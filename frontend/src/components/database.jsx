import React, { useState, useEffect } from "react";
import axios from "axios";

const DatabasePage = () => {
  const [groups, setGroups] = useState([]);
  const [debts, setDebts] = useState([]);
  // Fetch group and debt data when the component is mounted
  useEffect(() => {
    const fetchGroupData = async () => {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;

      try {
        const response = await axios.get(`${backendUrl}/api/database/groups`); // Fetch groups from backend
        setGroups(response.data);
      } catch (error) {
        console.error("Error fetching groups:", error);
      }
    };

    const fetchDebtData = async () => {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;

      try {
        const response = await axios.get(`${backendUrl}/api/database/debts`); // Fetch debts from backend
        setDebts(response.data);
      } catch (error) {
        console.error("Error fetching debts:", error);
      }
    };

    fetchGroupData();
    fetchDebtData();
  }, []);

  return (
    <div>
      <h1>Group and Debt Information</h1>
      
      <h2>Groups</h2>
      {groups.length > 0 ? (
        <ul>
          {groups.map((group) => (
            <li key={group.groupId}>
              <strong>{group.name}</strong> (Created by: {group.createdBy})
            </li>
          ))}
        </ul>
      ) : (
        <p>No groups found.</p>
      )}

      <h2>Debts</h2>
      {debts.length > 0 ? (
        <ul>
          {debts.map((debt) => (
            <li key={debt.debtId}>
              <strong>{debt.payer}</strong> owes <strong>{debt.debtor}</strong> {debt.amount} for {debt.reason}
            </li>
          ))}
        </ul>
      ) : (
        <p>No debts found.</p>
      )}
    </div>
  );
};

export default DatabasePage;
