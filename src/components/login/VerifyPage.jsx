import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../style/AppLayout.css";
import "./css/RegisterPage.css";
import "./css/VerifyPage.css";
import { verifyUser } from "../api/apis.jsx";

function VerifyPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";
    const [verificationCode, setVerificationCode] = useState("");
    const [toastMessage, setToastMessage] = useState("");

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
            {toastMessage && <div className="toast-popup">{toastMessage}</div>}

            <div className="page-content login-content">
                <div className="register-form-container">

                    <h1 className="login-titel">Huskvitton</h1>

                    <h2>Verifiera ditt konto</h2>

                    <div className="verify-title-container">
                        <p>Vi har skickat en verifieringskod till <strong>{email}</strong></p>
                    </div>

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