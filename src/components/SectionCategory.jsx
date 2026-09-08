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

    // Digandakan supaya saat set pertama habis, set kedua sudah menempati
    // posisinya — itu yang bikin loop terlihat tanpa sambungan.
    const loop = [...categories, ...categories];

    return (
        <div className="px-5 py-8 md:px-8">
            <div className="bg-white rounded-2xl border border-line/60 overflow-hidden">
                <div className="px-6 py-4">
                    <h2 className="text-title text-textPrimary uppercase">
                        Category
                    </h2>
                </div>

                {loading && (
                    <div className="flex overflow-hidden divide-x divide-line/40">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="shrink-0 w-32 md:w-40 p-6 flex flex-col items-center gap-4">
                                <div className="w-24 h-24 bg-background rounded-full animate-pulse" />
                                <div className="h-3 w-20 bg-background rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                )}

                {!loading && categories.length > 0 && (
                    <div className="marquee-viewport overflow-hidden">
                        <div className="marquee-track flex w-max divide-x divide-line/40">
                            {loop.map((cat, i) => {
                                const Icon = ICONS[cat.icon] || Package;
                                const isClone = i >= categories.length;

                                return (
                                    <button
                                        key={`${cat.id}-${i}`}
                                        onClick={() => navigate(`/explore?category_id=${cat.id}`)}
                                        aria-hidden={isClone}
                                        tabIndex={isClone ? -1 : 0}
                                        className="group shrink-0 w-32 md:w-40 px-6 flex flex-col items-center gap-4 hover:bg-gray-50 transition cursor-pointer"
                                    >
                                        <div className="w-24 h-24 rounded-xl flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform duration-300">
                                            {cat.image_url ? (
                                                <img
                                                    src={cat.image_url}
                                                    alt={cat.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <Icon size={40} className="text-textSecondary" strokeWidth={1.5} />
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
                    </div>
                )}
            </div>
        </div>
    );
}