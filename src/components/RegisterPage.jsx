import React, { useState } from "react";
import "./style/AppLayout.css";
import "./style/pages/RegisterPage.css";
import {registerUser, resendCode} from "./api/apis";
import { useNavigate } from "react-router-dom";

function RegisterPage({ onBack }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [toastMessage, setToastMessage] = useState("");

    const isLoggedIn = () => {
        return !!localStorage.getItem("jwt") || !!sessionStorage.getItem("jwt");
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setToastMessage("Lösenorden matchar inte!");
            setTimeout(() => setToastMessage(""), 3000);
            return;
        }

        try {
            await registerUser(email, password);
            navigate("/verify", { state: { email } });
        } catch (err) {

            if (err.message.includes("already exists") || err.message.includes("enabled=false")) {
                try {
                    await resendCode(email);
                    setToastMessage("Verifieringskod skickad igen!");
                    setTimeout(() => setToastMessage(""), 3000);
                    navigate("/verify", { state: { email } });
                } catch (resendErr) {
                    console.log(resendErr.message);
                    setToastMessage("Kunde inte skicka verifieringskod, försök igen.");
                    setTimeout(() => setToastMessage(""), 3000);
                }
            } else {
                setToastMessage(err.message);
                setTimeout(() => setToastMessage(""), 3000);
            }
        }
    };

    const handleNavClick = (path) => {
        if (!isLoggedIn()) {
            setToastMessage("Logga in för att komma åt den här sidan");
            setTimeout(() => setToastMessage(""), 2000);
            return;
        }
        navigate(path);
    };

    return (
        <div className="page-wrapper">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <img
                        src="/src/components/style/icons/receipt-icon.png"
                        alt="Kvitto ikon"
                    />
                    <span>Huskvitton</span>
                </div>

                <nav className="sidebar-nav">
                    <div className="sidebar-item active">Login</div>
                    <div className="sidebar-item" onClick={() => handleNavClick("/skanna")}>Skanna</div>
                    <div className="sidebar-item" onClick={() => handleNavClick("/historik")}>Historik</div>
                    <div className="sidebar-item" onClick={() => handleNavClick("/sparade")}>Sparade</div>
                    <div className="sidebar-item" onClick={() => handleNavClick("/statistik")}>Statistik</div>
                    <div className="sidebar-item" onClick={() => handleNavClick("/installningar")}>Inställningar</div>
                </nav>
            </aside>
            {toastMessage && <div className="toast-popup">{toastMessage}</div>}

            <div className="page-container">
                <div className="page-content login-content">
                    <div className="register-form-container">
                        <h2>Registrera</h2>

                        <form className="register-form" onSubmit={handleRegister}>
                            <input
                                type="email"
                                placeholder="E-post"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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

                        <div className="back-label-wrapper">
                            <span>Har du redan ett konto? </span>
                            <span
                                className="back-link"
                                onClick={onBack}
                            >
                                Logga in
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;