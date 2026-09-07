import { Link } from "react-router-dom";
import { Search, User, ShoppingCart, ChevronDown } from "lucide-react";
import logoImage from "../../assets/rapaku.png";
import LogoutButton from "../LogoutButton";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "../ui/input-group";

const linkBase = "text-sm font-medium transition";
const linkIdle = "text-gray-600 hover:text-darkblue";
const linkActive = "text-textPrimary font-semibold";

const dropdownItem =
    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-darkblue transition";

export default function NavbarDesktop({
    searchQuery,
    setSearchQuery,
    handleSearchSubmit,
    isLoggedIn,
    isAdmin,
    isSeller,
    user,
    isAdminPage,
    isSellerPage,
    homePath,
}) {
    const adminLinks = [
        { to: "/users",            label: "Manage Users" },
        { to: "/admin/categories", label: "Categories" },
        { to: "/admin/products",   label: "Products" },
    ];

    return (
        <header className="w-full fixed top-0 z-50 bg-white border-b border-gray-200 shadow-sm">

            {/* Utility bar */}
            <div className="flex justify-end px-8 py-1 bg-gray-50 text-[11px] text-gray-500 gap-4 border-b border-gray-100">
                {isSeller && (
                    <Link to="/seller/dashboard" className="hover:text-darkblue transition">
                        Seller Centre
                    </Link>
                )}
                <a href="#" className="hover:text-darkblue transition">Help</a>
                {isLoggedIn && <span className="text-gray-400">Hi, {user.name}</span>}
            </div>

            {/* Main nav */}
            <div className="flex items-center justify-between gap-3 px-8 py-2.5">

                <Link to={homePath} className="shrink-0">
                    <img src={logoImage} alt="Rapaku" className="w-auto h-6" />
                </Link>

                <form onSubmit={handleSearchSubmit} className="flex-1 max-w-lg">
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

                {/* Right actions */}
                <div className="flex items-center gap-5 border-l border-gray-200 pl-5">

                    {!isAdminPage && (
                        <>
                            <Link
                                to="/cart"
                                aria-label="Cart"
                                className="text-gray-500 hover:text-darkblue transition"
                            >
                                <ShoppingCart size={20} />
                            </Link>
                            <Link to="/explore" className={`${linkBase} ${linkIdle}`}>
                                Explore
                            </Link>
                        </>
                    )}

                    {isAdmin &&
                        adminLinks.map(({ to, label }) => (
                            <Link
                                key={to}
                                to={to}
                                className={`${linkBase} ${isAdminPage ? linkActive : linkIdle}`}
                            >
                                {label}
                            </Link>
                        ))}

                    {isSeller && (
                        <Link
                            to="/seller/dashboard"
                            className={`${linkBase} ${isSellerPage ? linkActive : linkIdle}`}
                        >
                            Seller Center
                        </Link>
                    )}

                    {/* Account */}
                    {isLoggedIn ? (
                        <div className="relative group">
                            <button
                                type="button"
                                className="flex items-center gap-1.5 text-gray-600 hover:text-primaryDark transition"
                            >
                                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center">
                                    <User size={16} className="text-primaryDark" />
                                </div>
                                <span className="text-sm text-textSecondary leading-none">Account</span>
                                <ChevronDown size={14} className="text-textSecondary" />
                            </button>

                            <div className="absolute right-0 top-full pt-2 hidden group-hover:block z-50">
                                <div className="w-72 bg-white text-gray-900 rounded-xl shadow-xl border border-gray-100 overflow-hidden">

                                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 border-b border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-darkblue/10 flex items-center justify-center text-darkblue shrink-0">
                                            <User size={18} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-semibold text-darkblue text-sm truncate">
                                                {user.name}
                                            </p>
                                            <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                        </div>
                                        <LogoutButton
                                            label="Sign Out"
                                            className="text-red-400 text-xs font-medium hover:text-red-500 shrink-0 transition"
                                        />
                                    </div>

                                    <div className="px-2 py-2">
                                        {isAdmin &&
                                            adminLinks.map(({ to, label }) => (
                                                <Link key={to} to={to} className={dropdownItem}>
                                                    {label}
                                                </Link>
                                            ))}
                                        {isSeller && (
                                            <Link to="/seller/dashboard" className={dropdownItem}>
                                                Seller Center
                                            </Link>
                                        )}
                                        <Link to="/orders" className={dropdownItem}>My Orders</Link>
                                        <Link to="/explore" className={dropdownItem}>Explore</Link>
                                        <Link to="/cart" className={dropdownItem}>My Cart</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="flex flex-col items-center text-textPrimary transition"
                        >
                            <User size={20} />
                            <span className="text-[10px] mt-0.5">Sign In</span>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}