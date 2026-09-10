import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { apiRequest } from "../api/Client";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/organisms/ProductCard";
import {
  ArrowLeft, Star, Store, ShoppingCart, Check, Minus, Plus,
  ShieldCheck, MapPin,
} from "lucide-react";

const rupiah = (value) =>
  "Rp " + Number(value ?? 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bump } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setQuantity(1);
    window.scrollTo(0, 0);

    (async () => {
      try {
        const res = await apiRequest(`/products/${id}`);
        if (cancelled) return;
        setProduct(res.data);

        // Same category, minus this product. Fetched separately so a failure
        // here doesn't take the main page down with it.
        if (res.data?.category?.id) {
          try {
            const rel = await apiRequest(
              `/products?category_id=${res.data.category.id}&per_page=8`
            );
            if (!cancelled) {
              setRelated((rel.data || []).filter((p) => p.id !== res.data.id).slice(0, 6));
            }
          } catch {
            // Related products are a bonus, not a requirement
          }
        }
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const stock = Number(product?.stock ?? 0);
  const soldOut = stock === 0;
  const shop = product?.seller?.shop;

  const handleAddToCart = async () => {
    if (adding || soldOut) return;

    setAdding(true);
    setError("");

    try {
      await apiRequest("/cart", {
        method: "POST",
        body: { product_id: product.id, quantity },
      });
      setAdded(true);
      bump();
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      setError(err.message || "Couldn't add to cart");
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (adding || soldOut) return;

    setAdding(true);
    setError("");

    try {
      await apiRequest("/cart", {
        method: "POST",
        body: { product_id: product.id, quantity },
      });
      bump();
      navigate("/cart");
    } catch (err) {
      setError(err.message || "Couldn't add to cart");
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="aspect-square md:aspect-video bg-ink-100 rounded-xl animate-pulse mb-4" />
          <div className="h-5 bg-ink-100 rounded w-2/3 animate-pulse mb-3" />
          <div className="h-4 bg-ink-100 rounded w-1/3 animate-pulse" />
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-12 px-4">
        <div className="max-w-md mx-auto text-center bg-surface border border-line rounded-xl p-10">
          <h1 className="text-heading text-textPrimary mb-2">
            This product is gone.
          </h1>
          <p className="text-sm text-textSecondary mb-5">
            It may have been removed by the seller, or the link is wrong.
          </p>
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primaryHover transition"
          >
            Browse other products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-28 md:pb-12">
      <div className="max-w-4xl mx-auto px-4">

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-textSecondary hover:text-textPrimary transition mb-3"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="md:grid md:grid-cols-2 md:gap-6">

          {/* Image */}
          <div className="relative aspect-square bg-ink-100 rounded-xl overflow-hidden border border-line">
            {product.thumbnail ? (
              <img
                src={product.thumbnail}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-textMuted text-sm">
                No image
              </div>
            )}
            {soldOut && (
              <div className="absolute inset-0 bg-textPrimary/50 flex items-center justify-center">
                <span className="text-white font-semibold uppercase tracking-wide">
                  Sold out
                </span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="mt-4 md:mt-0">
            {product.category && (
              <Link
                to={`/explore?category_id=${product.category.id}`}
                className="text-label uppercase text-textSecondary hover:text-primary transition"
              >
                {product.category.name}
              </Link>
            )}

            <h1 className="text-heading text-textPrimary mt-2">
              {product.title}
            </h1>

            <div className="flex items-center gap-3 mt-2">
              {Number(product.rating) > 0 && (
                <span className="inline-flex items-center gap-1 text-sm text-textSecondary">
                  <Star size={14} className="text-primary fill-primary" />
                  <span className="tabular font-semibold text-textPrimary">
                    {Number(product.rating).toFixed(1)}
                  </span>
                </span>
              )}
              <span className="text-sm text-textSecondary">
                {soldOut
                  ? "Out of stock"
                  : stock <= 5
                    ? `Only ${stock} left`
                    : `${stock} in stock`}
              </span>
            </div>

            <p className="text-2xl font-bold text-primary tabular mt-4">
              {rupiah(product.price)}
            </p>

            {/* Quantity */}
            {!soldOut && (
              <div className="flex items-center gap-3 mt-5">
                <span className="text-sm text-textSecondary">Quantity</span>
                <div className="flex items-center border border-line rounded-lg overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="p-2 text-textSecondary hover:bg-ink-100 transition disabled:opacity-40"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-10 text-center text-sm font-semibold tabular">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                    disabled={quantity >= stock}
                    aria-label="Increase quantity"
                    className="p-2 text-textSecondary hover:bg-ink-100 transition disabled:opacity-40"
                  >
                    <Plus size={15} />
                  </button>
                </div>
              </div>
            )}

            {error && (
              <p className="text-sm text-danger mt-3">{error}</p>
            )}

            {/* Desktop actions. On mobile these live in a fixed bar so they
                stay reachable without scrolling back up. */}
            <div className="hidden md:flex gap-3 mt-5">
              <button
                onClick={handleAddToCart}
                disabled={adding || soldOut}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-primary px-4 py-3 text-sm font-semibold text-primary hover:bg-primarySoft transition disabled:opacity-50"
              >
                {added ? <Check size={16} /> : <ShoppingCart size={16} />}
                {added ? "Added" : adding ? "Adding..." : "Add to cart"}
              </button>
              <button
                onClick={handleBuyNow}
                disabled={adding || soldOut}
                className="flex-1 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primaryHover transition disabled:opacity-50"
              >
                Buy now
              </button>
            </div>

            {/* Shop */}
            {(shop || product.seller) && (
              <div className="mt-5 bg-surface border border-line rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <span className="h-11 w-11 rounded-lg bg-ink-100 overflow-hidden shrink-0 flex items-center justify-center">
                    {shop?.logo_url ? (
                      <img src={shop.logo_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Store size={19} className="text-textMuted" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-textPrimary truncate">
                      {shop?.name || product.seller?.name}
                    </p>
                    {shop?.city && (
                      <p className="text-xs text-textSecondary inline-flex items-center gap-1">
                        <MapPin size={11} />
                        {shop.city}
                        {shop.province ? `, ${shop.province}` : ""}
                      </p>
                    )}
                  </div>
                  {shop?.is_open === false && (
                    <span className="text-xs px-2 py-1 rounded-full bg-ink-100 text-textSecondary shrink-0">
                      Closed
                    </span>
                  )}
                </div>
              </div>
            )}

            <p className="mt-4 text-xs text-textSecondary inline-flex items-start gap-1.5">
              <ShieldCheck size={14} className="text-primary mt-0.5 shrink-0" />
              Your payment is held until you confirm the order arrived.
            </p>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-6 bg-surface border border-line rounded-xl p-5">
            <h2 className="text-base font-bold text-textPrimary mb-2">
              About this item
            </h2>
            <p className="text-sm text-textSecondary leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-8">
            <h2 className="text-heading text-textPrimary mb-3">
              More like this
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {related.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  to={`/products/${item.id}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile action bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-surface border-t border-line px-4 py-3 flex gap-3 pb-[env(safe-area-inset-bottom)]">
        <button
          onClick={handleAddToCart}
          disabled={adding || soldOut}
          aria-label="Add to cart"
          className="w-12 mb-3 shrink-0 inline-flex items-center justify-center rounded-xl border border-primary text-primary hover:bg-primarySoft transition disabled:opacity-50"
        >
          {added ? <Check size={18} /> : <ShoppingCart size={18} />}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={adding || soldOut}
          className="flex-1 rounded-full mb-3 bg-primary py-3 px-2 text-sm font-semibold text-white hover:bg-primaryHover transition disabled:opacity-50"
        >
          {soldOut ? "Sold out" : adding ? "Working..." : "Buy now"}
        </button>
      </div>
    </div>
  );
}