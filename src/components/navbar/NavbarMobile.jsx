import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
    Home, Compass, ShoppingCart, Receipt,
    Store, User, Users, Package, Wallet, Tags, Search, Menu, X,
} from "lucide-react";
import logoImage from "../../assets/rapaku.png";
import LogoutButton from "../LogoutButton";
import { useSellerNav } from "../../context/SellerNavContext";
import { useCart } from "../../context/CartContext";
import {
    InputGroup, InputGroupAddon, InputGroupInput,
} from "../ui/input-group";

// Maks 5 tab — lebih dari itu target sentuhnya kekecilan
function buildTabs({ isLoggedIn, isAdmin, isSeller, homePath }) {
    if (!isLoggedIn) {
        return [
            { to: "/",        label: "Home",    icon: Home },
            { to: "/explore", label: "Explore", icon: Compass },
            { to: "/cart",    label: "Cart",    icon: ShoppingCart },
            { to: "/login",   label: "Sign In", icon: User },
        ];
    }

    if (isAdmin) {
        return [
            { to: "/",                  label: "Home",      icon: Home },
            { to: "/admin/products",    label: "Products",  icon: Package },
            { to: "/users",             label: "Users",     icon: Users },
            { to: "/admin/withdrawals", label: "Payouts",   icon: Wallet },
        ];
    }

    if (isSeller) {
        return [
            { to: "/",                 label: "Home",    icon: Home },
            { to: "/explore",          label: "Explore", icon: Compass },
            { to: "/seller/dashboard", label: "Seller",  icon: Store },
            { to: "/cart",             label: "Cart",    icon: ShoppingCart },
        ];
    }

    return [
        { to: "/",        label: "Home",    icon: Home },
        { to: "/explore", label: "Explore", icon: Compass },
        { to: "/cart",    label: "Cart",    icon: ShoppingCart },
        { to: "/orders",  label: "Orders",  icon: Receipt },
    ];
}

// Pages that don't fit in the tab bar live here instead
const adminSheetLinks = [
    { to: "/admin/categories",  label: "Categories",  icon: Tags },
    { to: "/admin/products",    label: "Products",    icon: Package },
    { to: "/users",             label: "Manage Users", icon: Users },
    { to: "/admin/withdrawals", label: "Withdrawals", icon: Wallet },
];

const sheetLink =
    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-textPrimary hover:bg-background transition";

export default function NavbarMobile({
    searchQuery, setSearchQuery, handleSearchSubmit,
    isLoggedIn, isAdmin, isSeller, isSellerPage, user, homePath,
}) {
    const tabs = buildTabs({ isLoggedIn, isAdmin, isSeller, homePath });
    const sellerNav = useSellerNav();
    const { count } = useCart();
    const { pathname } = useLocation();

    const [accountOpen, setAccountOpen] = useState(false);

    // Tutup sheet tiap pindah halaman
    useEffect(() => { setAccountOpen(false); }, [pathname]);

    return (
        <>
            {/* Top bar */}
            <header className="fixed top-0 left-0 w-full z-50 bg-surface border-b border-line">
                <div className="flex items-center gap-3 px-4 h-14">
                    <Link to={homePath} className="shrink-0">
                        <img src={logoImage} alt="Rapaku" className="w-auto h-6" />
                    </Link>

                    <form onSubmit={handleSearchSubmit} className="flex-1 min-w-0">
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

                    {isSellerPage && (
                        <button
                            onClick={sellerNav.toggle}
                            aria-label="Seller menu"
                            aria-expanded={sellerNav.open}
                            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-textPrimary hover:bg-background transition"
                        >
                            {sellerNav.open ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    )}
                </div>
            </header>

            {/* Account sheet */}
            {isLoggedIn && accountOpen && (
                <>
                    <div
                        onClick={() => setAccountOpen(false)}
                        className="fixed inset-0 z-40 bg-textPrimary/40"
                    />
                    <div className="fixed bottom-(--tabbar-h) left-0 right-0 z-50 bg-surface border-t border-line rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto">
                        <div className="flex items-center gap-3 pb-3 mb-2 border-b border-line">
                            <div className="w-11 h-11 rounded-full bg-primarySoft flex items-center justify-center shrink-0">
                                <User size={20} className="text-primaryDark" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-textPrimary truncate">{user.name}</p>
                                <p className="text-xs text-textSecondary truncate">{user.email}</p>
                            </div>
                        </div>

                        {isAdmin ? (
                            <>
                                <p className="px-4 pt-1 pb-2 text-label uppercase text-textMuted">
                                    Admin
                                </p>
                                {adminSheetLinks.map(({ to, label, icon: Icon }) => (
                                    <Link key={to} to={to} className={sheetLink}>
                                        <Icon size={18} /> {label}
                                    </Link>
                                ))}
                            </>
                        ) : (
                            <>
                                <Link to="/orders" className={sheetLink}>
                                    <Receipt size={18} /> My Orders
                                </Link>
                                <Link to="/account" className={sheetLink}>
                                    <User size={18} /> Account settings
                                </Link>
                                {isSeller && (
                                    <>
                                        <Link to="/seller/dashboard" className={sheetLink}>
                                            <Store size={18} /> Seller Center
                                        </Link>
                                        <Link to="/seller/settings" className={sheetLink}>
                                            <Wallet size={18} /> Shop Settings
                                        </Link>
                                    </>
                                )}
                            </>
                        )}

                        <LogoutButton
                            label="Sign Out"
                            onClick={() => setAccountOpen(false)}
                            className="w-full mt-2 py-3 rounded-xl text-sm font-semibold text-danger border border-danger/30 hover:bg-dangerSoft transition"
                        />
                    </div>
                </>
            )}

            {/* Bottom tab bar */}
            <nav className="fixed bottom-0 left-0 w-full z-50 bg-surface border-t border-line pb-[env(safe-area-inset-bottom)]">
                <ul className="flex items-stretch h-16">
                    {tabs.map(({ to, label, icon: Icon }) => (
                        <li key={to} className="flex-1">
                            <NavLink
                                to={to}
                                end={to === "/"}
                                className={({ isActive }) =>
                                    `h-full flex flex-col items-center justify-center gap-1 transition ${
                                        isActive ? "text-primary" : "text-textSecondary"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <span className="relative">
                                            <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                                            {to === "/cart" && count > 0 && (
                                                <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                                                    {count > 9 ? "9+" : count}
                                                </span>
                                            )}
                                        </span>
                                        <span className="text-[10px] font-medium leading-none">{label}</span>
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}

                    {isLoggedIn && (
                        <li className="flex-1">
                            <button
                                onClick={() => setAccountOpen((prev) => !prev)}
                                aria-expanded={accountOpen}
                                className={`w-full h-full flex flex-col items-center justify-center gap-1 transition ${
                                    accountOpen ? "text-primary" : "text-textSecondary"
                                }`}
                            >
                                <User size={20} strokeWidth={accountOpen ? 2.4 : 1.8} />
                                <span className="text-[10px] font-medium leading-none">Account</span>
                            </button>
                        </li>
                    )}
                </ul>
            </nav>
        </>
    );
}