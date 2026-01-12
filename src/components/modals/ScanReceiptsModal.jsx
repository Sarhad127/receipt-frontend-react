import React, { useEffect, useState, useRef } from "react";
import { useScan } from "../../context/ScanContext.jsx";
import {
    rescanReceipt,
    uploadReceipt,
    saveReceipt,
    deleteHistoryReceipt,
    fetchHistoryReceiptFile,
    fetchHistoryReceipts,
    fetchUserInfo
} from "../api/apis.jsx";

import "./css/ScanModalLeftPanel.css";
import "./css/ScanModalRightPanel.css";
import "./css/BothSides.css";
import RightScanPanel from "./RightScanPanel.jsx";
import LeftScanPanel from "./LeftScanPanel.jsx";

function resizeImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            let { width, height } = img;

            if (width > height) {
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width = Math.round((width * maxHeight) / height);
                    height = maxHeight;
                }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob(
                (blob) => resolve(blob),
                "image/jpeg",
                quality
            );
        };
        img.onerror = reject;
    });
}

function ScanReceiptsModal({ open, onClose, historyReceiptId = null }) {
    const {
        uploadedFile,
        setUploadedFile,
        uploadedImage,
        setUploadedImage,
        ocrData,
        setOcrData,
        selectedReceiptId,
        setSelectedReceiptId
    } = useScan();

    const [email, setEmail] = useState("");
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState("dto");
    const [editableReceipt, setEditableReceipt] = useState(null);
    const [savedReceipts, setSavedReceipts] = useState([]);
    const effectRan = useRef(false);

    const CATEGORIES = [
        "Alla", "Livsmedel", "Restaurang", "Transport", "Boende",
        "Hälsa", "Nöje", "Resor", "Elektronik",
        "Abonnemang", "Shopping", "Övrigt"
    ];

    useEffect(() => {
        if (effectRan.current) return;
        effectRan.current = true;

        fetchUserInfo()
            .then(data => setEmail(data.email))
            .catch(() => {
                localStorage.removeItem("jwt");
                sessionStorage.removeItem("jwt");
            });
    }, []);

    useEffect(() => {
        if (ocrData?.receipt) {
            setEditableReceipt(JSON.parse(JSON.stringify(ocrData.receipt)));
        }
    }, [ocrData]);

    useEffect(() => {
        fetchHistoryReceipts()
            .then(setSavedReceipts)
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (!historyReceiptId) return;

        setSelectedReceiptId(historyReceiptId);

        const load = async () => {
            try {
                const file = await fetchHistoryReceiptFile(historyReceiptId);
                setUploadedImage(URL.createObjectURL(file));

                const ocr = await rescanReceipt(historyReceiptId, file);
                setOcrData(ocr);

                if (ocr.receipt) {
                    setEditableReceipt(JSON.parse(JSON.stringify(ocr.receipt)));
                }
            } catch (e) {
                console.error(e);
            }
        };

        load();
    }, [historyReceiptId, setOcrData, setSelectedReceiptId, setUploadedImage]);

    const handleInputChange = (field, value) => {
        setEditableReceipt(prev => ({ ...prev, [field]: value }));
    };

    const handleItemChange = (index, field, value) => {
        const items = [...editableReceipt.items];
        items[index] = {
            ...items[index],
            [field]: value,
            itemTotalPrice:
                (field === "itemQuantity" ? value : items[index].itemQuantity) *
                (field === "itemUnitPrice" ? value : items[index].itemUnitPrice)
        };
        setEditableReceipt(prev => ({ ...prev, items }));
    };

    const handleUpload = async e => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadedFile(file);

        const compressedBlob = await resizeImage(file, 800, 800, 0.7);
        const compressedUrl = URL.createObjectURL(compressedBlob);

        setUploadedImage(compressedUrl);
        
        try {
            const result = await uploadReceipt(compressedBlob);
            setOcrData(result);
            if (result.receiptId) setSelectedReceiptId(result.receiptId);
        } catch (err) {
            console.error("Upload failed:", err);
        }
    };

    const handleRescan = async () => {
        if (!uploadedFile || !selectedReceiptId) return;

        try {
            const data = await rescanReceipt(selectedReceiptId, uploadedFile);
            setOcrData(data);

            if (data.receipt) setEditableReceipt(JSON.parse(JSON.stringify(data.receipt)));
        } catch (err) {
            console.error("Rescan failed:", err);
        }
    };

    const handleSave = async () => {
        if (!selectedReceiptId || saving) return;

        try {
            setSaving(true);
            await saveReceipt(selectedReceiptId, editableReceipt);

            setSavedReceipts(prev => [...prev, { ...editableReceipt, id: selectedReceiptId, saved: true }]);
            handleNewScan();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedReceiptId) return;
        try {
            await deleteHistoryReceipt(selectedReceiptId);
            handleNewScan();
        } catch (err) {
            console.error(err);
            alert("Kunde inte ta bort kvittot.");
        }
    };

    const handleNewScan = () => {
        setUploadedFile(null);
        setUploadedImage(null);
        setOcrData(null);
        setSelectedReceiptId(null);
        setEditableReceipt(null);
    };

    const handleItemRemove = index => {
        setEditableReceipt(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    if (!open) return null;

    return (
        <div className="receipt-scanning-modal">
            <button className="scan-modal-close" onClick={onClose}>✕</button>
            <div className="scan-modal">

                <LeftScanPanel
                    uploadedImage={uploadedImage}
                    onUpload={handleUpload}
                />

                <RightScanPanel
                    editableReceipt={editableReceipt}
                    ocrData={ocrData}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    saving={saving}
                    selectedReceiptId={selectedReceiptId}
                    CATEGORIES={CATEGORIES}
                    onNewScan={handleNewScan}
                    onRescan={handleRescan}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    onFieldChange={handleInputChange}
                    onItemChange={handleItemChange}
                    onItemRemove={handleItemRemove}
                />
            </div>
        </div>
    );
}

export default ScanReceiptsModal;