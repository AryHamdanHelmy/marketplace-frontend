import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logoImage from "../assets/logo.png";
import { Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";
import { useAuth } from "../context/AuthContext";
import { Search, User, ShoppingCart, ChevronDown, Menu, X } from "lucide-react";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "./ui/input-group";

export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const { isLoggedIn, isAdmin, user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const isMovePage = ["/login", "/register"].includes(location.pathname);
    const isAdminPage = location.pathname.startsWith("/users");
    const isSeller = user?.role === "seller";
    const isSellerPage = location.pathname.startsWith("/seller");

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    if (isMovePage || location.pathname === "/cart") return null;

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        if (!trimmed) return;
        navigate(`/explore?search=${encodeURIComponent(trimmed)}`);
        setMenuOpen(false);
    };

    return (
        <header className="w-full fixed top-0 z-50 bg-white border-b border-gray-200 shadow-sm">

            {/* Top utility bar — desktop only */}
            <div className="hidden md:flex justify-end px-8 py-1 bg-gray-50 text-[11px] text-gray-500 gap-4 border-b border-gray-100">
                <a href="/seller/dashboard" className="hover:text-darkblue transition">Seller Centre</a>
                <a href="#" className="hover:text-darkblue transition">Help</a>
                {isLoggedIn && (
                    <span className="text-gray-400">Hi, {user.name}</span>
                )}
            </div>

            {/* Main nav */}
            <div className="flex items-center justify-between gap-3 px-5 py-3 md:px-8 md:py-2.5">

                {/* Logo */}
                <Link
                    to={isLoggedIn ? "/explore" : "/"}
                    onClick={() => setMenuOpen(false)}
                    className="text-xl font-bold text-darkblue shrink-0 tracking-tight"
                >
                    DibiTech
                </Link>

                {/* Search bar — desktop */}
                <form
                    onSubmit={handleSearchSubmit}
                    className="hidden md:block flex-1 max-w-lg"
                >
                    <InputGroup>
                        <InputGroupInput
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <InputGroupAddon>
                            <button type="submit" aria-label="Search" className="flex items-center">
                                <Search size={15} />
                            </button>
                        </InputGroupAddon>
                    </InputGroup>
                </form>

                {/* Search bar — mobile */}
                <form
                    onSubmit={handleSearchSubmit}
                    className="md:hidden flex-1 min-w-0"
                >
                    <InputGroup>
                        <InputGroupInput
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <InputGroupAddon>
                            <button type="submit" aria-label="Search" className="flex items-center">
                                <Search size={14} />
                            </button>
                        </InputGroupAddon>
                    </InputGroup>
                </form>

                {/* Desktop right actions */}
                <div className="hidden md:flex items-center gap-5 border-l border-gray-200 pl-5">

                    {/* Cart */}
                    {!isAdminPage && (
                        <Link
                            to="/cart"
                            className="relative flex flex-col items-center text-gray-500 hover:text-darkblue transition"
                        >
                            <ShoppingCart size={20} />
                        </Link>
                    )}

                    {/* Nav links */}
                    {!isAdminPage && (
                        <Link
                            to="/explore"
                            className="text-sm text-gray-600 hover:text-darkblue font-medium transition"
                        >
                            Explore
                        </Link>
                    )}

                    {isAdmin && (
                        <Link
                            to="/users"
                            className={`text-sm font-medium transition ${isAdminPage ? "text-pastel-blue font-semibold" : "text-gray-600 hover:text-darkblue"}`}
                        >
                            Manage Users
                        </Link>
                    )}

                    {isSeller && (
                        <Link
                            to="/seller/dashboard"
                            className={`text-sm font-medium transition ${isSellerPage ? "text-pastel-blue font-semibold" : "text-gray-600 hover:text-darkblue"}`}
                        >
                            Seller Center
                        </Link>
                    )}

                    {/* Account dropdown */}
                    {isLoggedIn ? (
                        <div className="relative group">
                            <button
                                type="button"
                                className="flex items-center gap-1.5 text-gray-600 hover:text-darkblue transition"
                            >
                                <div className="w-8 h-8 rounded-full bg-darkblue/10 flex items-center justify-center">
                                    <User size={16} className="text-darkblue" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm text-gray-400 leading-none">Account</p>
                                </div>
                                <ChevronDown size={14} className="text-gray-400" />
                            </button>

                            {/* Dropdown */}
                            <div className="absolute right-0 top-full pt-2 hidden group-hover:block z-50">
                                <div className="w-72 bg-white text-gray-900 rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                                    {/* User info */}
                                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 border-b border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-darkblue/10 flex items-center justify-center text-darkblue shrink-0">
                                            <User size={18} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-darkblue text-sm truncate">{user.name}</p>
                                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                        </div>
                                        <LogoutButton
                                            label="Sign Out"
                                            className="text-red-400 text-xs font-medium hover:text-red-500 shrink-0 transition"
                                        />
                                    </div>

                                    {/* Menu items */}
                                    <div className="px-2 py-2">
                                        {isAdmin && (
                                            <Link to="/users" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-darkblue transition">
                                                Manage Users
                                            </Link>
                                        )}
                                        {isSeller && (
                                            <Link to="/seller/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-darkblue transition">
                                                Seller Center
                                            </Link>
                                        )}
                                        <Link to="/explore" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-darkblue transition">
                                            Explore Products
                                        </Link>
                                        <Link to="/cart" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-darkblue transition">
                                            My Cart
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="flex flex-col items-center text-gray-500 hover:text-darkblue transition"
                        >
                            <User size={20} />
                            <span className="text-[10px] mt-0.5">Sign In</span>
                        </Link>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button
                    className="md:hidden p-1 shrink-0 text-darkblue"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    {menuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile dropdown */}
            {!isMovePage && menuOpen && (
                <nav className="md:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-lg z-50 flex flex-col">
                    <div className="flex flex-col px-5 py-3 gap-1">
                        {!isAdminPage && (
                            <>
                                <Link
                                    to="/explore"
                                    onClick={() => setMenuOpen(false)}
                                    className="py-2.5 text-sm text-gray-700 hover:text-darkblue font-medium border-b border-gray-50 transition"
                                >
                                    Explore Products
                                </Link>
                                <Link
                                    to="/cart"
                                    onClick={() => setMenuOpen(false)}
                                    className="py-2.5 text-sm text-gray-700 hover:text-darkblue font-medium border-b border-gray-50 transition flex items-center gap-2"
                                >
                                    <ShoppingCart size={16} /> Cart
                                </Link>
                            </>
                        )}
                        {isAdmin && (
                            <Link
                                to="/users"
                                onClick={() => setMenuOpen(false)}
                                className={`py-2.5 text-sm font-medium border-b border-gray-50 transition ${isAdminPage ? "text-pastel-blue" : "text-gray-700 hover:text-darkblue"}`}
                            >
                                Manage Users
                            </Link>
                        )}
                        {isSeller && (
                            <Link
                                to="/seller/dashboard"
                                onClick={() => setMenuOpen(false)}
                                className={`py-2.5 text-sm font-medium border-b border-gray-50 transition ${isSellerPage ? "text-pastel-blue" : "text-gray-700 hover:text-darkblue"}`}
                            >
                                Seller Center
                            </Link>
                        )}
                    </div>

                    {/* Mobile account section */}
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                        {isLoggedIn ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-darkblue/10 flex items-center justify-center">
                                        <User size={15} className="text-darkblue" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-darkblue">{user.name}</p>
                                        <p className="text-[10px] text-gray-400">{user.email}</p>
                                    </div>
                                </div>
                                <LogoutButton
                                    onClick={() => setMenuOpen(false)}
                                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-darkblue hover:bg-darkblue/90 transition"
                                />
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                onClick={() => setMenuOpen(false)}
                                className="block w-full text-center py-2.5 rounded-lg text-sm font-semibold text-white bg-darkblue hover:bg-darkblue/90 transition"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </nav>
            )}
        </header>
    );
}