import React from "react";
import "./RightSideHistory.css";

const RightSideHistory = ({
                              selectedImage,
                              selectedReceiptId,
                              receipts,
                              saving,
                              handleSave,
                              handleDelete,
                              navigate,
                              setModalOpen
                          }) => {
    const selectedReceipt = receipts.find(r => r.id === selectedReceiptId);

    return (
        <div className="right-panel">
            {selectedImage ? (
                <>
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

                    <div className="right-panel-actions">
                        <button
                            className="action-btn"
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? "Sparar..." : "Spara"}
                        </button>

                        <button
                            className="action-btn"
                            onClick={() =>
                                navigate("/kvitton", {
                                    state: { scanOpen: true, prefillReceiptId: selectedReceiptId }
                                })
                            }
                        >
                            Skanna igen
                        </button>

                        <button
                            className="action-btn danger"
                            onClick={handleDelete}
                        >
                            Radera
                        </button>
                    </div>

                    {selectedReceiptId && selectedReceipt && (
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
                                <strong>{selectedReceipt.totalAmount} SEK</strong>
                            </div>
                            <div className="info-row">
                                <span>Moms</span>
                                <strong>{selectedReceipt.vatAmount ?? "–"} SEK</strong>
                            </div>
                            <div className="info-row">
                                <span>Kategori</span>
                                <strong>{selectedReceipt.category || "Okänd"}</strong>
                            </div>
                            <div className="info-row">
                                <span>Status</span>
                                <strong>{selectedReceipt.saved ? "Sparad" : "Ej sparad"}</strong>
                            </div>

                            <h4>Historik – översikt</h4>
                            <div className="info-row">
                                <span>Antal kvitton</span>
                                <strong>{receipts.length}</strong>
                            </div>
                            <div className="info-row">
                                <span>Totalt summa</span>
                                <strong>{receipts.reduce((sum, r) => sum + (r.totalAmount ?? 0), 0).toFixed(2)} SEK</strong>
                            </div>
                            <div className="info-row">
                                <span>Genomsnitt</span>
                                <strong>{receipts.length
                                    ? (receipts.reduce((sum, r) => sum + (r.totalAmount ?? 0), 0) / receipts.length).toFixed(2)
                                    : "0.00"} SEK
                                </strong>
                            </div>
                            <div className="info-row">
                                <span>Sparade kvitton</span>
                                <strong>{receipts.filter(r => r.saved).length}</strong>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <p className="right-panel-placeholder">
                    Välj ett kvitto för att visa statistik här
                </p>
            )}
        </div>
    );
};

export default RightSideHistory;