import { createContext, useContext, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

const SellerNavContext = createContext(null);

export function SellerNavProvider({ children }) {
    const [open, setOpen] = useState(false);
    const { pathname } = useLocation();

    // Tutup drawer tiap pindah halaman
    useEffect(() => {
        setOpen(false);
    }, [pathname]);

    // Tutup dengan Escape
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const value = {
        open,
        close: () => setOpen(false),
        toggle: () => setOpen((prev) => !prev),
    };

    return (
        <SellerNavContext.Provider value={value}>
            {children}
        </SellerNavContext.Provider>
    );
}

export function useSellerNav() {
    const ctx = useContext(SellerNavContext);
    if (!ctx) throw new Error("useSellerNav harus dipakai di dalam SellerNavProvider");
    return ctx;
}