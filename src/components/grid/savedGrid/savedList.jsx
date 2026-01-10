import React from "react";

export default function SavedList({ r, image, ocrData }) {
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
                {ocrData?.vendorName || "–"}
            </div>

            <div className="col date">
                {new Date(r.createdAt).toLocaleDateString()}
            </div>

            <div className="col total">
                {ocrData?.totalAmount !== undefined
                    ? `${ocrData.totalAmount} kr`
                    : "–"}
            </div>

            <div className="col category">
                {ocrData?.category || "–"}
            </div>

            <div className="col payment">
                {ocrData?.paymentMethod || "–"}
            </div>
        </div>
    );
}