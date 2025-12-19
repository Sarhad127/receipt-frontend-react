import React from "react";
import { useNavigate } from "react-router-dom";
import "./style/AppLayout.css";
import "./style/pages/StatisticsPage.css"

function StatisticsPage() {
    const navigate = useNavigate();

    return (
        <div className="page-wrapper">
            <div className="page-tabs">
                <button className="tab" onClick={() => navigate("/skanna")}>Skanna</button>
                <button className="tab" onClick={() => navigate("/historik")}>Historik</button>
                <button className="tab" onClick={() => navigate("/sparade")}>Sparade</button>
                <button className="tab active">Statistik</button>
                <button className="tab" onClick={() => navigate("/installningar")}>Inställningar</button>
            </div>

            <div className="page-container">
                <div className="page-content">
                    <h1>Staistik</h1>
                    <p>Här visas olika former av information om alla sparande kvitton.</p>
                </div>
            </div>
        </div>
    );
}

export default StatisticsPage;