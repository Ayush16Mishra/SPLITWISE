import React, { useEffect, useState } from "react";

function Loans({ groupId }) {
    const [loans, setLoans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [acceptError, setAcceptError] = useState(""); // Error specific to accepting settlement
    const [isAccepting, setIsAccepting] = useState(false); // Loading state for accepting settlement
    const [expandedTransactions, setExpandedTransactions] = useState({}); // Track expanded transactions
    const token = localStorage.getItem("token");

    // Fetch loans from the server
    useEffect(() => {
        fetch(`http://localhost:5000/api/groups/${groupId}/loans`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    setLoans(data.loans);
                } else {
                    setError(data.message || "Error fetching loans");
                }
            })
            .catch((err) => {
                setError("Failed to fetch loans");
                console.error(err);
            })
            .finally(() => setIsLoading(false));
    }, [groupId, token]);

    // Group loans by transaction_id
    const groupedLoans = loans.reduce((acc, loan) => {
        const { transaction_id } = loan;
        if (!acc[transaction_id]) {
            acc[transaction_id] = [];
        }
        acc[transaction_id].push(loan);
        return acc;
    }, {});

    // Handle expand/collapse
    const toggleExpand = (transactionId) => {
        setExpandedTransactions((prev) => ({
            ...prev,
            [transactionId]: !prev[transactionId],
        }));
    };

    // Handle accepting settlement
    const handleAcceptSettlement = (debt_id) => {
        setIsAccepting(true);
        setAcceptError("");

        fetch(`http://localhost:5000/api/groups/${groupId}/debts/${debt_id}/accept-settlement`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    alert("Settlement accepted successfully!");

                    // Update the specific loan's status locally
                    setLoans((prevLoans) =>
                        prevLoans.map((loan) =>
                            loan.debt_id === debt_id
                                ? { ...loan, status: "settled" }
                                : loan
                        )
                    );
                } else {
                    setAcceptError(data.message || "Failed to accept settlement.");
                }
            })
            .catch((err) => {
                setAcceptError("Error accepting settlement.");
                console.error(err);
            })
            .finally(() => setIsAccepting(false));
    };

    if (isLoading) {
        return <p>Loading loans...</p>;
    }

    if (error) {
        return <p className="error">{error}</p>;
    }

    return (
        <div className="loansContainer">
            <h3>Loans You've Given</h3>
            {Object.keys(groupedLoans).length === 0 ? (
                <p>You have not given any loans in this group.</p>
            ) : (
                <ul>
                    {Object.entries(groupedLoans).map(([transactionId, loans]) => (
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
                                <p>Reason: {loans[0]?.reason}</p>
                            </div>
                            {expandedTransactions[transactionId] && (
                                <ul style={{ paddingLeft: "20px" }}>
                                    {loans.map((loan) => (
                                        <li key={loan.debt_id}>
                                            <p><strong>Debtor:</strong> {loan.debtor}</p>
                                            <p><strong>Amount:</strong> {loan.amount}</p>
                                            <p><strong>Status:</strong> {loan.status}</p>
                                            {loan.status === "requested" && (
                                                <button
                                                    onClick={() => handleAcceptSettlement(loan.debt_id)}
                                                    disabled={isAccepting}
                                                >
                                                    {isAccepting ? "Processing..." : "Accept Settlement"}
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
            {acceptError && <p className="error">{acceptError}</p>}
        </div>
    );
}

export default Loans;
