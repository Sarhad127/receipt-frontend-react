import React, { useState } from "react";
import "./style/AppLayout.css";
import "./style/pages/RegisterPage.css";
import { registerUser, resendCode } from "./api/apis";
import { useNavigate } from "react-router-dom";

function RegisterPage({ onBack }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [toastMessage, setToastMessage] = useState("");

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
            navigate("/verify", { state: { email } });

        } catch (err) {
            const msg = err.message || "";

            if (msg.includes("redan registrerad")) {
                try {
                    await resendCode(email);
                    showToast("Verifieringskod skickad igen!");
                    navigate("/verify", { state: { email } });
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

    return (
        <div className="page-wrapper">
            {toastMessage && <div className="toast-popup">{toastMessage}</div>}

            <div className="page-content login-content">
                <div className="register-form-container">
                    <h1 className="login-titel">Huskvitton</h1>
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
    );
}

export default RegisterPage;