import React, { useState } from "react";
import "./style/UploadReceipt.css";

function UploadReceipt() {
    const [selectedImage, setSelectedImage] = useState(null);
    const [ocrData, setOcrData] = useState(null);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setSelectedImage(URL.createObjectURL(file));

        // Placeholder for OCR
        setOcrData({
            store: "ICA Maxi",
            date: "2024-02-16",
            total: "152.90 kr",
            items: ["Mjölk 20.90", "Pasta 15.00", "Kaffe 79.00", "Bananer 38.00"]
        });
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
                                {ocrData.items.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}

export default UploadReceipt;