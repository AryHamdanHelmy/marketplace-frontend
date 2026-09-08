import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiRequest } from "../api/Client";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { isLoggedIn } = useAuth();
    const [count, setCount] = useState(0);

    const refresh = useCallback(async () => {
        if (!isLoggedIn) {
            setCount(0);
            return;
        }
        try {
            const res = await apiRequest("/cart");
            setCount(res.data?.length || 0);
        } catch {
            // Diamkan — badge bukan info kritis, jangan sampai bikin UI error
        }
    }, [isLoggedIn]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    // Naikkan angka duluan biar badge kerasa instan,
    // lalu sinkronkan dengan server di belakang layar
    const bump = () => {
        setCount((prev) => prev + 1);
        refresh();
    };

    return (
        <CartContext.Provider value={{ count, refresh, bump }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart harus dipakai di dalam CartProvider");
    return ctx;
}