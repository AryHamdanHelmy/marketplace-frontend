import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, PlusCircle, Store } from "lucide-react";

const navItems = [
    { label: "Dashboard", to: "/seller/dashboard", icon: LayoutDashboard },
    { label: "Add Product", to: "/seller/products/new", icon: PlusCircle },
];

export default function SellerSidebar() {
    const location = useLocation();

    return (
        <aside className="hidden md:flex w-60 h-screen fixed left-0 top-16 border-r border-black/10 bg-white flex-col py-6 gap-1 z-30">
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
                {navItems.map(({ label, to, icon: Icon }) => {
                    const isActive = location.pathname === to;
                    return (
                        <Link
                            key={to}
                            to={to}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                                isActive
                                    ? "text-pastel-blue font-semibold bg-pastel-blue/10 border-r-2 border-pastel-blue"
                                    : "text-black/60 hover:bg-black/5"
                            }`}
                        >
                            <Icon size={18} />
                            {label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}