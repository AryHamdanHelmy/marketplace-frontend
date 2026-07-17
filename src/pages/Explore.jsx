import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import ProductCard from "../components/organisms/ProductCard";

const PER_PAGE = 12;

export default function Explore() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const search = searchParams.get("search") || "";
  const [page, setPage] = useState(1);

  // Reset ke halaman 1 tiap kali kata kunci pencarian berubah
  useEffect(() => {
    setPage(1);
  }, [search]);

  const query = search
    ? `?search=${encodeURIComponent(search)}&page=${page}&per_page=${PER_PAGE}`
    : `?page=${page}&per_page=${PER_PAGE}`;

  const { data, loading, error } = useFetch(`/products${query}`, [search, page]);

  const products = data?.data || [];
  const meta = data?.meta || null;

  const goToPage = (newPage) => {
    if (newPage < 1) return;
    if (meta && newPage > meta.last_page) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-hitam text-darkblue pt-24 px-5 pb-12 md:px-25">
      <h1 className="text-2xl font-semibold mb-2">
        {search ? `Results for "${search}"` : "Explore Products"}
      </h1>

      {!loading && !error && meta && (
        <p className="text-sm text-gray-400 mb-6">{meta.total} products found</p>
      )}

      {loading && products.length === 0 && (
        <p className="text-gray-400 mt-6">Loading products...</p>
      )}

      {!loading && error && (
        <p className="text-red-400 mt-6">Error: {error}</p>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="text-gray-400 mt-6">
          No products found{search ? ` for "${search}"` : ""}.
        </p>
      )}

      {products.length > 0 && (
        <>
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-5 transition-opacity ${
              loading ? "opacity-50 pointer-events-none" : "opacity-100"
            }`}
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onClick={() => navigate(`/products/${product.id}`)}
              />
            ))}
          </div>

          {meta && meta.last_page > 1 && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-8 text-sm text-black">
              <p className="text-center md:text-left">
                Page {meta.current_page} of {meta.last_page}
              </p>

              <div className="flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => goToPage(meta.current_page - 1)}
                  disabled={meta.current_page <= 1 || loading}
                  className="px-3 py-1.5 rounded-lg bg-pastel-cyan/20 border border-pastel-cyan/35 hover:bg-pastel-cyan/30 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  ← Prev
                </button>

                <PageNumbers meta={meta} onGoToPage={goToPage} disabled={loading} />

                <button
                  onClick={() => goToPage(meta.current_page + 1)}
                  disabled={meta.current_page >= meta.last_page || loading}
                  className="px-3 py-1.5 rounded-lg bg-pastel-cyan/20 border border-pastel-cyan/35 hover:bg-pastel-cyan/30 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PageNumbers({ meta, onGoToPage, disabled }) {
  const { current_page, last_page } = meta;

  const start = Math.max(1, current_page - 2);
  const end = Math.min(last_page, start + 4);

  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex items-center gap-1 flex-wrap justify-center">
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onGoToPage(p)}
          disabled={disabled}
          className={`w-8 h-8 rounded-lg text-sm transition disabled:opacity-40 disabled:cursor-not-allowed ${
            p === current_page
              ? "bg-indigo-600 text-white"
              : "bg-black/5 border border-black/10 hover:bg-black/10 text-black"
          }`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}