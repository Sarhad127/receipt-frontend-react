import React, { useRef } from "react";
import { FaTrash } from "react-icons/fa";
import {deleteSavedReceipt} from "../api/apis.jsx";
import '../modals/css/EditReceiptsModal.css'

export default function EditReceiptsModal({
                                                 selectedReceipt,
                                                 editableReceipt,
                                                 images,
                                                 currentIndex,
                                                 filteredReceipts,
                                                 ocrDataMap,
                                                 setEditableReceipt,
                                                 setOcrData,
                                                 saving,
                                                 setCurrentIndex,
                                                 setReceipts,
                                                 handleSave,
                                                 goToNext,
                                                 goToPrev,
                                                 closeModal,
                                                 handleItemChange,
                                                 handleItemAdd,
                                                 handleItemRemove,
                                                 editingField,
                                                 setEditingField
                                             }) {
    const editableRef = useRef(null);

    const handleInputChange = (field, value) => {
        setEditableReceipt(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const TrashButton = ({ receipt }) => {
        const handleDelete = async () => {
            if (!receipt) return;
            if (window.confirm("Vill du verkligen radera detta kvitto?")) {
                const receiptId = receipt.id;
                try {
                    await deleteSavedReceipt(receiptId);
                    setReceipts(prev => prev.filter(r => r.id !== receiptId));

                    if (filteredReceipts.length > 1) {
                        const nextIndex = Math.min(currentIndex, filteredReceipts.length - 2);
                        const nextReceipt = filteredReceipts[nextIndex];
                        setEditableReceipt(JSON.parse(JSON.stringify(ocrDataMap[nextReceipt.id])));
                        setOcrData(ocrDataMap[nextReceipt.id]);
                        setCurrentIndex(nextIndex);
                        closeModal();
                    } else {
                        closeModal();
                    }
                } catch (err) {
                    console.error(err);
                }
            }
        };

        return (
            <span className="trash-button" onClick={handleDelete} title="Radera kvitto">
                <FaTrash />
            </span>
        );
    };

    return (
        <div className="saved-modal-overlay" onClick={closeModal}>
            <div className="saved-modal-content" onClick={e => e.stopPropagation()}>
                <div className="receipt-navigation">
                    <button onClick={goToPrev} disabled={currentIndex === 0}>Föregående</button>
                    <div className="next-trash-wrapper">
                        <button onClick={goToNext} disabled={currentIndex === filteredReceipts.length - 1}>Nästa</button>
                        {/* eslint-disable-next-line react-hooks/static-components */}
                        <TrashButton receipt={selectedReceipt} />
                    </div>
                </div>

                <div className="saved-modal-main">
                    <div className="saved-modal-left">
                        {images[selectedReceipt.id] && (
                            <img
                                src={images[selectedReceipt.id]}
                                alt="Kvitto"
                                className="saved-modal-image"
                            />
                        )}
                    </div>

                    <div className="saved-modal-right">
                        <div className="edit-receipt">
                            Redigera kvitto
                        </div>
                        <div className="saved-ocr-info" ref={editableRef}>
                            {[
                                "vendorName",
                                "vendorOrgNumber",
                                "vendorAddress",
                                "receiptDate",
                                "receiptNumber",
                                "paymentMethod",
                                "totalAmount",
                                "vatAmount",
                                "category"
                            ].map(field => (
                                <p key={field}>
                                    <strong>{{
                                        vendorName: "Butik",
                                        vendorOrgNumber: "Org.nr",
                                        vendorAddress: "Adress",
                                        receiptDate: "Datum",
                                        receiptNumber: "Kvittonummer",
                                        paymentMethod: "Betalningsmetod",
                                        totalAmount: "Totalt belopp",
                                        vatAmount: "Moms",
                                        category: "Kategori"
                                    }[field]}:</strong>{" "}
                                    {field === "category" ? (
                                        <select
                                            value={editableReceipt.category || ""}
                                            onChange={e => handleInputChange("category", e.target.value)}
                                            onBlur={() => setEditingField(null)}
                                            className="saved-ocr-info-placeholder"
                                        >
                                            <option value="">Välj kategori</option>
                                            {[
                                                "Alla",
                                                "Livsmedel",
                                                "Restaurang",
                                                "Transport",
                                                "Boende",
                                                "Hälsa",
                                                "Nöje",
                                                "Resor",
                                                "Elektronik",
                                                "Abonnemang",
                                                "Shopping",
                                                "Övrigt"
                                            ].map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    ) : editingField === field ? (
                                        <input
                                            type={field.includes("Amount") || field === "vatAmount" ? "number" : "text"}
                                            value={editableReceipt[field] || ""}
                                            onChange={e => handleInputChange(field, e.target.value)}
                                            onBlur={() => setEditingField(null)}
                                            autoFocus
                                            className="saved-ocr-info-placeholder"
                                        />
                                    ) : (
                                        <span onClick={() => setEditingField(field)} className="editable-text">
                                            {editableReceipt[field] || "–"}
                                        </span>
                                    )}
                                </p>
                            ))}
                        </div>

                        <div className="article-title-modal">
                            <strong>Artiklar</strong>
                            <p className="article-hint">
                                Klicka på en rad för att redigera: <span style={{ fontStyle: 'italic', color: '#ccc' }}>vara, antal och pris</span>
                            </p>
                        </div>

                        {editableReceipt.items && editableReceipt.items.length > 0 && (
                            <ul className="saved-ocr-items">
                                <li className="receipt-item-row header-row">
                                    <div className="cell remove-btn"></div>
                                    <div className="cell item-name">
                                        <span className="inline-edit-span header-text">Artikel</span>
                                    </div>
                                    <div className="cell item-quantity">
                                        <span className="inline-edit-span header-text">Antal</span>
                                    </div>
                                    <div className="cell item-unit-price">
                                        <span className="inline-edit-span header-text">Pris/st</span>
                                    </div>
                                    <div className="cell item-total">
                                        <span className="inline-edit-span header-text">Total</span>
                                    </div>
                                </li>
                                <li className="receipt-item-row separator-row" aria-hidden="true">
                                    <div className="separator-line"></div>
                                </li>

                                {editableReceipt.items.map((item, idx) => (
                                    <li key={idx} className="receipt-item-row">
                                        <div className="cell remove-btn">
                                            <button
                                                className="remove-item"
                                                onClick={() => handleItemRemove(idx)}
                                                title="Ta bort"
                                            >
                                                ×
                                            </button>
                                        </div>
                                        <div className="cell item-name">
                                            {editingField === `item-${idx}-itemName` ? (
                                                <input
                                                    type="text"
                                                    value={item.itemName}
                                                    placeholder="Artikelnamn"
                                                    onChange={e => handleItemChange(idx, "itemName", e.target.value)}
                                                    onBlur={() => setEditingField(null)}
                                                    autoFocus
                                                    className="inline-edit-input"
                                                />
                                            ) : (
                                                <span
                                                    onClick={() => setEditingField(`item-${idx}-itemName`)}
                                                    className="inline-edit-span"
                                                >
                                              {item.itemName || "Artikelnamn"}
                                            </span>
                                            )}
                                        </div>
                                        <div className="cell item-quantity">
                                            {editingField === `item-${idx}-itemQuantity` ? (
                                                <input
                                                    type="number"
                                                    value={item.itemQuantity}
                                                    placeholder="Antal"
                                                    onChange={e => handleItemChange(idx, "itemQuantity", parseFloat(e.target.value) || 0)}
                                                    onBlur={() => setEditingField(null)}
                                                    autoFocus
                                                    className="inline-edit-input"
                                                />
                                            ) : (
                                                <span
                                                    onClick={() => setEditingField(`item-${idx}-itemQuantity`)}
                                                    className="inline-edit-span"
                                                >
                                              {item.itemQuantity || "Antal"}
                                            </span>
                                            )}
                                        </div>
                                        <div className="cell item-unit-price">
                                            {editingField === `item-${idx}-itemUnitPrice` ? (
                                                <input
                                                    type="number"
                                                    value={item.itemUnitPrice}
                                                    placeholder="Pris/st"
                                                    onChange={e => handleItemChange(idx, "itemUnitPrice", parseFloat(e.target.value) || 0)}
                                                    onBlur={() => setEditingField(null)}
                                                    autoFocus
                                                    className="inline-edit-input"
                                                />
                                            ) : (
                                                <span
                                                    onClick={() => setEditingField(`item-${idx}-itemUnitPrice`)}
                                                    className="inline-edit-span"
                                                >
                                              {item.itemUnitPrice || "Pris/st"}
                                            </span>
                                            )}
                                        </div>
                                        <div className="cell item-total">
                                            <span>{item.itemTotalPrice}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <div className="right-panel-bottom-buttons">
                            <button className="add-item" onClick={handleItemAdd}>Lägg till artikel</button>
                            <button className="save-receipt" onClick={handleSave} disabled={saving}>
                                {saving ? "Sparar..." : "Spara"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}