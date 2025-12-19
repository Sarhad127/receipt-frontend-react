import React, { useState } from "react";
import "./style/AppLayout.css";
import "./style/pages/RegisterPage.css";

function RegisterPage({ onBack }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            console.log("Passwords do not match!");
            return;
        }

        try {
            const response = await fetch("http://localhost:8080/register/user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error("Registration failed");
            }

            console.log("Registered successfully!");
            onBack();
        } catch (err) {
            console.log(err.message);
        }
    };

    return (
        <div className="page-wrapper">
            <div className="page-content">
                <div className="register-form-container">
                    <h2>Register</h2>
                    <form className="register-form" onSubmit={handleRegister}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Register</button>
                    </form>
                    <button className="back-btn" onClick={onBack}>
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;