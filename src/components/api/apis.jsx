const API_BASE = "http://localhost:8080";

function getToken() {
    return localStorage.getItem("jwt") || sessionStorage.getItem("jwt");
}

//********************AuthController********************//

export async function registerUser(email, password) {
    const response = await fetch(
        `${API_BASE}/AuthController/register`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        }
    );
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Registration failed");
    }
    return;
}

export async function resendCode(email) {
    const res = await fetch(`${API_BASE}/AuthController/resend-code?email=${encodeURIComponent(email)}`, {
        method: "POST"
    });
    if (!res.ok) {
        const text = await res.text().catch(() => "Failed to resend code");
        throw new Error(text);
    }
}

export async function verifyUser(email, code) {
    const response = await fetch(`${API_BASE}/AuthController/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
    });
    if (!response.ok) {
        const text = await response.text().catch(() => "Verification failed");
        throw new Error(text);
    }
    return;
}

//********************HistoryController********************//

export async function fetchHistoryReceipts() {
    const token = getToken();
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_BASE}/HistoryController/history`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!res.ok) {
        throw new Error("Unauthorized");
    }
    return res.json();
}

export async function fetchHistoryReceiptFile(receiptId) {
    const token = getToken();
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_BASE}/HistoryController/receipts/${receiptId}/images`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error("Failed to fetch image");
    const blob = await res.blob();
    return new File([blob], `receipt-${receiptId}.jpg`, { type: blob.type });
}

export async function deleteHistoryReceipt(receiptId) {
    const token = getToken();
    if (!token) throw new Error("No token");
    const res = await fetch(
        `${API_BASE}/HistoryController/${receiptId}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    if (!res.ok) {
        throw new Error("Failed to delete receipt");
    }
}

export async function fetchHistoryReceiptImage(receiptId) {
    const token = getToken();
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_BASE}/HistoryController/receipts/${receiptId}/images`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
}

//********************LoginController********************//

export async function loginUser({ email, password, rememberMe }) {
    const response = await fetch(`${API_BASE}/LoginController/authenticate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
    });
    if (!response.ok) {
        throw new Error("Invalid credentials");
    }
    return response.json();
}

//********************SavingsController********************//

export async function fetchSavedReceipts() {
    const token = getToken();
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_BASE}/SavingsController`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!res.ok) {
        throw new Error("Unauthorized");
    }
    return res.json();
}

export async function fetchReceiptImage(receiptId) {
    const token = getToken();
    if (!token) throw new Error("No token");
    const res = await fetch(
        `${API_BASE}/SavingsController/images/${receiptId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    );
    if (!res.ok) return null;
    const blob = await res.blob();
    return URL.createObjectURL(blob);
}

export async function saveReceipt(receiptId, editableReceipt) {
    const token = getToken();
    if (!token) throw new Error("No token");
    const res1 = await fetch(`${API_BASE}/SavingsController/${receiptId}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!res1.ok) throw new Error("Failed to save receipt image");
    const savedReceiptId = await res1.json();
    const res2 = await fetch(`${API_BASE}/SavingsController/save-info/${savedReceiptId}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(editableReceipt)
    });
    if (!res2.ok) throw new Error("Failed to save receipt info");
}

export async function saveReceiptInfo(savedReceiptId, editableReceipt) {
    const token = getToken();
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_BASE}/SavingsController/save-info/${savedReceiptId}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(editableReceipt)
    });
    if (!res.ok) throw new Error("Failed to save receipt info");
}

export async function fetchSavedReceiptData(receiptId) {
    const token = getToken();
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_BASE}/SavingsController/${receiptId}/info`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error("Failed to fetch saved receipt info");
    return res.json();
}

export async function deleteSavedReceipt(receiptId) {
    const token = getToken();
    if (!token) throw new Error("No token");
    const res = await fetch(`${API_BASE}/SavingsController/${receiptId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!res.ok) {
        throw new Error("Failed to delete saved receipt");
    }
}

//********************ScanController********************//

export async function uploadReceipt(file) {
    const token = getToken();
    if (!token) throw new Error("No token");
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_BASE}/ScanController/upload`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });
    if (!response.ok) {
        throw new Error("Upload failed");
    }
    return response.json();
}

export async function fetchUserInfo() {
    const token = getToken();
    if (!token) {
        throw new Error("No token");
    }
    const response = await fetch(`${API_BASE}/ScanController/skanna`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error("Unauthorized");
    }
    return response.json();
}

export async function rescanReceipt(receiptId, file) {
    const token = getToken();
    if (!token) throw new Error("No token");
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_BASE}/ScanController/rescan/${receiptId}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        },
        body: formData
    });
    if (!response.ok) {
        throw new Error("Rescan failed");
    }
    return response.json();
}

//********************StatisticsController********************//

export async function fetchStatistics() {
    const token = getToken();
    const res = await fetch(`${API_BASE}/StatisticsController/detailed`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch statistics");
    return await res.json();
}