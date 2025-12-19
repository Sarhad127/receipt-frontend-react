import React from "react";
import { useNavigate } from "react-router-dom";
import "./style/HistoryPage.css";

function HistoryPage() {
    const navigate = useNavigate();

    return (
        <div className="page-wrapper">
            <div className="page-tabs">
                <button className="tab" onClick={() => navigate("/home")}>Skanna</button>
                <button className="tab active">Historik</button>
                <button className="tab" onClick={() => navigate("/sparade")}>Sparade</button>
                <button className="tab" onClick={() => navigate("/installningar")}>Inställningar</button>
            </div>

            <div className="page-container">
                <div className="page-content">
                    <h1>Historik</h1>
                    <p>Här visas alla tidigare skanningar och uppladdade kvitton.</p>
                </div>
            </div>
        </div>
    );
}

export default HistoryPage;
