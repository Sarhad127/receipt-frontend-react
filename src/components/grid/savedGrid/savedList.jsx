import React from "react";

export default function SavedList({ r, image, ocrData, onExpand }) {
    return (
        <div className="history-list-row">
            <div className="col image">
                {image ? (
                    <>
                        <img src={image} alt="Kvitto" className="list-image" />
                        <button
                            className="expand-pil-list"
                            onClick={(e) => {
                                e.stopPropagation();
                                onExpand?.(r.id);
                            }}
                            title="Förstora"
                        >
                            ⤢
                        </button>
                    </>
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
                    ? `${Number(ocrData.totalAmount).toFixed(2)} kr`
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