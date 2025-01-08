import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/GroupPage.css";
import JoinGroup from "./joinGroup";

function GroupPage() {
    const [groups, setGroups] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:5000/api/groups/user-groups", {
            method: "GET",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.groups) {
                    setGroups(data.groups);
                } else {
                    console.error("Error fetching groups:", data.message);
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }, []);

    const handleGroupClick = (groupId) => {
        navigate(`/groups/${groupId}`);
    };

    return (
        <div className="groupPageContainer">
            <div className="navbar">
                <a href="/dashboard" className="navbar-link">DASHBOARD</a>
                <a href="/group" className="navbar-link">GROUPS</a>
                <a href="/finance" className="navbar-link">FINANCE</a>
            </div>

            <div className="body">
                <div className="joinGroup">
                    <h3>Have a Group ID? Join a group:</h3>
                    <JoinGroup />
                </div>

                <div className="oldGroups">
                    <div className="heading"><h3>Have a look at your previous groups:</h3></div>
                    <div className="oldGroupsWrapper">
                        {groups.length > 0 ? (
                            groups.map((group) => (
                                <div
                                    key={group.id}
                                    className="groupCard"
                                    onClick={() => handleGroupClick(group.group_id)}
                                >
                                    <h4>{group.name}</h4>
                                    <p>Created at: {new Date(group.created_at).toLocaleString()}</p>
                                </div>
                            ))
                        ) : (
                            <p>No groups found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default GroupPage;
