import React, { useState,useEffect } from "react";


function Analyze(){

     const [debts, setDebts] = useState([]);
     const [error, setError] = useState("");
     useEffect(()=>{
        fetch("http://localhost:5000/api/user/user-debts",{
            method:"GET",
            headers:{
                Authorization: `Bearer ${localStorage.getItem("token")}`,
            },

        })
        .then((response)=> response.json())
        .then((data)=>{
            if(data.debts){
                setDebts(data.debts);
            }else{
                console.error("Failed to fetch debts:", data.message);
            }  
        })
        .catch((error) => {
            console.error("Error:", error);
            setError("An error occurred while fetching debts.");
        });
     },[]);

     return(
        <div className="debts">
                    <div className="debts"><h3>Have a look at your previous groups:</h3></div>
                    <div className="debtsWrapper">
                        {debts.length > 0 ? (
                            debts.map((debt) => (
                                <div
                                    key={debt.id}
                                    className="debtCard"
                                >
                                    <h4>Amount: ₹{debt.amount}</h4>
                            <p>Reason: {debt.reason || "No reason specified"}</p>
                            <p>Group: {debt.groupName || "No group name available"}</p>
                                </div>
                            ))
                        ) : (
                            <p>No debts found.</p>
                        )}
                    </div>
                </div>
     );


}

export default Analyze;