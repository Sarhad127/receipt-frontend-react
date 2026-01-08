import React from "react";
import "./RightSideSaved.css";

const RightSideSaved = ({
                            selectedReceipt,
                            selectedImage,
                            setModalOpen
                        }) => {
    return (
        <div className="right-panel">
            {selectedImage ? (
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

                    {selectedReceipt && (
                        <div className="right-panel-info">
                            <h4>Kvittoinformation</h4>
                            <div className="info-row">
                                <span>Leverantör</span>
                                <strong>{selectedReceipt.vendorName || "–"}</strong>
                            </div>
                            <div className="info-row">
                                <span>Datum</span>
                                <strong>{new Date(selectedReceipt.createdAt).toLocaleDateString()}</strong>
                            </div>
                            <div className="info-row">
                                <span>Total</span>
                                <strong>{selectedReceipt.totalAmount ?? "–"} SEK</strong>
                            </div>
                            <div className="info-row">
                                <span>Status</span>
                                <strong>{selectedReceipt.saved ? "Sparad" : "Ej sparad"}</strong>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <p className="right-panel-placeholder">
                    Välj ett kvitto för att visa här
                </p>
            )}
        </div>
    );
};

export default RightSideSaved;