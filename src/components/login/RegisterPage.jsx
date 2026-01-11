import React, { useState } from "react";
import "../style/AppLayout.css";
import "./css/RegisterPage.css";
import "./css/VerifyPage.css";
import { registerUser, resendCode, verifyUser } from "../api/apis.jsx";

function RegisterPage({ onBack, onSuccess }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [toastMessage, setToastMessage] = useState("");
    const [showVerify, setShowVerify] = useState(false);
    const [verificationCode, setVerificationCode] = useState("");

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(""), 3000);
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showToast("Lösenorden matchar inte!");
            return;
        }

        try {
            await registerUser(email, password);
            showToast("Verifieringsmail skickat!");
            setShowVerify(true);
        } catch (err) {
            const msg = err.message || "";
            if (msg.includes("redan registrerad")) {
                try {
                    await resendCode(email);
                    showToast("Verifieringskod skickad igen!");
                    setShowVerify(true);
                } catch (resendErr) {
                    console.error(resendErr);
                    showToast(resendErr.message || "Kunde inte skicka verifieringskod, försök igen.");
                }
            } else if (msg.includes("är redan verifierat")) {
                showToast("E-postadressen är redan registrerad");
            } else {
                showToast(msg);
            }
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            await verifyUser(email, verificationCode);
            showToast("Konto verifierat! Du kan nu logga in.");
            setTimeout(() => {
                setShowVerify(false);
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setVerificationCode("");

                if (onSuccess) onSuccess();
            }, 1500);
        } catch (err) {
            console.error(err);
            showToast("Ogiltig kod eller något gick fel");
        }
    };

    return (
        <div className="page-wrapper">
            {toastMessage && <div className="toast-popup">{toastMessage}</div>}

            <div className="page-content login-content">
                <div className="register-form-container">
                    <h1 className="login-titel">Huskvitton</h1>

                    {!showVerify ? (
                        <>
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
                                <span className="back-link" onClick={onBack}>Logga in</span>
                            </div>
                        </>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;