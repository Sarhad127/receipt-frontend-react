export const loadTheme = () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
};

export const toggleTheme = () => {
    const currentTheme =
        document.documentElement.getAttribute("data-theme") || "light";

    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
};