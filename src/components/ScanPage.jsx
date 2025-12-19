import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/pages/ScanPage.css";
import "./style/AppLayout.css";

function ScanPage() {
    const [username, setUsername] = useState("");
    const [ocrData, setOcrData] = useState(null);
    const navigate = useNavigate();
    const effectRan = useRef(false);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        const token = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");

        try {
            const response = await fetch("http://localhost:8080/upload", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();
            console.log(result);
            setOcrData(result);
        } catch (err) {
            console.error("Upload failed:", err);
        }
    };

    useEffect(() => {
        if (effectRan.current) return;
        effectRan.current = true;

        const fetchHome = async () => {
            const token = localStorage.getItem("jwt") || sessionStorage.getItem("jwt");
            if (!token) { navigate("/"); return; }

            try {
                const response = await fetch("http://localhost:8080/skanna", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (!response.ok) throw new Error("Unauthorized");

                const data = await response.json();
                console.log("User info from /home:", data);
                setUsername(data.username);
            } catch (err) {
                console.error("Failed to fetch user info:", err);
                localStorage.removeItem("jwt");
                sessionStorage.removeItem("jwt");
                navigate("/");
            }
        };

        fetchHome();
    }, [navigate]);

    return (
        <div className="page-wrapper">
            <div className="page-tabs">
                <button className="tab active">Skanna</button>
                <button className="tab" onClick={() => navigate("/historik")}>Historik</button>
                <button className="tab" onClick={() => navigate("/sparade")}>Sparade</button>
                <button className="tab" onClick={() => navigate("/statistik")}>Statistik</button>
                <button className="tab" onClick={() => navigate("/installningar")}>Inställningar</button>
            </div>

            <div className="page-container">
                <div className="page-content scan-content">
                    <div className="upload-section">
                        <h2>Ladda upp kvitto</h2>
                        <input type="file" accept="image/*" onChange={handleUpload} />
                        <p>Dra och släpp fil här eller klicka för att välja bild</p>
                    </div>
                    <div className="info-section">
                        <h2>Skannad information</h2>
                        {ocrData ? (
                            <pre>{ocrData.ocr?.ocr_text || "Inget OCR-resultat"}</pre>
                        ) : (
                            <p>Här visas all OCR-skannad information från kvittot.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ScanPage;
