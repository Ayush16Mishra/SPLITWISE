//transactions.jsx

import React, { useState,useEffect } from "react";
import Debts from "./debts";
import Loans from "./loans";

function Transactions({ groupId }) {
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");
    const [sponsorEnabled, setSponsorEnabled] = useState(false);
    const [sponsor, setSponsor] = useState("");
    const [groupParticipants, setGroupParticipants] = useState([]);
    const [loggedInUser, setLoggedInUser] = useState(null); // Store logged-in user
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showDebts, setShowDebts] = useState(false); // State to toggle Debts view
    const [showLoans, setShowLoans] = useState(false); // State to toggle Loans view

    useEffect(() => {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;

        const token = localStorage.getItem("token");

        // Fetch logged-in user details
        fetch(`${backendUrl}/api/user`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Logged-in user:", data);
                setLoggedInUser(data.email); // Adjust key based on your API response
            })
            .catch((error) => {
                console.error("Error fetching logged-in user:", error);
            });
       
        fetch(`${backendUrl}/api/groups/${groupId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                console.log("Participants data:", data);
                setGroupParticipants(data.group.participants || []);
            })
            .catch((error) => {
                console.error("Error fetching participants:", error);
            setGroupParticipants([])
        });
    }, [groupId]);


    const handleSubmit = (event) => {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;

        event.preventDefault();
        setIsSubmitting(true);
        const token = localStorage.getItem("token");

        fetch(`${backendUrl}/api/groups/${groupId}/transactions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ amount, reason, sponsor: sponsorEnabled ? sponsor : null }),
            
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    console.log({ amount, reason, sponsor: sponsorEnabled ? sponsor : null });
                    alert("Transaction added successfully!");
                } else {
                    alert("Error: " + data.message);
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("There was an issue while submitting the data.");
            })
            .finally(() => {
                setIsSubmitting(false);
                setAmount("");
                setReason("");
                setSponsorEnabled(false);
                setSponsor("");
            });
    };

    if (showDebts) {
        return (
            <div>
                <Debts groupId={groupId} />
                <button onClick={() => setShowDebts(false)}>Back to Transactions</button>
            </div>
        );
    }

    if (showLoans) {
        return (
            <div>
                <Loans groupId={groupId} />
                <button onClick={() => setShowLoans(false)}>Back to Transactions</button>
            </div>
        );
    }
    const filteredParticipants = groupParticipants.filter(
        (participant) => participant.email !== loggedInUser
    );

    return (
        <div className="transactionForm">
            <h3>Add a Transaction</h3>
            <form onSubmit={handleSubmit}>
                <div className="formGroup">
                    <label htmlFor="amount">Amount:</label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
                <div className="formGroup">
                    <label htmlFor="reason">Reason:</label>
                    <input
                        type="text"
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        required
                    />
                </div>
                <div className="formGroup">
                    <label>
                        <input
                            type="checkbox"
                            checked={sponsorEnabled}
                            onChange={(e) => setSponsorEnabled(e.target.checked)}
                        />
                        Enable Sponsor
                    </label>
                </div>
                {sponsorEnabled && (
                    <div className="formGroup">
                        <label htmlFor="sponsor">Select Sponsor:</label>
                        <select
                            id="sponsor"
                            value={sponsor}
                            onChange={(e) => setSponsor(e.target.value)}
                            required
                        >
                            <option value="">-- Select Sponsor --</option>
                            {filteredParticipants.map((participant,index) => (
                                <option key={participant.user_id} value={participant.email}>
    {participant.name || participant.email}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Add Transaction"}
                </button>
            </form>
            <button onClick={() => setShowDebts(true)}>View Debts</button>
            <button onClick={() => setShowLoans(true)}>View Loans</button>
        </div>
    );
}

export default Transactions;
