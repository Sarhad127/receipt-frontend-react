import React from "react";

function RightScanPanel({
                            editableReceipt,
                            ocrData,
                            viewMode,
                            setViewMode,
                            saving,
                            selectedReceiptId,
                            CATEGORIES,
                            onNewScan,
                            onRescan,
                            onSave,
                            onDelete,
                            onFieldChange,
                            onItemChange,
                            onItemRemove
                        }) {
    return (
        <div className="right-modal-side">
            <div className="right-toolbar">
                <div className="action-buttons">
                        <button className="toggle-btn" onClick={onNewScan}>Ny Kvitto</button>
                        <button className="toggle-btn" onClick={onRescan}>Skanna igen</button>
                        <button
                            className="toggle-btn"
                            onClick={onSave}
                            disabled={saving || !selectedReceiptId}
                        >
                            Spara
                        </button>
                        <button className="toggle-btn" onClick={onDelete}>Radera</button>
                </div>

                <div className="view-toggle">
                    <button
                        className={`toggle-btn ${viewMode === "dto" ? "active" : ""}`}
                        onClick={() => setViewMode("dto")}
                    >
                        Kvittodetaljer
                    </button>
                    <button
                        className={`toggle-btn ${viewMode === "raw" ? "active" : ""}`}
                        onClick={() => setViewMode("raw")}
                    >
                        Raw OCR
                    </button>
                </div>
            </div>

            <div className="info-scroll">
                {editableReceipt ? (
                    viewMode === "raw" ? (
                        <pre>{ocrData.ocr?.ocr_text || "Inget OCR-resultat"}</pre>
                    ) : (
                        <div className="receipt-dto">

                            <p>
                                <strong style={{ fontSize: "1.2rem" }}>Kategori:</strong>
                                <select
                                    className="receipt-dropdown"
                                    value={editableReceipt.category || ""}
                                    onChange={e => onFieldChange("category", e.target.value)}
                                >
                                    <option value="">Välj kategori</option>
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </p>

                            <h3>
                                <input
                                    type="text"
                                    value={editableReceipt.vendorName || ""}
                                    onChange={e => onFieldChange("vendorName", e.target.value)}
                                />
                            </h3>

                            <p><strong>Org.nr:</strong>
                                <input
                                    type="text"
                                    value={editableReceipt.vendorOrgNumber || ""}
                                    onChange={e => onFieldChange("vendorOrgNumber", e.target.value)}
                                />
                            </p>

                            <p><strong>Adress:</strong>
                                <input
                                    type="text"
                                    value={editableReceipt.vendorAddress || ""}
                                    onChange={e => onFieldChange("vendorAddress", e.target.value)}
                                />
                            </p>

                            <p><strong>Kvittonr:</strong>
                                <input
                                    type="text"
                                    value={editableReceipt.receiptNumber || ""}
                                    onChange={e => onFieldChange("receiptNumber", e.target.value)}
                                />
                            </p>

                            <p><strong>Datum:</strong>
                                <input
                                    type="text"
                                    value={editableReceipt.receiptDate || ""}
                                    onChange={e => onFieldChange("receiptDate", e.target.value)}
                                />
                            </p>

                            <p><strong>Betalmetod:</strong>
                                <input
                                    type="text"
                                    value={editableReceipt.paymentMethod || ""}
                                    onChange={e => onFieldChange("paymentMethod", e.target.value)}
                                />
                            </p>

                            <p><strong>Valuta:</strong>
                                <input
                                    type="text"
                                    value={editableReceipt.currency || ""}
                                    onChange={e => onFieldChange("currency", e.target.value)}
                                />
                            </p>

                            <p><strong>Total:</strong>
                                <input
                                    type="number"
                                    value={editableReceipt.totalAmount ?? ""}
                                    onChange={e => onFieldChange("totalAmount", e.target.value)}
                                />
                            </p>

                            <p><strong>Moms:</strong>
                                <input
                                    type="number"
                                    value={editableReceipt.vatAmount ?? ""}
                                    onChange={e => onFieldChange("vatAmount", e.target.value)}
                                />
                            </p>

                            {editableReceipt.items?.length > 0 && (
                                <table className="receipt-items-table">
                                    <thead>
                                    <tr>
                                        <th>Artikel</th>
                                        <th>Antal</th>
                                        <th>Enhetspris</th>
                                        <th>Totalt</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {editableReceipt.items.map((item, index) => (
                                        <tr key={index}>
                                            <td>
                                                <input
                                                    type="text"
                                                    value={item.itemName}
                                                    onChange={e => onItemChange(index, "itemName", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={item.itemQuantity}
                                                    onChange={e => onItemChange(index, "itemQuantity", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    value={item.itemUnitPrice}
                                                    onChange={e => onItemChange(index, "itemUnitPrice", e.target.value)}
                                                />
                                            </td>
                                            <td>
                                                <input type="number" value={item.itemTotalPrice} readOnly />
                                            </td>
                                            <td>
                                                <button onClick={() => onItemRemove(index)}>Ta bort</button>
                                            </td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            )}

                        </div>
                    )
                ) : (
                    <div className="right-side-text">
                        <h2>Skannad information</h2>
                        <p>Här visas all OCR-skannad information från kvittot.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RightScanPanel;