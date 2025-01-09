import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Transactions from "./transactions"; // Import Transactions component

function GroupDetails() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [userEmail, setUserEmail] = useState("");
    const [groupStats, setGroupStats] = useState({ totalDebt: 0, totalLoans: 0, totalSpending: 0 });
    const [loadingStats, setLoadingStats] = useState(true);
    useEffect(() => {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;

        // Fetch group details
        fetch(`${backendUrl}/api/groups/${groupId}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.group) {
                    console.log(data.group);
                    setGroup(data.group);
                } else {
                    console.error("Error fetching group:", data.message);
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    
        // Fetch group stats (debts, loans, and spending)
        fetch(`${backendUrl}/api/groups/${groupId}/details`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    console.log(data);
                    setGroupStats({
                        totalDebt: parseFloat(data.totalGroupDebt) || 0,
                        totalLoans: parseFloat(data.totalGroupLoans) || 0,
                        totalSpending:parseFloat(data.totalGroupSpending) || 0,
                    });
                } else {
                    console.error("Error fetching group stats:", data.message);
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            })
            .finally(() => setLoadingStats(false));
    
        // Decode token to get logged-in user's email
        const token = localStorage.getItem("token");
        if (token) {
            const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
            setUserEmail(payload.email);
        }
    }, [groupId]); // Dependency array ensures this effect runs when groupId changes

    return (
        <div className="groupDetailsContainer">
              {/* Navbar */}
              <div className="navbar">
                <a href="/dashboard" className="navbar-link">DASHBOARD</a>
                <a href="/group" className="navbar-link">GROUPS</a>
                <a href="/finance" className="navbar-link">FINANCE</a>
            </div>
            {group ? (
                <>
                    <h2>Group Name: {group.name}</h2>
                    <h3>GROUP ID:{group.group_id}</h3>
                    <p>Created By: {group.created_by}</p>
                    <p>Created At: {new Date(group.created_at).toLocaleString()}</p>


                    <div className="groupStats">
    {loadingStats ? (
        <p>Loading statistics...</p>
    ) : (
        <>
            <h4>Group Statistics</h4>
            <p>
                <strong>Total Debts:</strong> ₹
                {typeof groupStats.totalDebt === "number"
                    ? groupStats.totalDebt.toFixed(2)
                    : "0.00"}
            </p>
            <p>
                <strong>Total Loans:</strong> ₹
                {typeof groupStats.totalLoans === "number"
                    ? groupStats.totalLoans.toFixed(2)
                    : "0.00"}
            </p>
            <p>
                <strong>Total Spending:</strong> ₹
                {typeof groupStats.totalSpending === "number"
                    ? groupStats.totalSpending.toFixed(2)
                    : "0.00"}
            </p>
        </>
    )}
</div>


                    {/* Include the Transactions component */}
                    <Transactions groupId={groupId} />
                </>
            ) : (
                <p>Loading group details...</p>
            )}
        </div>
    );
}

export default GroupDetails;
