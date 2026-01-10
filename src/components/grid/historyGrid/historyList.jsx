import React from "react";

export default function HistoryList({ r, image }) {
    return (
        <div className="list-item">
            {image ? (
                <img src={image} alt="Kvitto" className="list-image" />
            ) : (
                <p>Laddar bild...</p>
            )}

            <div className="list-info">
                <p className="receipt-vendor">
                    {r.vendorName || "–"}
                </p>
                <p>Total: {r.totalAmount} {r.currency}</p>
            </div>

            <span className="list-date">
                <span className={`saved-dot-list ${r.saved ? "active" : ""}`}></span>
                {new Date(r.createdAt).toLocaleDateString()}
            </span>
        </div>
    );
}