import React from "react";
import "../receiptHeader.css";

export default function SavedListHeader({ onSort, currentSort, currentSortDir }) {
    const columns = [
        { key: "image", label: "Bild" },
        { key: "vendorName", label: "Namn" },
        { key: "createdAt", label: "Datum" },
        { key: "totalAmount", label: "Total" },
        { key: "category", label: "Kategori" },
        { key: "paymentMethod", label: "Betalsätt" },
    ];

    const handleClick = (key) => {
        let dir = "asc";
        if (currentSort === key) {
            dir = currentSortDir === "asc" ? "desc" : "asc";
        }
        onSort(key, dir);
    };

    return (
        <div className="history-list-header">
            {columns.map((col) => {
                const isActive = currentSort === col.key;

                return (
                    <div
                        key={col.key}
                        className={`col ${isActive ? "active-sort" : ""}`}
                        onClick={() => handleClick(col.key)}
                    >
                        <span>{col.label}↑↓</span>
                    </div>
                );
            })}
        </div>
    );
}