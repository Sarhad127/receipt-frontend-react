import React from "react";
import './PageHeader.css'

const CATEGORIES = [
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
];

function PageHeader({
                                       searchTerm,
                                       setSearchTerm,
                                       quickDate,
                                       setQuickDate,
                                       fromDate,
                                       setFromDate,
                                       toDate,
                                       setToDate,
                                       layout,
                                       setLayout,
                                       filtersOpen,
                                       setFiltersOpen,
                                       selectedCategories,
                                       setSelectedCategories,
                                       minAmount,
                                       setMinAmount,
                                       maxAmount,
                                       setMaxAmount
                                   }) {
    const toggleCategory = (category) => {
        if (category === "Alla") {
            setSelectedCategories([]);
            return;
        }

        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    return (
        <div className={`page-header ${filtersOpen ? "expanded" : ""}`}>
            <div className="page-header-row">
                <div className="search-input-wrapper">
                    <div className="search-input-inner">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="receipt-search"
                            placeholder="Sök butik, artikel, betalning..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="quick-date-filter">
                    <select
                        value={quickDate}
                        onChange={(e) => {
                            setQuickDate(e.target.value);
                            setFromDate("");
                            setToDate("");
                        }}
                    >
                        <option value="">Välj…</option>
                        <option value="today">Idag</option>
                        <option value="7days">Senaste 7 dagarna</option>
                        <option value="thisMonth">Denna månad</option>
                        <option value="lastMonth">Förra månaden</option>
                    </select>
                </div>

                <div className="date-filter">
                    <div className="date-input">
                        <label>Från</label>
                        <input
                            type="date"
                            value={fromDate}
                            onChange={e => {
                                setFromDate(e.target.value);
                                setQuickDate("");
                            }}
                        />
                    </div>
                    <div className="date-input">
                        <label>Till</label>
                        <input
                            type="date"
                            value={toDate}
                            onChange={e => {
                                setToDate(e.target.value);
                                setQuickDate("");
                            }}
                        />
                    </div>
                </div>

                <div className="layout-switcher">
                    <button
                        className={`switch-btn ${layout === "grid" ? "active" : ""}`}
                        onClick={() => setLayout("grid")}
                    >
                        <div className="grid-icon">
                            <span></span><span></span>
                            <span></span><span></span>
                        </div>
                    </button>

                    <button
                        className={`switch-btn ${layout === "list" ? "active" : ""}`}
                        onClick={() => setLayout("list")}
                    >
                        <div className="list-icon">
                            <span></span><span></span><span></span>
                        </div>
                    </button>
                </div>
            </div>

            <div
                className="filter-divider"
                onClick={() => setFiltersOpen(prev => !prev)}
            >
                <span className={`filter-chevron ${filtersOpen ? "open" : ""}`}>
                    ▼
                </span>
            </div>

            <div className="advanced-filters">
                <div className="advanced-filter-group">
                    <div className="advanced-filter-title">Kategori</div>
                    <div className="category-grid">
                        {CATEGORIES.map(cat => {
                            const isAll = cat === "Alla";
                            const checked = isAll
                                ? selectedCategories.length === 0
                                : selectedCategories.includes(cat);

                            return (
                                <label key={cat} className="category-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggleCategory(cat)}
                                    />
                                    <span>{cat}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                <div className="advanced-filter-group">
                    <div className="advanced-filter-title">Belopp (kr)</div>
                    <div className="amount-range">
                        <input
                            type="number"
                            placeholder="Min"
                            value={minAmount}
                            onChange={e => setMinAmount(e.target.value)}
                        />
                        <span className="range-separator">–</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={maxAmount}
                            onChange={e => setMaxAmount(e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

const getQuickDateRange = (quickDate) => {
    const now = new Date();
    let from = null;
    let to = null;

    switch (quickDate) {
        case "today":
            from = new Date(now); from.setHours(0,0,0,0);
            to = new Date(now); to.setHours(23,59,59,999);
            break;
        case "7days":
            from = new Date(now); from.setDate(now.getDate() - 6); from.setHours(0,0,0,0);
            to = new Date(now); to.setHours(23,59,59,999);
            break;
        case "thisMonth":
            from = new Date(now.getFullYear(), now.getMonth(), 1);
            to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23,59,59,999);
            break;
        case "lastMonth":
            from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            to = new Date(now.getFullYear(), now.getMonth(), 0, 23,59,59,999);
            break;
        default:
            break;
    }

    return { from, to };
};

const filterReceipts = ({
                                   receipts,
                                   ocrDataMap,
                                   searchTerm,
                                   fromDate,
                                   toDate,
                                   quickDate,
                                   selectedCategories,
                                   minAmount,
                                   maxAmount
                               }) => {
    const minAmountNum = minAmount ? parseFloat(minAmount) : null;
    const maxAmountNum = maxAmount ? parseFloat(maxAmount) : null;

    const matchesSearch = (ocr, term) => {
        if (!term) return true;
        const q = term.toLowerCase().trim();
        const matchesText = (text) => text?.toString().toLowerCase().includes(q);

        const matchesVendor = [
            ocr.vendorName,
            ocr.vendorAddress,
            ocr.paymentMethod,
            ocr.vendorOrgNumber,
            ocr.receiptNumber,
            ocr.totalAmount,
            ocr.vatAmount
        ].some(matchesText);

        const matchesItems = ocr.items?.some(item =>
            Object.values(item).some(matchesText)
        );

        return matchesVendor || matchesItems;
    };

    const matchesDate = (receiptDate) => {
        const date = new Date(receiptDate);
        date.setHours(12, 0, 0, 0);

        if (quickDate) {
            const { from, to } = getQuickDateRange(quickDate);
            if ((from && date < from) || (to && date > to)) return false;
        }

        if (fromDate) {
            const from = new Date(fromDate + "T00:00:00");
            if (date < from) return false;
        }

        if (toDate) {
            const to = new Date(toDate + "T23:59:59.999");
            if (date > to) return false;
        }

        return true;
    };

    const matchesCategory = (category) => {
        if (!selectedCategories || selectedCategories.length === 0) return true;
        return selectedCategories.includes(category);
    };

    const matchesAmount = (amount) => {
        if (minAmountNum !== null && amount < minAmountNum) return false;
        if (maxAmountNum !== null && amount > maxAmountNum) return false;
        return true;
    };

    return receipts.filter(r => {
        const ocr = ocrDataMap ? ocrDataMap[r.id] : r;
        if (!ocr) return false;

        return (
            matchesSearch(ocr, searchTerm) &&
            matchesDate(r.createdAt) &&
            matchesCategory(r.category) &&
            matchesAmount(ocr.totalAmount || 0)
        );
    });
};

export default PageHeader;
// eslint-disable-next-line react-refresh/only-export-components
export { filterReceipts };