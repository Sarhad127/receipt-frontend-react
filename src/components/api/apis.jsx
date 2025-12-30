const API_BASE = "http://localhost:8080";

function getToken() {
    return localStorage.getItem("jwt") || sessionStorage.getItem("jwt");
}

export async function fetchSavedReceipts() {
    const token = getToken();
    if (!token) throw new Error("No token");

    const res = await fetch(`${API_BASE}/savings`, {
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
        `${API_BASE}/savings/images/${receiptId}`,
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

export async function uploadReceipt(file) {
    const token = getToken();
    if (!token) throw new Error("No token");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/upload`, {
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

    const response = await fetch(`${API_BASE}/skanna`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!response.ok) {
        throw new Error("Unauthorized");
    }

    return response.json();
}

export async function registerUser(username, password) {
    const response = await fetch(
        `${API_BASE}/register/user`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        }
    );

    if (!response.ok) {
        throw new Error("Registration failed");
    }

    return response.json();
}

export async function loginUser(username, password) {
    const response = await fetch(`${API_BASE}/authenticate`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        throw new Error("Invalid credentials");
    }

    return response.json();
}

export async function fetchHistoryReceipts() {
    const token = getToken();
    if (!token) throw new Error("No token");

    const res = await fetch(`${API_BASE}/history`, {
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

    const res = await fetch(`${API_BASE}/receipts/${receiptId}/image`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!res.ok) throw new Error("Failed to fetch image");

    const blob = await res.blob();
    return new File([blob], `receipt-${receiptId}.jpg`, { type: blob.type });
}

export async function saveReceipt(receiptId, editableReceipt) {
    const token = getToken();
    if (!token) throw new Error("No token");

    const res1 = await fetch(`${API_BASE}/savings/${receiptId}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!res1.ok) throw new Error("Failed to save receipt image");
    const savedReceiptId = await res1.json();

    const res2 = await fetch(`${API_BASE}/savings/save-info/${savedReceiptId}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(editableReceipt)
    });

    if (!res2.ok) throw new Error("Failed to save receipt info");
}

export async function deleteHistoryReceipt(receiptId) {
    const token = getToken();
    if (!token) throw new Error("No token");

    const res = await fetch(
        `${API_BASE}/history/${receiptId}`,
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

export async function rescanReceipt(receiptId, file) {
    const token = getToken();
    if (!token) throw new Error("No token");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/rescan/${receiptId}`, {
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

export async function fetchHistoryReceiptImage(receiptId) {
    const token = getToken();
    if (!token) throw new Error("No token");

    const res = await fetch(`${API_BASE}/receipts/${receiptId}/image`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return null;

    const blob = await res.blob();
    return URL.createObjectURL(blob);
}

export async function fetchSavedReceiptData(receiptId) {
    const token = getToken();
    if (!token) throw new Error("No token");

    const res = await fetch(`${API_BASE}/savings/${receiptId}/info`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    if (!res.ok) throw new Error("Failed to fetch saved receipt info");

    return res.json();
}