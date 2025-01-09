import React, { useState } from "react";

function JoinGroup() {
    const [groupId, setGroupId] = useState("");
    const [message, setMessage] = useState("");
    const handleSubmit = (e) => {
        const backendUrl = process.env.REACT_APP_BACKEND_URL;

        e.preventDefault();
        fetch(`${backendUrl}/api/groups/join`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ groupId }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.message) {
                    setMessage(data.message);
                }
                if (data.group) {
                    setMessage("Successfully joined the group!");
                    setGroupId(""); // Clear input field
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                setMessage("An error occurred. Please try again.");
            });
    };

    return (
        <div className="joinGroupContainer">
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Enter Group ID"
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    required
                />
                <button type="submit" className="joinGroupButton">Join Group</button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
}

export default JoinGroup;
