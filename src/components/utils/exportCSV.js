export const exportReceiptsCSV = (receipts, ocrDataMap) => {
    if (!receipts || !receipts.length) return;

    const headers = [
        "Datum",
        "Leverantör",
        "Kategori",
        "Betalmetod",
        "Valuta",
        "Kvittonummer",
        "Noteringar",
        "Artikelnamn",
        "Antal",
        "Enhetspris",
        "Totalpris",
        "Moms"
    ];

    const rows = [];

    receipts.forEach(r => {
        const data = ocrDataMap[r.id] || {};
        const items = data.items && data.items.length ? data.items : [{ itemName: "", itemQuantity: 1, itemUnitPrice: 0, itemTotalPrice: 0 }];

        items.forEach(item => {
            rows.push([
                new Date(r.createdAt).toLocaleDateString(),
                data.vendorName || "",
                data.category || "",
                data.paymentMethod || "",
                data.currency || "SEK",
                data.receiptNumber || "",
                data.notes || "",
                item.itemName || "",
                item.itemQuantity ?? "",
                item.itemUnitPrice ?? "",
                item.itemTotalPrice ?? "",
                item.itemTax ?? ""
            ]);
        });
    });

    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(val => `"${val}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "bokforing_kvitton.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};