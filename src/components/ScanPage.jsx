import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./style/pages/ScanPage.css";
import "./style/AppLayout.css";
import { uploadReceipt } from "./api/apis.jsx";
import { fetchUserInfo } from "./api/apis.jsx";

function ScanPage() {
    const [username, setUsername] = useState("");
    const [ocrData, setOcrData] = useState(null);
    const navigate = useNavigate();
    const effectRan = useRef(false);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [viewMode, setViewMode] = useState("list");

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadedImage(URL.createObjectURL(file));

        try {
            const result = await uploadReceipt(file);
            console.log(result);
            setOcrData(result);
        } catch (err) {
            console.error("Upload failed:", err);
        }
    };

    useEffect(() => {
        if (effectRan.current) return;
        effectRan.current = true;

        const loadUser = async () => {
            try {
                const data = await fetchUserInfo();
                console.log("User info from /home:", data);
                setUsername(data.username);
            } catch (err) {
                console.error("Failed to fetch user info:", err);
                localStorage.removeItem("jwt");
                sessionStorage.removeItem("jwt");
                navigate("/");
            }
        };

        loadUser();
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
                        <div className="scroll-inner">
                            <h2>Ladda upp kvitto</h2>
                            <input type="file" accept="image/*" onChange={handleUpload} />
                            <p>Dra och släpp fil här eller klicka för att välja bild</p>

                            {uploadedImage && (
                                <img
                                    src={uploadedImage}
                                    alt="Uploaded receipt"
                                    className="uploaded-image"
                                />
                            )}
                        </div>
                    </div>

                    <div className="info-section">
                        <div>
                            <h2>Skannad information</h2>
                            <div className="action-buttons">
                                <button className="toggle-btn" onClick={() => {/* Rescan logic */}}>
                                    Skanna igen
                                </button>
                                <button className="toggle-btn" onClick={() => {/* Save logic */}}>
                                    Spara
                                </button>
                                <button className="toggle-btn" onClick={() => {/* Delete logic */}}>
                                    Radera
                                </button>
                            </div>
                            <div className="view-toggle">
                                <button
                                    className={`toggle-btn ${viewMode === "list" ? "active" : ""}`}
                                    onClick={() => setViewMode("list")}
                                >
                                    Lista
                                </button>

                                <button
                                    className={`toggle-btn ${viewMode === "raw" ? "active" : ""}`}
                                    onClick={() => setViewMode("raw")}
                                >
                                    Raw
                                </button>
                            </div>
                        </div>

                        {ocrData ? (
                            viewMode === "raw" ? (
                                <pre>
                            {ocrData.ocr?.ocr_text || "Inget OCR-resultat"}
                        </pre>
                            ) : (
                                <ul>
                                    {ocrData.ocr?.ocr_text
                                        ?.split("\n")
                                        .filter(line => line.trim() !== "")
                                        .map((line, index) => (
                                            <li key={index}>{line}</li>
                                        ))}
                                </ul>
                            )
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
