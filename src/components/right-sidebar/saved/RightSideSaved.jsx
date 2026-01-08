import React from "react";
import "./RightSideSaved.css";

const RightSideSaved = ({
                            selectedReceipt,
                            selectedImage,
                            setModalOpen,
                            allReceipts = [],
                            ocrDataMap = {}
                        }) => {
    const totals = allReceipts.map(r => ocrDataMap[r.id]?.totalAmount || 0);
    const totalReceipts = totals.length;
    const totalSum = totals.reduce((sum, amt) => sum + amt, 0);
    const averageAmount = totalReceipts > 0 ? (totalSum / totalReceipts).toFixed(2) : 0;

    const categoryCounts = allReceipts.reduce((acc, r) => {
        const cat = ocrDataMap[r.id]?.category || "Okänd";
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});

    const maxCount = Math.max(...Object.values(categoryCounts), 1);

    return (
        <div className="right-panel">
            {selectedImage && (
                <div className="right-panel-image-wrapper">
                    <div className="image-container">
                        <img
                            src={selectedImage}
                            alt="Valt kvitto"
                            className="right-panel-image"
                        />
                        <button
                            className="expand-btn-on-image"
                            onClick={() => setModalOpen(true)}
                            aria-label="Förstora bild"
                            title="Förstora"
                        >
                            ⤢
                        </button>
                    </div>
                </div>
            )}

            {selectedReceipt ? (
                <div className="right-panel-info">
                    <h4>Kvittoinformation</h4>
                    <div className="info-row">
                        <span>Leverantör</span>
                        <strong>{ocrDataMap[selectedReceipt.id]?.vendorName || "–"}</strong>
                    </div>
                    <div className="info-row">
                        <span>Datum</span>
                        <strong>{new Date(selectedReceipt.createdAt).toLocaleDateString()}</strong>
                    </div>
                    <div className="info-row">
                        <span>Total</span>
                        <strong>{ocrDataMap[selectedReceipt.id]?.totalAmount ?? "–"} SEK</strong>
                    </div>
                    <div className="info-row">
                        <span>Kategori</span>
                        <strong>{ocrDataMap[selectedReceipt.id]?.category || "–"}</strong>
                    </div>
                    <div className="info-row">
                        <span>Betalmetod</span>
                        <strong>{ocrDataMap[selectedReceipt.id]?.paymentMethod || "–"}</strong>
                    </div>
                    <div className="info-row">
                        <span>Valuta</span>
                        <strong>{ocrDataMap[selectedReceipt.id]?.currency || "SEK"}</strong>
                    </div>
                    <div className="info-row">
                        <span>Status</span>
                        <strong>{selectedReceipt.saved ? "Sparad" : "Ej sparad"}</strong>
                    </div>

                    <hr style={{ margin: "10px 0", borderColor: "#555" }} />

                    <h4>Statistik för alla sparade kvitton</h4>
                    <div className="info-row">
                        <span>Antal kvitton</span>
                        <strong>{totalReceipts}</strong>
                    </div>
                    <div className="info-row">
                        <span>Total summa</span>
                        <strong>{totalSum} SEK</strong>
                    </div>
                    <div className="info-row">
                        <span>Genomsnittlig summa</span>
                        <strong>{averageAmount} SEK</strong>
                    </div>

                    <div className="category-stats">
                        <h5>Kategorifördelning</h5>
                        {Object.entries(categoryCounts).map(([cat, count]) => {
                            const widthPercent = (count / maxCount) * 100;
                            return (
                                <div key={cat} className="category-bar-wrapper">
                                    <span className="category-label">{cat} ({count})</span>
                                    <div className="category-bar-bg">
                                        <div
                                            className="category-bar-fill"
                                            style={{ width: `${widthPercent}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <p className="right-panel-placeholder">
                    Välj ett kvitto för att visa statistik här
                </p>
            )}
        </div>
    );
};

export default RightSideSaved;