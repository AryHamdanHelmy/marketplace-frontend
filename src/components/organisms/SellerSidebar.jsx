import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard, PlusCircle, Store, ShoppingBag, Upload, X,
} from "lucide-react";
import { useSellerNav } from "../../context/SellerNavContext";

const navItems = [
    { label: "Dashboard",   to: "/seller/dashboard",       icon: LayoutDashboard },
    { label: "Orders",      to: "/seller/orders",          icon: ShoppingBag },
    { label: "Add Product", to: "/seller/products/new",    icon: PlusCircle },
    { label: "Mass Upload", to: "/seller/products/import", icon: Upload },
];

export default function SellerSidebar() {
    const location = useLocation();
    const { open, close } = useSellerNav();

    const isActive = (to) => location.pathname === to;

    const navContent = (
        <>
            <div className="px-5 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-pastel-blue flex items-center justify-center shrink-0">
                    <Store size={20} className="text-white" />
                </div>
                <div>
                    <p className="text-sm font-bold text-darkblue leading-tight">Seller Center</p>
                    <p className="text-xs text-black/40">DibiTech</p>
                </div>
            </div>

            <nav className="flex-1 px-3 flex flex-col gap-1">
                {navItems.map(({ label, to, icon: Icon }) => (
                    <Link
                        key={to}
                        to={to}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                            isActive(to)
                                ? "text-pastel-blue font-semibold bg-pastel-blue/10 border-r-2 border-pastel-blue"
                                : "text-black/60 hover:bg-black/5"
                        }`}
                    >
                        <Icon size={18} />
                        {label}
                    </Link>
                ))}
            </nav>
        </>
    );

    return (
        <>
            {/* Drawer — mobile, tanpa overlay */}
            <aside
                className={`md:hidden fixed top-14 left-0 bottom-16 w-64 z-40 bg-white border-r border-gray-200 shadow-xl flex flex-col py-6 overflow-y-auto transition-transform duration-200 ease-out ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <button
                    onClick={close}
                    aria-label="Close menu"
                    className="absolute top-4 right-4 text-gray-400 hover:text-darkblue"
                >
                    <X size={20} />
                </button>
                {navContent}
            </aside>

            {/* Sidebar tetap — desktop */}
            <aside className="hidden md:flex w-60 h-screen fixed left-0 top-16 border-r border-black/10 bg-white flex-col py-6 gap-1 z-30">
                {navContent}
            </aside>
        </>
    );
}