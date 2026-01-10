import React from "react";

export default function HistoryList({ r, image }) {
    return (
        <div className="history-list-row">
            <div className="col image">
                {image ? (
                    <img src={image} alt="Kvitto" className="list-image" />
                ) : (
                    <span>–</span>
                )}
            </div>

            <div className="col vendor">
                {r.vendorName || "–"}
            </div>

            <div className="col date">
                {new Date(r.createdAt).toLocaleDateString()}
            </div>

            <div className="col total">
                {r.totalAmount} {r.currency}
            </div>

            <div className="col category">
                {r.category || "–"}
            </div>

            <div className="col payment">
                {r.paymentMethod || "–"}
            </div>

            <div className="col saved-dot-col">
                <span className={`saved-dot ${r.saved ? "active" : ""}`}></span>
            </div>
        </div>
    );
}