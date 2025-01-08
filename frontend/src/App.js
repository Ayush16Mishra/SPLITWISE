// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./components/loginPage"; // Ensure the correct casing
import SignUpPage from "./components/signPage"; // Import the SignUpPage
import Dashboard from "./components/dashboard";
import GroupPage from "./components/groupPage";
import GroupDetails from "./components/groupDetails";
import FinancePage from "./components/financePage";
import CreateTrips from "./components/createTrips"; // Import CreateTrips component
import Analyze from "./components/userAnalyze";
import DatabasePage from "./components/database";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/group" element={<GroupPage />} />
                <Route path="/groups/:groupId" element={<GroupDetails />} />
                <Route path="/finance" element={<FinancePage />} />
                <Route path="/create-trips" element={<CreateTrips />} /> {/* New Route */}
                <Route path="/user" element={<Analyze/>}/>
                <Route path="/database" element={<DatabasePage/>}/>
            </Routes>
        </Router>
    );
}

export default App;
