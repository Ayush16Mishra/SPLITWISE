import React, { useEffect, useState } from "react";
import "../styles/FinancePage.css";

function FinancePage() {
    const [unsettledDebts, setUnsettledDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        // Fetch unsettled loans and debts
        const fetchUnsettledDebts = async () => {
            const backendUrl = process.env.REACT_APP_BACKEND_URL;

            try {
                const response = await fetch(`${backendUrl}/api/finance/get-unsettled-loans-debts`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`, // Send auth token if needed
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch unsettled debts');
                }

                const data = await response.json();
                setUnsettledDebts(data.unsettledDebts);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching unsettled debts:", error);
                setLoading(false);
            }
        };

        fetchUnsettledDebts();
    }, []);

    return (
        <div className="financePageContainer">
            <div className="navbar">
                <a href="/dashboard" className="navbar-link">DASHBOARD</a>
                <a href="/group" className="navbar-link">GROUPS</a>
                <a href="/finance" className="navbar-link">FINANCE</a>
            </div>

            <div className="body">
                <div className="bottom-half">
                    <div className="unsettled-debts">
                        <h3>Unsettled Loans & Debts:</h3>
                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <ul>
                                {unsettledDebts.length > 0 ? (
                                    unsettledDebts.map((debt, index) => (
                                        <li key={index}>
                                            <strong>{debt.payer}</strong> owes <strong>{debt.debtor}</strong> {debt.amount} for <em>{debt.reason}</em>.
                                        </li>
                                    ))
                                ) : (
                                    <p>No unsettled debts.</p>
                                )}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FinancePage;
