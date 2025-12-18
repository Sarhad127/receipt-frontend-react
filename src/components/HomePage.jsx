import React, {useEffect, useRef, useState} from "react";
import { useNavigate } from "react-router-dom";
import "./style/HomePage.css";

function HomePage() {
    const [username, setUsername] = useState("");
    const navigate = useNavigate();
    const effectRan = useRef(false);

    useEffect(() => {
        if (effectRan.current) return;
        effectRan.current = true;

        const fetchHome = async () => {
            const token = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");
            if (!token) { navigate("/"); return; }

            try {
                const response = await fetch("http://localhost:8080/home", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (!response.ok) throw new Error("Unauthorized");

                const data = await response.json();
                console.log("User info from /home:", data);
                setUsername(data.username);
            } catch (err) {
                console.error("Failed to fetch user info:", err);
                localStorage.removeItem("jwt");
                sessionStorage.removeItem("jwt");
                navigate("/");
            }
        };

        fetchHome();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("jwt");
        sessionStorage.removeItem("jwt");
        navigate("/");
    };

    return (
        <div className="page-container">
            <h1>Welcome, {username}!</h1>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

export default HomePage;