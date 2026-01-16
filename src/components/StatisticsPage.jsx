import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchStatistics } from "./api/apis";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import "./style/AppLayout.css";
import "./style/pages/StatisticsPage.css";
import { Cell } from "recharts";
import receiptsIcon from "./icons/receipt.png";
import historyIcon from "./icons/history.png";
import statsIcon from "./icons/analytics.png";
import receiptsHeaderIcon from "./icons/title-icon.png";

const COLORS = [
    "#82ca9d", "#8884d8", "#ffc658", "#d0ed57", "#a4de6c",
    "#8dd1e1", "#83a6ed", "#8a79d3", "#d88884", "#f68c42",
    "#42f69e", "#f54291", "#42caff"
];

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

function StatisticsPage() {
    const navigate = useNavigate();
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await fetchStatistics();
                setReceipts(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    const totalAmount = receipts.reduce((sum, r) => sum + (r.totalAmount ?? 0), 0);
    const totalVat = receipts.reduce((sum, r) => sum + (r.vatAmount ?? 0), 0);
    const totalItems = receipts.reduce(
        (sum, r) => sum + r.items.reduce((iSum, item) => iSum + (item.itemQuantity ?? 0), 0),
        0
    );
    const avgAmount = receipts.length ? totalAmount / receipts.length : 0;
    const biggestReceipt = receipts.length
        ? receipts.reduce((max, r) => (r.totalAmount ?? 0) > (max.totalAmount ?? 0) ? r : max, receipts[0])
        : { totalAmount: 0, vendorName: "–" };
    const smallestReceipt = receipts.length
        ? receipts.reduce((min, r) => (r.totalAmount ?? 0) < (min.totalAmount ?? 0) ? r : min, receipts[0])
        : { totalAmount: 0, vendorName: "–" };

    const vendorCounts = {};
    receipts.forEach(r => {
        const name = r.vendorName || "Okänd";
        vendorCounts[name] = (vendorCounts[name] || 0) + 1;
    });
    const mostFrequentVendor = Object.entries(vendorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "–";
    const barDataVendors = receipts.map(r => ({ name: r.vendorName ?? "Okänd", total: r.totalAmount ?? 0 }));

    const normalizedReceipts = receipts.map(r => ({
        ...r,
        category: r.category && r.category !== "undefined" ? r.category : "Okänd"
    }));

    const categoryTotals = CATEGORIES.concat("Okänd").map(cat => ({
        name: cat,
        total: normalizedReceipts
            .filter(r => r.category === cat)
            .reduce((sum, r) => sum + (r.totalAmount ?? 0), 0)
    }));

    return (
        <div className="page-wrapper">
            <aside className="sidebar">
                <h1 className="sidebar-title">
                    <img src={receiptsHeaderIcon} alt="Huskvitton" className="sidebar-header-icon" />
                    Huskvitton
                </h1>
                <div className="sidebar-divider"></div>
                <nav className="sidebar-nav">
                    <div className="sidebar-item" onClick={() => navigate("/kvitton")}>
                        <img src={receiptsIcon} alt="Kvitton" className="sidebar-icon" />
                        Kvitton
                    </div>
                    <div className="sidebar-item" onClick={() => navigate("/historik")}>
                        <img src={historyIcon} alt="Historik" className="sidebar-icon" />
                        Historik
                    </div>
                    <div className="sidebar-item active" onClick={() => navigate("/statistik")}>
                        <img src={statsIcon} alt="Statistik" className="sidebar-icon" />
                        Statistik
                    </div>
                </nav>
            </aside>

                <div className="page-content">
                    {loading ? (
                        <p className="loading">Laddar statistik...</p>
                    ) : (
                        <div className="statistics">
                            <p><strong>Antal sparade kvitton:</strong> {receipts.length}</p>
                            <p><strong>Total summa:</strong> {totalAmount.toFixed(2)} SEK</p>
                            <p><strong>Totalt moms:</strong> {totalVat.toFixed(2)} SEK</p>
                            <p><strong>Genomsnitt per kvitto:</strong> {avgAmount.toFixed(2)} SEK</p>
                            <p><strong>Största kvitto:</strong> {biggestReceipt.totalAmount.toFixed(2)} SEK ({biggestReceipt.vendorName})</p>
                            <p><strong>Minsta kvitto:</strong> {smallestReceipt.totalAmount.toFixed(2)} SEK ({smallestReceipt.vendorName})</p>
                            <p><strong>Vanligaste leverantör:</strong> {mostFrequentVendor}</p>
                            <p><strong>Totalt antal artiklar:</strong> {totalItems}</p>

                            <h3>Total per leverantör</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={barDataVendors}>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="total" fill="#8884d8" />
                                </BarChart>
                            </ResponsiveContainer>

                            <h3>Total per kategori</h3>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart
                                    data={categoryTotals}
                                    layout="vertical"
                                    margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                                >
                                    <XAxis type="number" />
                                    <YAxis type="category" dataKey="name" />
                                    <Tooltip />
                                    <Bar dataKey="total" minPointSize={5}>
                                        {categoryTotals.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>
        </div>
    );
}

export default StatisticsPage;