import React from "react";
import { useNavigate } from "react-router-dom";
import "./style/pages/SavedPage.css";
import "./style/AppLayout.css";

function SavedPage() {
    const navigate = useNavigate();

    return (
        <div className="page-wrapper">
            <div className="page-tabs">
                <button className="tab" onClick={() => navigate("/home")}>Skanna</button>
                <button className="tab" onClick={() => navigate("/historik")}>Historik</button>
                <button className="tab active">Sparade</button>
                <button className="tab" onClick={() => navigate("/installningar")}>Inställningar</button>
            </div>

            <div className="page-container">
                <div className="page-content">
                    <h1>Sparade</h1>
                    <p>Här visas alla sparade kvitton och skanningar.</p>
                </div>
            </div>
        </div>
    );
}

export default SavedPage;
