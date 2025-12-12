import React, { useState } from "react";
import "./style/UploadReceipt.css";

function UploadReceipt() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [ocrData, setOcrData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setSelectedImage(URL.createObjectURL(file));
        setOcrData(null);
        setError("");
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("image", file);

            const response = await fetch("http://127.0.0.1:8000/ocr", {
                method: "POST",
                body: formData
            });

            if (!response.ok) {
                throw new Error("OCR-förfrågan misslyckades");
            }

            const data = await response.json();
            setOcrData(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-wrapper">
            <h2 className="title">Ladda upp kvitto</h2>

            {/* Upload Box */}
            <label className="upload-box">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden-input"
                />
                <div className="upload-content">
                    <div className="upload-icon">📤</div>
                    <p>Klicka här eller dra in ett kvitto</p>
                </div>
            </label>

            {/* Loading */}
            {loading && <p>Läser av kvittot...</p>}

            {/* Error */}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* Preview */}
            {selectedImage && (
                <div className="preview-section">
                    <h3>Förhandsgranskning</h3>
                    <img
                        src={selectedImage}
                        alt="Receipt Preview"
                        className="receipt-image"
                    />
                </div>
            )}

            {/* OCR Data */}
            {ocrData && (
                <div className="ocr-wrapper">
                    <h3>OCR-Resultat</h3>

                    <ul className="ocr-list">
                        <li><strong>Butik:</strong> {ocrData.store}</li>
                        <li><strong>Datum:</strong> {ocrData.date}</li>
                        <li><strong>Total:</strong> {ocrData.total}</li>
                        <li>
                            <strong>Artiklar:</strong>
                            <ul className="item-list">
                                {ocrData.items && ocrData.items.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </li>
                    </ul>

                    {/* Visa hela JSON-responsen */}
                    <h4>Full JSON:</h4>
                    <pre>{JSON.stringify(ocrData, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}

export default UploadReceipt;
