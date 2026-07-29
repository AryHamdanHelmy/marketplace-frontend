import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard, PlusCircle, Store, ShoppingBag, Upload, Menu, X,
} from "lucide-react";

const navItems = [
    { label: "Dashboard",   to: "/seller/dashboard",       icon: LayoutDashboard },
    { label: "Orders",      to: "/seller/orders",          icon: ShoppingBag },
    { label: "Add Product", to: "/seller/products/new",    icon: PlusCircle },
    { label: "Mass Upload", to: "/seller/products/import", icon: Upload },
];

export default function SellerSidebar() {
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const isActive = (to) => location.pathname === to;

    // Tutup drawer tiap pindah halaman
    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    // Kunci scroll body saat drawer terbuka
    useEffect(() => {
        document.body.style.overflow = open ? "hidden" : "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    // Tutup dengan tombol Escape
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && setOpen(false);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

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
            {/* Tombol pembuka — mobile saja */}
            <button
                onClick={() => setOpen(true)}
                aria-label="Open seller menu"
                className="md:hidden fixed top-20 left-80 z-30 w-10 h-10 rounded-lg bg-white border border-gray-200 shadow-sm flex items-center justify-center text-darkblue"
            >
                <Menu size={18} />
            </button>

            {/* Overlay */}
            <div
                onClick={() => setOpen(false)}
                className={`md:hidden fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${
                    open ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            />

            {/* Drawer — mobile */}
            <aside
                className={`md:hidden fixed top-0 left-0 h-full w-64 z-50 bg-white border-r border-gray-200 flex flex-col py-6 transition-transform duration-250 ease-out ${
                    open ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <button
                    onClick={() => setOpen(false)}
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