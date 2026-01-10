import React from "react";

export default function HistoryListHeader() {
    return (
        <div className="history-list-header">
            <div className="col image">Bild</div>
            <div className="col vendor">Namn</div>
            <div className="col date">Datum</div>
            <div className="col total">Total</div>
            <div className="col category">Kategori</div>
            <div className="col payment">Betalsätt</div>
        </div>
    );
}