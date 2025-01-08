// createTrips.jsx

import React, { useState } from "react";
import axios from "axios";

function CreateTrips() {
  const [groupName, setGroupName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token'); // Get the token

    try {
      const response = await axios.post("http://localhost:5000/api/groups/create", {
        groupName,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`, // Send the token
        }
      });

      setSuccessMessage(response.data.message);
      setGroupName(""); // Clear the input field
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  return (
    <div className="createTripsContainer">
      <h2>Create a New Group</h2>
      {successMessage && <p className="success">{successMessage}</p>}
      {errorMessage && <p className="error">{errorMessage}</p>}
      <form onSubmit={handleCreateGroup}>
        <label htmlFor="groupName">Group Name:</label>
        <input
          type="text"
          id="groupName"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          required
        />
        <button type="submit">Create Group</button>
      </form>
    </div>
  );
}

export default CreateTrips;
