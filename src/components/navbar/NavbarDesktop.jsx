import { useState, useEffect, useRef } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
    Search, User, ShoppingCart, ChevronDown, Store, Receipt,
    Shield, Wallet, Settings, LogIn,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import logoImage from "../../assets/rapaku.png";
import LogoutButton from "../LogoutButton";

const NAV_LINKS = [
    { to: "/", label: "Home", end: true },
    { to: "/explore", label: "Explore" },
];

const ADMIN_LINKS = [
    { to: "/users",             label: "Users",       icon: User },
    { to: "/admin/products",    label: "Products",    icon: Store },
    { to: "/admin/categories",  label: "Categories",  icon: Settings },
    { to: "/admin/withdrawals", label: "Withdrawals", icon: Wallet },
];

const SELLER_LINKS = [
    { to: "/seller/dashboard", label: "Seller Center", icon: Store },
    { to: "/seller/orders",    label: "Incoming orders", icon: Receipt },
    { to: "/seller/balance",   label: "Balance",       icon: Wallet },
    { to: "/seller/store",     label: "Shop settings", icon: Settings },
];

const dropdownItem =
    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-textSecondary hover:bg-ink-100 hover:text-textPrimary transition";

export default function NavbarDesktop({
    searchQuery,
    setSearchQuery,
    handleSearchSubmit,
    isLoggedIn,
    isAdmin,
    isSeller,
    user,
    homePath,
}) {
    const { count } = useCart();
    const { pathname } = useLocation();

    const [accountOpen, setAccountOpen] = useState(false);
    const accountRef = useRef(null);

    // Close on navigation, on Escape, and on any click outside — a dropdown
    // that only closes when you click the trigger again feels broken.
    useEffect(() => {
        setAccountOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!accountOpen) return;

        const onClick = (e) => {
            if (accountRef.current && !accountRef.current.contains(e.target)) {
                setAccountOpen(false);
            }
        };
        const onKey = (e) => {
            if (e.key === "Escape") setAccountOpen(false);
        };

        document.addEventListener("mousedown", onClick);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("keydown", onKey);
        };
    }, [accountOpen]);

    const roleLinks = isAdmin ? ADMIN_LINKS : isSeller ? SELLER_LINKS : [];

    return (
        <header className="w-full fixed top-0 z-50 bg-surface border-b border-line">

            {/* Utility bar */}
            <div className="flex items-center justify-between px-8 py-1.5 bg-surfaceAlt border-b border-line text-xs text-textSecondary">
                <span className="inline-flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Payment held until you confirm delivery
                </span>

                <div className="flex items-center gap-4">
                    {isSeller && (
                        <Link
                            to="/seller/dashboard"
                            className="hover:text-textPrimary transition"
                        >
                            Seller Center
                        </Link>
                    )}
                    {isAdmin && (
                        <Link to="/users" className="hover:text-textPrimary transition">
                            Admin
                        </Link>
                    )}
                    <Link to="/explore" className="hover:text-textPrimary transition">
                        Help
                    </Link>
                    {isLoggedIn && (
                        <span className="text-textMuted">Hi, {user?.name}</span>
                    )}
                </div>
            </div>

            {/* Main bar */}
            <div className="flex items-center gap-6 px-8 py-1">

                <Link to={homePath} className="shrink-0">
                    <img src={logoImage} alt="Rapaku" className="w-auto h-7" />
                </Link>

                <nav className="flex items-center gap-5 shrink-0">
                    {NAV_LINKS.map(({ to, label, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) =>
                                `text-sm transition ${
                                    isActive
                                        ? "text-textPrimary font-semibold"
                                        : "text-textSecondary hover:text-textPrimary"
                                }`
                            }
                        >
                            {label}
                        </NavLink>
                    ))}
                </nav>

                {/* Search */}
                <form onSubmit={handleSearchSubmit} className="flex-1">
                    <div className="relative">
                        <Search
                            size={16}
                            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-textMuted"
                        />
                        <input
                            type="search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search products, shops, materials"
                            aria-label="Search"
                            className="w-full rounded-full bg-ink-100 border border-transparent pl-9 pr-4 py-2 text-sm text-textPrimary placeholder:text-textMuted focus:outline-none focus:ring-2 focus:ring-primary focus:bg-surface transition"
                        />
                    </div>
                </form>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <Link
                        to="/cart"
                        aria-label="Cart"
                        className="relative p-2 rounded-lg text-textSecondary hover:text-textPrimary hover:bg-ink-100 transition"
                    >
                        <ShoppingCart size={19} />
                        {count > 0 && (
                            <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                                {count > 9 ? "9+" : count}
                            </span>
                        )}
                    </Link>

                    {isLoggedIn ? (
                        <div className="relative" ref={accountRef}>
                            <button
                                onClick={() => setAccountOpen((v) => !v)}
                                aria-expanded={accountOpen}
                                aria-haspopup="menu"
                                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-ink-100 transition"
                            >
                                <span className="h-8 w-8 rounded-full bg-primarySoft text-primary flex items-center justify-center text-sm font-semibold">
                                    {user?.name?.charAt(0)?.toUpperCase() || "?"}
                                </span>
                                <ChevronDown
                                    size={15}
                                    className={`text-textSecondary transition-transform ${
                                        accountOpen ? "rotate-180" : ""
                                    }`}
                                />
                            </button>

                            {accountOpen && (
                                <div
                                    role="menu"
                                    className="absolute right-0 mt-2 w-60 rounded-xl bg-surface border border-line shadow-lg p-2"
                                >
                                    <div className="px-3 py-2 border-b border-line mb-1">
                                        <p className="text-sm font-semibold text-textPrimary truncate">
                                            {user?.name}
                                        </p>
                                        <p className="text-xs text-textSecondary truncate">
                                            {user?.email}
                                        </p>
                                    </div>

                                    {roleLinks.length > 0 && (
                                        <>
                                            <p className="px-3 pt-1 pb-1.5 text-label uppercase text-textMuted">
                                                {isAdmin ? "Admin" : "Selling"}
                                            </p>
                                            {roleLinks.map(({ to, label, icon: Icon }) => (
                                                <Link key={to} to={to} className={dropdownItem}>
                                                    <Icon size={16} />
                                                    {label}
                                                </Link>
                                            ))}
                                            <div className="my-1 border-t border-line" />
                                        </>
                                    )}

                                    {!isAdmin && (
                                        <Link to="/orders" className={dropdownItem}>
                                            <Receipt size={16} />
                                            My orders
                                        </Link>
                                    )}
                                    <Link to="/account" className={dropdownItem}>
                                        <Settings size={16} />
                                        Account settings
                                    </Link>

                                    <div className="my-1 border-t border-line" />

                                    <LogoutButton
                                        label="Sign out"
                                        onClick={() => setAccountOpen(false)}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-danger hover:bg-dangerSoft transition"
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-textPrimary hover:bg-ink-100 transition"
                            >
                                <LogIn size={16} />
                                Sign in
                            </Link>
                            <Link
                                to="/register"
                                className="px-4 py-2 rounded-full bg-primary text-sm font-semibold text-white hover:bg-primaryHover transition"
                            >
                                Open your shop
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}