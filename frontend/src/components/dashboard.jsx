//dasboard.jsx

import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import CreateTrips from "./createTrips"; // Import the CreateTrips component
import "../styles/Dashboard.css";

function Dashboard() {
    const token = localStorage.getItem("token");
    const navigate = useNavigate(); // Initialize useNavigate
    const [isCreatingGroup, setIsCreatingGroup] = useState(false); // State to toggle form visibility
    const [totalDebt, setTotalDebt] = useState(0);
    const [totalLoan,setTotalLoans]= useState(0);
    const [latestGroup, setLatestGroup] = useState(null); // State to store latest group
    const [totalLatestDebt,setTotalLatestDebt]=useState(0);
    const [totalLatestLoans,setTotalLatestLoans]=useState(0);
    const [spendings,setSpendings]=useState(0);
    const [error, setError] = useState("");
    const [name,setName]= useState("");

    
    const toggleCreateGroup = () => {
        setIsCreatingGroup(!isCreatingGroup);
    };
    const handleAnalyzeClick = () => {
        if (latestGroup && latestGroup.group_id) {
            navigate(`/groups/${latestGroup.group_id}`); // Navigate to the group page with the ID
        } else {
            setError("No ongoing trip available to analyze.");
        }
    };


    const fetchTotalDebt = async () => {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        try {
            const response = await fetch(`${backendUrl}/api/dashboard/total-debt`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`, // Pass token to backend
                },
            });
            const data = await response.json();
            if (data.success) {
                setTotalDebt(data.totalDebt); // Set total debt if response is valid
            } else {
                setError("Failed to fetch total debt");
            }
        } catch (error) {
            setError("Error fetching total debt");
            console.error(error);
        } 
    };

    const fetchTotalLoans = async () => {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        try {
            const response = await fetch(`${backendUrl}/api/dashboard/total-loans`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            if (data.success) {
                setTotalLoans(data.totalLoans);
            } else {
                setError("Failed to fetch total loans");
            }
        } catch (error) {
            setError("Error fetching total loans");
            console.error(error);
        }
    };


    const fetchLatestGroup = async () => {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;
        try {
            const response = await fetch(`${backendUrl}/api/dashboard/latest`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            console.log("Latest group data received:", data);
            if (data.success) {
                setLatestGroup(data.latestGroup);
            setTotalLatestDebt(data.totalLatestDebt);
            setTotalLatestLoans(data.totalLatestLoans);
            setSpendings(data.totalSpending);
            setName(data.name);
            } else {
                setError("Failed to fetch latest group");
            }
        } catch (error) {
            setError("Error fetching latest group");
            console.error(error);
        }
    };

    useEffect(() => {
        fetchTotalDebt();
        fetchTotalLoans();
        fetchLatestGroup();
        
    }, [token]); // Refetch debt when token changes

    useEffect(() => {
        console.log("Total Latest Debt:", totalLatestDebt); // Log to verify
        console.log("Total Latest Loans:", totalLatestLoans); // Log to verify
    }, [totalLatestDebt, totalLatestLoans]); // Log whenever these values change

    return (
        <div className="dashboardPageContainer">
            <div className="navbar">
                <a href="/dashboard" className="navbar-link">DASHBOARD</a>
                <a href="/group" className="navbar-link">GROUPS</a>
                <a href="/finance" className="navbar-link">FINANCE</a>
            </div>

            {/* Main dashboard content */}
            <div className="body">
                <div className="upper">
                    <div className="ongoingTrips">
                        <div className="ongoing-heading">
                            <h1>ONGOING TRIPS: {name}</h1>  
                        </div>
                        <div className="ongoing-up">
                            <div className="spending">
                                <h1>Spending</h1>
                                <p>{spendings > 0 ? `₹${spendings}` : "No Spending"}</p>
                            </div>
                            <div className="trip-debt">
                                <h1>Debt</h1>
                                <p>{totalLatestDebt > 0 ? `₹${totalLatestDebt}` : "No Debt"}</p>
                            </div>
                            <div className="trip-loan">
                                <h1>Loan</h1>
                                <p>{totalLatestLoans > 0 ? `₹${totalLatestLoans}` : "No Loan"}</p>
                            </div>
                        </div>
                        <div className="ongoing-down">
                            <button className="ongoing-analyze"  onClick={handleAnalyzeClick}>ANALYZE</button>
                        </div>
                    </div>

                    <div className="transactions">
                        <div className="transactions-heading">
                            <h1>TRANSACTIONS</h1>
                        </div>
                        <div className="transactions-up">
                            <div className="loan">
                                <h1>Loan</h1>
                                <p>{totalLoan > 0 ? `₹${totalLoan}` : "No Loan"}</p> {/* Display total debt */}
                            </div>
                            <div className="debt">
                                <h1>Debt</h1>
                                <p>{totalDebt > 0 ? `₹${totalDebt}` : "No Debt"}</p> {/* Display total debt */}
                            </div>
                        </div>
                        <div className="transactions-down" >
                            <button className="transactions-analyze" onClick={() => navigate('/finance')}>ANALYZE</button>
                        </div>
                    </div>
                </div>

                <div className="lower">
                    {/* Create Group Section */}
                    {!isCreatingGroup ? (
                        <div className="newGroup">
                            <h3>Planning a new trip? Create a group:</h3>
                            <button
                                className="createGroupButton"
                                onClick={toggleCreateGroup} // Toggle form visibility
                            >
                                CREATE GROUP
                            </button>
                        </div>
                    ) : (
                        <div className="createGroupForm">
                            <CreateTrips /> {/* Display Create Group Form */}
                            <button onClick={toggleCreateGroup}>Cancel</button> {/* Button to cancel */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
