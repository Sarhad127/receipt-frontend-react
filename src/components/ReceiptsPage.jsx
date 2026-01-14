import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./style/pages/ReceiptsPage.css";
import "./style/AppLayout.css";
import "./grid/grid.css"
import {fetchSavedReceipts, fetchReceiptImage, fetchSavedReceiptData, saveReceiptInfo}
    from "./api/apis";
import PageHeader, { filterReceipts } from "./header/PageHeader.jsx";
import RightSideSaved from "./right-sidebar/saved/RightSideSaved.jsx";
import EditReceiptsModal from "./modals/EditReceiptsModal.jsx";
import SavedGrid from "./grid/savedGrid/savedGrid.jsx";
import SavedList from "./grid/savedGrid/savedList.jsx";
import SavedListHeader from "./grid/savedGrid/savedListHeader.jsx";
import ScanReceiptsModal from "./modals/ScanReceiptsModal.jsx";
import receiptsIcon from "./icons/receipt.png";
import historyIcon from "./icons/history.png";
import statsIcon from "./icons/analytics.png";
import addReceiptIcon from "./icons/addReceipt.png";

function ReceiptsPage() {
    const navigate = useNavigate();
    const [receipts, setReceipts] = useState([]);
    const [images, setImages] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [editableReceipt, setEditableReceipt] = useState(null);
    const [ocrData, setOcrData] = useState(null);
    const [ocrDataMap, setOcrDataMap] = useState({});
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [saving, setSaving] = useState(false);
    const [editingField, setEditingField] = useState(null);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const editableRef = useRef(null);
    const [quickDate, setQuickDate] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [minAmount, setMinAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");
    const [sortOption, setSortOption] = useState("newest");
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedReceipts, setSelectedReceipts] = useState(new Set());
    const [scanOpen, setScanOpen] = useState(false);

    const [gridSize, setGridSize] = useState(() => {
        return localStorage.getItem("savedPageGridSize") || "medium";
    });

    const [layout, setLayout] = useState(() => {
        return localStorage.getItem("savedPageLayout") || "grid";
    });

    const handleGridSizeChange = (size) => {
        setGridSize(size);
        localStorage.setItem("savedPageGridSize", size);
    };

    useEffect(() => {
        const loadReceipts = async () => {
            try {
                const data = await fetchSavedReceipts();
                setReceipts(data);

                const imageMap = {};
                const ocrMap = {};
                for (const r of data) {
                    const imgUrl = await fetchReceiptImage(r.id);
                    if (imgUrl) imageMap[r.id] = imgUrl;

                    const ocr = await fetchSavedReceiptData(r.id);
                    ocrMap[r.id] = ocr;
                }

                setImages(imageMap);
                setOcrDataMap(ocrMap);
            } catch (err) {
                localStorage.removeItem("jwt");
                sessionStorage.removeItem("jwt");
                navigate("/");
            }
        };
        loadReceipts();
    }, [navigate]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (editableRef.current && !editableRef.current.contains(event.target)) {
                setEditingField(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (modalOpen && selectedReceipt && !editableReceipt) {
            const ocr = ocrDataMap[selectedReceipt.id];
            if (ocr) {
                setEditableReceipt(JSON.parse(JSON.stringify(ocr)));
                setOcrData(ocr);
            }
        }
    }, [modalOpen, selectedReceipt, editableReceipt, ocrDataMap]);

    const recalcTotal = (receipt) => {
        if (!receipt.items) return 0;
        return receipt.items.reduce((sum, item) => sum + (item.itemTotalPrice || 0), 0);
    };

    const handleLayoutChange = (newLayout) => {
        setLayout(newLayout);
        localStorage.setItem("savedPageLayout", newLayout);
    };

    const handleReceiptClick = (receipt, index) => {
        setSelectedReceipt(receipt);
        setEditableReceipt(JSON.parse(JSON.stringify(ocrDataMap[receipt.id])));
        setOcrData(ocrDataMap[receipt.id]);
        setCurrentIndex(index);
        setModalOpen(false);
        setImageModalOpen(false);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditableReceipt(null);
        setOcrData(null);
        setEditingField(null);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...(editableReceipt.items || [])];
        const quantity = field === "itemQuantity" ? parseFloat(value) || 0 : parseFloat(newItems[index].itemQuantity) || 0;
        const unitPrice = field === "itemUnitPrice" ? parseFloat(value) || 0 : parseFloat(newItems[index].itemUnitPrice) || 0;
        newItems[index] = {
            ...newItems[index],
            [field]: field === "itemQuantity" || field === "itemUnitPrice" ? parseFloat(value) || 0 : value,
            itemTotalPrice: quantity * unitPrice
        };
        setEditableReceipt(prev => {
            const updated = { ...prev, items: newItems };
            updated.totalAmount = recalcTotal(updated);
            return updated;
        });
    };

    const handleItemAdd = () => {
        const newItem = { itemName: "", itemQuantity: 1, itemUnitPrice: 0, itemTotalPrice: 0 };
        setEditableReceipt(prev => {
            const updated = { ...prev, items: [...(prev.items || []), newItem] };
            updated.totalAmount = recalcTotal(updated);
            return updated;
        });
    };

    const handleItemRemove = (index) => {
        setEditableReceipt(prev => {
            const updated = { ...prev, items: prev.items.filter((_, i) => i !== index) };
            updated.totalAmount = recalcTotal(updated);
            return updated;
        });
    };

    const handleSave = async () => {
        if (!selectedReceipt || !editableReceipt || saving) return;
        const savedReceiptId = selectedReceipt.id;
        try {
            setSaving(true);
            await saveReceiptInfo(savedReceiptId, editableReceipt);
            setOcrDataMap(prev => ({
                ...prev,
                [savedReceiptId]: editableReceipt
            }));
            setOcrData(editableReceipt);
            setModalOpen(false);
            setSelectedReceipt(null);
            setEditableReceipt(null);
            setEditingField(null);
            setOcrData(null);
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const goToNext = () => {
        if (!selectedReceipt) return;

        const currentFilteredIndex = filteredReceipts.findIndex(r => r.id === selectedReceipt.id);
        if (currentFilteredIndex < filteredReceipts.length - 1) {
            const nextReceipt = filteredReceipts[currentFilteredIndex + 1];
            setSelectedReceipt(nextReceipt);
            setEditableReceipt(JSON.parse(JSON.stringify(ocrDataMap[nextReceipt.id])));
            setOcrData(ocrDataMap[nextReceipt.id]);
            setCurrentIndex(currentFilteredIndex + 1);
        }
    };

    const goToPrev = () => {
        if (!selectedReceipt) return;

        const currentFilteredIndex = filteredReceipts.findIndex(r => r.id === selectedReceipt.id);
        if (currentFilteredIndex > 0) {
            const prevReceipt = filteredReceipts[currentFilteredIndex - 1];
            setSelectedReceipt(prevReceipt);
            setEditableReceipt(JSON.parse(JSON.stringify(ocrDataMap[prevReceipt.id])));
            setOcrData(ocrDataMap[prevReceipt.id]);
            setCurrentIndex(currentFilteredIndex - 1);
        }
    };

    const filteredReceipts = React.useMemo(() =>
            filterReceipts({
                receipts,
                ocrDataMap,
                searchTerm,
                fromDate,
                toDate,
                quickDate,
                selectedCategories,
                minAmount,
                maxAmount,
                sortOption
            }),
        [receipts, ocrDataMap, searchTerm, fromDate, toDate, quickDate, selectedCategories, minAmount, maxAmount, sortOption]
    );

    return (
        <div className="page-wrapper">
            <aside className="sidebar">
                <h1 className="sidebar-title">Huskvitton</h1>
                <nav className="sidebar-nav">
                    <div className="sidebar-item active" onClick={() => navigate("/kvitton")}>
                        <img src={receiptsIcon} alt="Kvitton" className="sidebar-icon" />
                        Kvitton
                    </div>
                    <div className="sidebar-item" onClick={() => navigate("/historik")}>
                        <img src={historyIcon} alt="Historik" className="sidebar-icon" />
                        Historik
                    </div>
                    <div className="sidebar-item" onClick={() => navigate("/statistik")}>
                        <img src={statsIcon} alt="Statistik" className="sidebar-icon" />
                        Statistik
                    </div>
                </nav>
            </aside>


            <div className="main-area">

                <PageHeader
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    quickDate={quickDate}
                    setQuickDate={setQuickDate}
                    fromDate={fromDate}
                    setFromDate={setFromDate}
                    toDate={toDate}
                    setToDate={setToDate}
                    layout={layout}
                    setLayout={handleLayoutChange}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                    minAmount={minAmount}
                    setMinAmount={setMinAmount}
                    maxAmount={maxAmount}
                    setMaxAmount={setMaxAmount}
                    sortOption={sortOption}
                    setSortOption={setSortOption}
                    receipts={receipts}
                    setReceipts={setReceipts}
                    ocrDataMap={ocrDataMap}
                    selectionMode={selectionMode}
                    setSelectionMode={setSelectionMode}
                    selectedReceipts={selectedReceipts}
                    setSelectedReceipts={setSelectedReceipts}
                    setSelectedReceipt={setSelectedReceipt}
                    selectedReceipt={selectedReceipt}
                    gridSize={gridSize}
                    setGridSize={handleGridSizeChange}
                />

                <div className="page-content">
                    {layout === "list" && <SavedListHeader />}
                    {receipts.length === 0 ? null : (
                        <ul className={`receipt-list ${layout} ${gridSize} ${selectionMode ? "selection-mode" : ""}`}>
                            {filteredReceipts.map((r, index) => (
                                <li
                                    key={r.id}
                                    className={`receipt-item ${layout} ${
                                        selectionMode
                                            ? (selectedReceipts.has(r.id) ? "selected-receipt" : "")
                                            : (selectedReceipt?.id === r.id ? "selected-receipt" : "")
                                    }`}
                                    onClick={() => {
                                        if (selectionMode) {
                                            setSelectedReceipts(prev => {
                                                const newSet = new Set(prev);
                                                if (newSet.has(r.id)) newSet.delete(r.id);
                                                else newSet.add(r.id);
                                                return newSet;
                                            });
                                        } else {
                                            handleReceiptClick(r, index);
                                        }
                                    }}
                                >
                                    {layout === "grid" ? (
                                        <SavedGrid
                                            r={r}
                                            image={images[r.id]}
                                            ocrData={ocrDataMap[r.id]}
                                        />
                                    ) : (
                                        <SavedList
                                            r={r}
                                            image={images[r.id]}
                                            ocrData={ocrDataMap[r.id]}
                                        />
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                    {filteredReceipts.length === 0 && (
                        <div className="empty-state">
                            <p>Inga kvitton</p>
                        </div>
                    )}
                </div>
                <button
                    className="fab-upload"
                    onClick={() => setScanOpen(true)}
                    title="Skanna / Ladda upp kvitto"
                >
                    <img src={addReceiptIcon} alt="Lägg till kvitto" className="fab-icon-img" />
                </button>
            </div>

            <RightSideSaved
                selectedReceipt={selectedReceipt}
                selectedImage={selectedReceipt ? images[selectedReceipt.id] : null}
                setModalOpen={setModalOpen}
                allReceipts={receipts}
                ocrDataMap={ocrDataMap}
            />
            {modalOpen && selectedReceipt && editableReceipt && (
                <EditReceiptsModal
                    selectedReceipt={selectedReceipt}
                    editableReceipt={editableReceipt}
                    images={images}
                    currentIndex={currentIndex}
                    filteredReceipts={filteredReceipts}
                    ocrDataMap={ocrDataMap}
                    setEditableReceipt={setEditableReceipt}
                    setOcrData={setOcrData}
                    setModalOpen={setModalOpen}
                    saving={saving}
                    setSaving={setSaving}
                    setCurrentIndex={setCurrentIndex}
                    setReceipts={setReceipts}
                    handleSave={handleSave}
                    goToNext={goToNext}
                    goToPrev={goToPrev}
                    closeModal={closeModal}
                    handleItemChange={handleItemChange}
                    handleItemAdd={handleItemAdd}
                    handleItemRemove={handleItemRemove}
                    editingField={editingField}
                    setEditingField={setEditingField}
                />
            )}

            <ScanReceiptsModal open={scanOpen} onClose={() => setScanOpen(false)} />
        </div>
    );
}

export default ReceiptsPage;