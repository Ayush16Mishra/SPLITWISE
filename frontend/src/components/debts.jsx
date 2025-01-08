import React, { useEffect, useState } from "react";

function Debts({ groupId }) {
    const [debts, setDebts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [resolveError, setResolveError] = useState(""); // For resolve errors
    const [isResolving, setIsResolving] = useState(false); // Resolve loading state
    const [expandedTransactions, setExpandedTransactions] = useState({}); // Track expanded transactions
    const token = localStorage.getItem("token");

    // Fetch debts from the server
    useEffect(() => {
        fetch(`http://localhost:5000/api/groups/${groupId}/debts`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data.success) {
                    setDebts(data.debts);
                } else {
                    setError(data.message || "Error fetching debts");
                }
            })
            .catch((err) => {
                setError("Failed to fetch debts");
                console.error(err);
            })
            .finally(() => setIsLoading(false));
    }, [groupId, token]);

    // Group debts by transaction_id
    const groupedDebts = debts.reduce((acc, debt) => {
        const { transaction_id } = debt;
        if (!acc[transaction_id]) {
            acc[transaction_id] = [];
        }
        acc[transaction_id].push(debt);
        return acc;
    }, {});

    // Handle expand/collapse
    const toggleExpand = (transactionId) => {
        setExpandedTransactions((prev) => ({
            ...prev,
            [transactionId]: !prev[transactionId],
        }));
    };

    // Handle debt resolve
    const handleResolve = (debt_id) => {
        setIsResolving(true);
        setResolveError("");

        fetch(`http://localhost:5000/api/groups/${groupId}/debts/${debt_id}/settle-request`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    alert("Settlement request sent successfully!");

                    // Update the specific debt's status locally
                    setDebts((prevDebts) =>
                        prevDebts.map((debt) =>
                            debt.debt_id === debt_id
                                ? { ...debt, status: "requested" }
                                : debt
                        )
                    );
                } else {
                    setResolveError(data.message || "Failed to send settlement request.");
                }
            })
            .catch((err) => {
                setResolveError("Error sending settlement request.");
                console.error(err);
            })
            .finally(() => setIsResolving(false));
    };

    if (isLoading) {
        return <p>Loading debts...</p>;
    }

    if (error) {
        return <p className="error">{error}</p>;
    }

    return (
        <div className="debtsContainer">
            <h3>Debts</h3>
            {Object.keys(groupedDebts).length === 0 ? (
                <p>No debts to show.</p>
            ) : (
                <ul>
                    {Object.entries(groupedDebts).map(([transactionId, debts]) => (
                        <li key={transactionId}>
                            <div
                                style={{
                                    cursor: "pointer",
                                    fontWeight: "bold",
                                    marginBottom: "10px",
                                }}
                                onClick={() => toggleExpand(transactionId)}
                            >
                                <p>Transaction ID: {transactionId}</p>
                                <p>Reason: {debts[0]?.reason}</p>
                            </div>
                            {expandedTransactions[transactionId] && (
                                <ul style={{ paddingLeft: "20px" }}>
                                    {debts.map((debt) => (
                                        <li key={debt.debt_id}>
                                            <p><strong>Payer:</strong> {debt.payer}</p>
                                            <p><strong>Debtor:</strong> {debt.debtor}</p>
                                            <p><strong>Amount:</strong> {debt.amount}</p>
                                            <p><strong>Status:</strong> {debt.status}</p>
                                            {debt.status === "unsettled" && (
                                                <button
                                                    onClick={() => handleResolve(debt.debt_id)}
                                                    disabled={isResolving}
                                                >
                                                    {isResolving ? "Processing..." : "Resolve"}
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            )}
            {resolveError && <p className="error">{resolveError}</p>}
        </div>
    );
}

export default Debts;
