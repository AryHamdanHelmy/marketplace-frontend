import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import ProductCard from "../components/organisms/ProductCard";

export default function Featured() {
    const navigate = useNavigate();
    const { data, loading, error } = useFetch("/products?status=active&per_page=10", []);
    const products = data?.data || [];

    return (
        <div className="px-5 py-8 md:px-8">
            <div className="flex items-center justify-between px-6 py-4 mb-4">
                <h2 className="text-sm font-bold text-darkblue uppercase tracking-wide">
                    Latest Products
                </h2>
                <Link
                    to="/explore"
                    className="text-xs font-semibold text-pastel-blue hover:underline shrink-0"
                >
                    View all →
                </Link>
            </div>

            {loading && (
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 md:grid md:overflow-visible md-pb-0 md:grid-cols-6">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="shrink-0 w-37 md:w-auto flex flex-col gap-2">
                            <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />
                            <div className="h-3 w-3/4 bg-gray-100 rounded animate-pulse" />
                            <div className="h-3 w-1/2 bg-gray-100 rounded animate-pulse" />
                        </div>
                    ))}
                </div>
            )}

            {!loading && error && (
                <p className="text-sm text-red-500">Error: {error}</p>
            )}

            {!loading && !error && products.length === 0 && (
                <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center">
                    <p className="text-sm text-gray-400">No products available yet.</p>
                </div>
            )}

            {!loading && products.length > 0 && (
                <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 md:grid md:overflow-visible md-pb-0 md:grid-cols-6">
                    {products.map((product) => (
                        <div key={product.id} className="shrink-0 w-37 md:w-auto">
                        <ProductCard
                            product={product}
                            onClick={() => navigate(`/products/${product.id}`)}
                        />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}