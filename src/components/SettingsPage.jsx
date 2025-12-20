import React from "react";
import { useNavigate } from "react-router-dom";
import "./style/pages/SettingsPage.css";
import "./style/AppLayout.css";

function SettingsPage() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("jwt");
        sessionStorage.removeItem("jwt");
        navigate("/");
    };

    return (
        <div className="page-wrapper">
            <div className="page-tabs">
                <button className="tab" onClick={() => navigate("/skanna")}>Skanna</button>
                <button className="tab" onClick={() => navigate("/historik")}>Historik</button>
                <button className="tab" onClick={() => navigate("/sparade")}>Sparade</button>
                <button className="tab" onClick={() => navigate("/statistik")}>Statistik</button>
                <button className="tab active">Inställningar</button>
            </div>

            <div className="page-container">
                <div className="page-content">
                    <h1>Inställningar</h1>
                    <p>Här kan användaren ändra inställningar för appen.</p>

                    <button className="logout-button" onClick={handleLogout}>
                        Logga ut
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;