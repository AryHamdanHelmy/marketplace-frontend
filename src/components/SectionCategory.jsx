import React from "react";
import { useNavigate } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import {
    Laptop, Smartphone, Shirt, ShoppingBasket, Package,
} from "lucide-react";

const ICONS = {
    "laptop":          Laptop,
    "smartphone":      Smartphone,
    "shirt":           Shirt,
    "shopping-basket": ShoppingBasket,
    "package":         Package,
};

export default function Categories() {
    const navigate = useNavigate();
    const { data, loading } = useFetch("/categories", []);
    const categories = data?.data || [];

    return (
        <div className="px-5 py-8 md:px-8">
            <div className="bg-white rounded-2xl border border-line/60 overflow-hidden">
                <div className="px-6 py-4">
                    <h2 className="text-title text-textPrimary uppercase">
                        Category
                    </h2>
                </div>

                {loading && (
                    <div className="flex overflow-x-auto scrollbar-hide md:grid md:grid-cols-5 md:overflow-visible md:divide-x divide-line/40">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="shrink-0 w-32 md:w-auto p-6 flex items-center gap-4">
                                <div className="w-24 h-24 bg-background rounded-full animate-pulse" />
                                <div className="h-3 w-20 bg-background rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                )}

                {!loading && (
                    <div className="flex overflow-x-auto scrollbar-hide md:grid md:grid-cols-5 md:overflow-visible md:divide-x divide-line/40">
                        {categories.map((cat) => {
                            const Icon = ICONS[cat.icon] || Package;

                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => navigate(`/explore?category_id=${cat.id}`)}
                                    className="group shrink-0 w-32 md:w-auto px-6 flex flex-col items-center gap-4 hover:bg-gray-50 transition cursor-pointer"
                                >
                                    <div className="w-24 h-24 rounded-xl flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
                                        {cat.image_url ? (
                                            <img
                                                src={cat.image_url}
                                                alt={cat.name}
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <Icon size={40} className="text-white" strokeWidth={1.5} />
                                        )}
                                    </div>

                                    <div className="text-center mb-5">
                                        <p className="text-label text-textPrimary line-clamp-1">
                                            {cat.name}
                                        </p>
                                        <p className="text-xs text-textSecondary mt-1">
                                            {cat.children?.length || 0} subkategori
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}