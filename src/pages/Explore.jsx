import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { apiRequest } from "../api/client";
import ProductCard from "../components/organisms/ProductCard";

export default function Explore() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const search = searchParams.get("search") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError(null);

        const query = search ? `?search=${encodeURIComponent(search)}` : "";
        const res = await apiRequest(`/products${query}`);

        if (!ignore) {
          setProducts(res.data || []);
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Failed to load products");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      ignore = true;
    };
  }, [search]);

  return (
    <div className="min-h-screen bg-hitam text-darkblue pt-24 px-5 pb-12 md:px-25">
      <h1 className="text-2xl font-semibold mb-2">
        {search ? `Results for "${search}"` : "Explore Products"}
      </h1>

      {!loading && !error && (
        <p className="text-sm text-black mb-6">
          {products.length} product{products.length !== 1 ? "s" : ""} found
        </p>
      )}

      {loading && <p className="text-gray-400 mt-6">Loading products...</p>}

      {!loading && error && (
        <p className="text-red-400 mt-6">Error: {error}</p>
      )}

      {!loading && !error && products.length === 0 && (
        <p className="text-gray-400 mt-6">
          No products found{search ? ` for "${search}"` : ""}.
        </p>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => navigate(`/products/${product.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}