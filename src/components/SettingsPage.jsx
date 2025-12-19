import React from "react";
import { useNavigate } from "react-router-dom";
import "./style/pages/SettingsPage.css";
import "./style/AppLayout.css";

function SettingsPage() {
    const navigate = useNavigate();

    return (
        <div className="page-wrapper">
            <div className="page-tabs">
                <button className="tab" onClick={() => navigate("/home")}>Skanna</button>
                <button className="tab" onClick={() => navigate("/historik")}>Historik</button>
                <button className="tab" onClick={() => navigate("/sparade")}>Sparade</button>
                <button className="tab active">Inställningar</button>
            </div>

            <div className="page-container">
                <div className="page-content">
                    <h1>Inställningar</h1>
                    <p>Här kan användaren ändra inställningar för appen.</p>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;
