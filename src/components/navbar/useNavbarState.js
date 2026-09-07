import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const HIDDEN_PATHS = ["/login", "/register"];

export default function useNavbarState() {
    const [searchQuery, setSearchQuery] = useState("");
    const { isLoggedIn, isAdmin, user } = useAuth();
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        if (!trimmed) return;
        navigate(`/explore?search=${encodeURIComponent(trimmed)}`);
    };

    return {
        searchQuery,
        setSearchQuery,
        handleSearchSubmit,

        isLoggedIn,
        isAdmin,
        user,
        isSeller: user?.role === "seller",

        isHidden: HIDDEN_PATHS.includes(pathname),
        isAdminPage: pathname.startsWith("/users"),
        isSellerPage: pathname.startsWith("/seller"),
        homePath: isLoggedIn ? "/explore" : "/",
    };
}