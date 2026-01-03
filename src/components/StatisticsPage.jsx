import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchStatistics } from "./api/apis";
import { BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
import "./style/AppLayout.css";
import "./style/pages/StatisticsPage.css";

function StatisticsPage() {
    const navigate = useNavigate();
    const [receipts, setReceipts] = useState([]);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await fetchStatistics();
                setReceipts(data);
            } catch (err) {
                console.error(err);
                alert("Kunde inte hämta statistik");
            }
        };
        loadStats();
    }, []);

    if (!receipts.length) {
        return (
            <div className="page-wrapper">
                <div className="page-tabs">
                    <button className="tab" onClick={() => navigate("/skanna")}>Skanna</button>
                    <button className="tab" onClick={() => navigate("/historik")}>Historik</button>
                    <button className="tab" onClick={() => navigate("/sparade")}>Sparade</button>
                    <button className="tab active">Statistik</button>
                    <button className="tab" onClick={() => navigate("/installningar")}>Inställningar</button>
                </div>
                <div className="page-container">
                    <div className="page-content">
                        <p>Laddar statistik...</p>
                    </div>
                </div>
            </div>
        );
    }

    const totalAmount = receipts.reduce((sum, r) => sum + (r.totalAmount ?? 0), 0);
    const totalVat = receipts.reduce((sum, r) => sum + (r.vatAmount ?? 0), 0);
    const totalItems = receipts.reduce((sum, r) => sum + r.items.reduce((iSum, item) => iSum + (item.itemQuantity ?? 0), 0), 0);
    const avgAmount = receipts.length ? totalAmount / receipts.length : 0;

    const biggestReceipt = receipts.reduce((max, r) => (r.totalAmount ?? 0) > (max.totalAmount ?? 0) ? r : max, receipts[0]);
    const smallestReceipt = receipts.reduce((min, r) => (r.totalAmount ?? 0) < (min.totalAmount ?? 0) ? r : min, receipts[0]);

    const vendorCounts = {};
    receipts.forEach(r => {
        const name = r.vendorName || "Okänd";
        vendorCounts[name] = (vendorCounts[name] || 0) + 1;
    });
    const mostFrequentVendor = Object.entries(vendorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "–";

    const barData = receipts.map(r => ({ name: r.vendorName ?? "Okänd", total: r.totalAmount ?? 0 }));
    const pieData = Object.entries(vendorCounts).map(([name, count]) => ({ name, value: count }));
    const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#8dd1e1", "#a4de6c", "#d0ed57"];

    return (
        <div className="page-wrapper">
            <div className="page-tabs">
                <button className="tab" onClick={() => navigate("/skanna")}>Skanna</button>
                <button className="tab" onClick={() => navigate("/historik")}>Historik</button>
                <button className="tab" onClick={() => navigate("/sparade")}>Sparade</button>
                <button className="tab active">Statistik</button>
                <button className="tab" onClick={() => navigate("/installningar")}>Inställningar</button>
            </div>

            <div className="page-container">
                <div className="page-content">
                    <div className="statistics">
                        <p><strong>Antal sparade kvitton:</strong> {receipts.length}</p>
                        <p><strong>Total summa:</strong> {totalAmount.toFixed(2)} SEK</p>
                        <p><strong>Totalt moms:</strong> {totalVat.toFixed(2)} SEK</p>
                        <p><strong>Genomsnitt per kvitto:</strong> {avgAmount.toFixed(2)} SEK</p>
                        <p><strong>Största kvitto:</strong> {(biggestReceipt.totalAmount ?? 0).toFixed(2)} SEK ({biggestReceipt.vendorName})</p>
                        <p><strong>Minsta kvitto:</strong> {(smallestReceipt.totalAmount ?? 0).toFixed(2)} SEK ({smallestReceipt.vendorName})</p>
                        <p><strong>Vanligaste leverantör:</strong> {mostFrequentVendor}</p>
                        <p><strong>Totalt antal artiklar:</strong> {totalItems}</p>

                        <h3>Stapeldiagram: Total per leverantör</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={barData}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="total" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>

                        <h3>Pajdiagram: Kvitto per leverantör</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default StatisticsPage;