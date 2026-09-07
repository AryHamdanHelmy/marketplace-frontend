import { Link, NavLink } from "react-router-dom";
import { useSellerNav } from "../../context/SellerNavContext";
import {
    Home, Compass, ShoppingCart, Receipt,
    Store, User, Users, Package, Search, Menu
} from "lucide-react";
import logoImage from "../../assets/rapaku.png";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "../ui/input-group";

// Maks 5 tab — lebih dari itu target sentuhnya kekecilan
function buildTabs({ isLoggedIn, isAdmin, isSeller, homePath }) {
    if (isAdmin) {
        return [
            { to: "/",            label: "Home",     icon: Home },
            { to: "/admin/products",   label: "Products", icon: Package },
            { to: "/admin/categories", label: "Category", icon: Compass },
            { to: "/users",            label: "Users",    icon: Users },
        ];
    }

    if (isSeller) {
        return [
            { to: "/",           label: "Home",   icon: Home },
            { to: "/explore",         label: "Explore", icon: Compass },
            { to: "/seller/dashboard", label: "Seller", icon: Store },
            { to: "/orders",          label: "Orders", icon: Receipt },
            { to: "/cart",            label: "Cart",   icon: ShoppingCart },
        ];
    }

    if (isLoggedIn) {
        return [
            { to: "/",   label: "Home",    icon: Home },
            { to: "/explore", label: "Explore", icon: Compass },
            { to: "/cart",    label: "Cart",    icon: ShoppingCart },
            { to: "/orders",  label: "Orders",  icon: Receipt },
        ];
    }

    return [
        { to: "/",        label: "Home",    icon: Home },
        { to: "/explore", label: "Explore", icon: Compass },
        { to: "/cart",    label: "Cart",    icon: ShoppingCart },
        { to: "/login",   label: "Sign In", icon: User },
    ];
}

export default function NavbarMobile({
    searchQuery,
    setSearchQuery,
    handleSearchSubmit,
    isLoggedIn,
    isAdmin,
    isSeller,
    isSellerPage,
    homePath,
}) {
    const tabs = buildTabs({ isLoggedIn, isAdmin, isSeller, homePath });
    const sellerNav = useSellerNav();

    return (
        <>
            {/* Top bar — logo + search */}
            <header className="fixed top-0 left-0 w-full z-50 bg-white border-b border-gray-200">
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
                                <button
                                    type="submit"
                                    aria-label="Search"
                                    className="flex items-center"
                                >
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
                            className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg text-darkblue hover:bg-gray-100 transition"
                        >
                            {sellerNav.open ? <Menu size={20} /> : <Menu size={20} />}
                        </button>
                    )}
                </div>
            </header>

            {/* Bottom tab bar */}
            <nav
                className="fixed bottom-0 left-0 w-full z-50 bg-white border-t border-gray-200
                           pb-[env(safe-area-inset-bottom)]"
            >
                <ul className="flex items-stretch h-16">
                    {tabs.map(({ to, label, icon: Icon }) => (
                        <li key={to} className="flex-1">
                            <NavLink
                                to={to}
                                end={to === "/"}
                                className={({ isActive }) =>
                                    `h-full flex flex-col items-center justify-center gap-1 transition ${
                                        isActive
                                            ? "text-darkblue"
                                            : "text-gray-400 hover:text-gray-600"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon size={20} strokeWidth={isActive ? 2.4 : 1.8} />
                                        <span className="text-[10px] font-medium leading-none">
                                            {label}
                                        </span>
                                    </>
                                )}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </>
    );
}