import React, { useState } from "react";
import "./style/AppLayout.css";
import "./style/pages/RegisterPage.css";
import { registerUser } from "./api/apis";
import { useNavigate } from "react-router-dom";

function RegisterPage({ onBack }) {
    const navigate = useNavigate();
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
            await registerUser(username, password);
            onBack();
        } catch (err) {
            console.log(err.message);
        }
    };

    return (
        <div className="page-wrapper">

            <div className="page-tabs login-tabs">
                <button className="tab active">Register</button>
                <button className="tab" onClick={() => navigate("/skanna")}>Skanna</button>
                <button className="tab" onClick={() => navigate("/historik")}>Historik</button>
                <button className="tab" onClick={() => navigate("/sparade")}>Sparade</button>
                <button className="tab" onClick={() => navigate("/statistik")}>Statistik</button>
                <button className="tab" onClick={() => navigate("/installningar")}>Inställningar</button>
            </div>

            <div className="page-container">
                <div className="page-content login-content">
                    <div className="register-form-container">
                        <h2>Registrera</h2>

                        <form className="register-form" onSubmit={handleRegister}>
                            <input
                                type="text"
                                placeholder="Användarnamn"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Lösenord"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <input
                                type="password"
                                placeholder="Bekräfta Lösenord"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />

                            <button type="submit">Registrera</button>
                        </form>

                        <button className="back-btn" onClick={onBack}>
                            Tillbaka till inloggning
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;