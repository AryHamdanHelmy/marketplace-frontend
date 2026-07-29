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
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-bold text-darkblue uppercase tracking-wide">
                        Category
                    </h2>
                </div>

                {loading && (
                    <div className="flex overflow-x-auto scrollbar-hide md:grid md:grid-cols-5 md:overflow-visible md:divide-x divide-gray-100">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="shrink-0 w-32 md:w-auto p-6 flex items-center gap-4">
                                <div className="w-24 h-24 bg-gray-100 rounded-full animate-pulse" />
                                <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                )}

                {!loading && (
                    <div className="flex overflow-x-auto scrollbar-hide md:grid md:grid-cols-5 md:overflow-visible md:divide-x divide-gray-100">
                        {categories.map((cat) => {
                            const Icon = ICONS[cat.icon] || Package;

                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => navigate(`/explore?category_id=${cat.id}`)}
                                    className="group shrink-0 w-32 md:w-auto p-6 flex flex-col items-center gap-4 hover:bg-gray-50 transition cursor-pointer"
                                >
                                    <div className="w-24 h-24 rounded-full bg-pastel-blue flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
                                        {cat.image_url ? (
                                            <img
                                                src={cat.image_url}
                                                alt={cat.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Icon size={40} className="text-white" strokeWidth={1.5} />
                                        )}
                                    </div>

                                    <div className="text-center">
                                        <p className="text-sm font-medium text-darkblue leading-snug">
                                            {cat.name}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
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