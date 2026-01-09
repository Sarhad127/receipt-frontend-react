import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./style/AppLayout.css";
import "./style/pages/RegisterPage.css";
import { verifyUser } from "./api/apis";

function VerifyPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";
    const [verificationCode, setVerificationCode] = useState("");
    const [toastMessage, setToastMessage] = useState("");

    const isLoggedIn = () => {
        return !!localStorage.getItem("jwt") || !!sessionStorage.getItem("jwt");
    };

    const handleNavClick = (path) => {
        if (!isLoggedIn()) {
            setToastMessage("Logga in för att komma åt den här sidan");
            setTimeout(() => setToastMessage(""), 2000);
            return;
        }
        navigate(path);
    };

    const handleVerify = async (e) => {
        e.preventDefault();

        try {
            await verifyUser(email, verificationCode);
            setToastMessage("Konto verifierat! Du kan nu logga in.");
            setTimeout(() => {
                setToastMessage("");
                navigate("/");
            }, 1500);
        } catch (err) {
            console.log(err.message);
            setToastMessage("Ogiltig kod eller något gick fel");
            setTimeout(() => setToastMessage(""), 2000);
        }
    };

    return (
        <div className="page-wrapper">
            <div className="page-tabs login-tabs">
                <button className="tab active">Verifiera</button>
                <button className="tab" onClick={() => handleNavClick("/skanna")}>Skanna</button>
                <button className="tab" onClick={() => handleNavClick("/historik")}>Historik</button>
                <button className="tab" onClick={() => handleNavClick("/sparade")}>Sparade</button>
                <button className="tab" onClick={() => handleNavClick("/statistik")}>Statistik</button>
                <button className="tab" onClick={() => handleNavClick("/installningar")}>Inställningar</button>
            </div>

            {toastMessage && <div className="toast-popup">{toastMessage}</div>}

            <div className="page-content login-content">
                <div className="register-form-container">
                    <h2>Verifiera ditt konto</h2>
                    <p>Vi har skickat en verifieringskod till <strong>{email}</strong></p>

                    <form className="register-form" onSubmit={handleVerify}>
                        <input
                            type="text"
                            placeholder="Verifieringskod"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            required
                        />
                        <button type="submit">Verifiera</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default VerifyPage;