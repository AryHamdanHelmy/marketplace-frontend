import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Check, Star } from "lucide-react";
import { apiRequest } from "../../api/Client";
import { useCart } from "../../context/CartContext";

const rupiah = (value) =>
  "Rp " + Number(value ?? 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

export default function ProductCard({ product, to, onClick, view = "grid" }) {
  const { bump } = useCart();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  const isList = view === "list";
  const soldOut = Number(product.stock) === 0;
  const shop = product.seller?.shop;

  const handleAddToCart = async (e) => {
    // The whole card is a link, so the button has to stop the click here
    e.preventDefault();
    e.stopPropagation();

    if (adding || soldOut) return;

    setAdding(true);
    setError("");

    try {
      await apiRequest("/cart", {
        method: "POST",
        body: { product_id: product.id, quantity: 1 },
      });
      setAdded(true);
      bump();
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      // An alert() here would cover the page and lose the person's place
      setError(err.message || "Couldn't add to cart");
      setTimeout(() => setError(""), 3000);
    } finally {
      setAdding(false);
    }
  };

  const body = (
    <>
      <div
        className={`bg-ink-100 relative shrink-0 overflow-hidden ${
          isList ? "w-28 aspect-square rounded-l-xl" : "aspect-square w-full"
        }`}
      >
        {shop?.city && (
          <span className="absolute top-2 left-2 z-10 bg-surface/95 backdrop-blur text-[10px] font-semibold uppercase tracking-wide text-textPrimary px-2 py-0.5 rounded-full">
            {shop.city}
          </span>
        )}

        {product.thumbnail ? (
          <img
            src={product.thumbnail}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-textMuted text-xs">
            No image
          </div>
        )}

        {soldOut && (
          <div className="absolute inset-0 bg-textPrimary/50 flex items-center justify-center">
            <span className="text-white text-xs font-semibold uppercase tracking-wide">
              Sold out
            </span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-[11px] uppercase tracking-wide text-textMuted truncate">
            {shop?.name || product.seller?.name}
          </p>
          {Number(product.rating) > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[11px] text-textSecondary shrink-0">
              <Star size={11} className="text-primary fill-primary" />
              <span className="tabular">{Number(product.rating).toFixed(1)}</span>
            </span>
          )}
        </div>

        <p className="text-sm text-textPrimary line-clamp-1 mb-1.5">
          {product.title}
        </p>

        <p className="text-sm font-bold text-primary tabular">
          {rupiah(product.price)}
        </p>

        {!soldOut && Number(product.stock) <= 5 && (
          <p className="text-[11px] text-warning mb-1.5">
            Only {product.stock} left
          </p>
        )}

        {error && <p className="text-[11px] text-danger mt-1">{error}</p>}

        <button
          onClick={handleAddToCart}
          disabled={adding || soldOut}
          className={`mt-auto  w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold rounded-lg py-2 transition disabled:opacity-50 disabled:cursor-not-allowed ${
            added
              ? "bg-success text-white"
              : "bg-primary hover:bg-primaryHover text-white"
          }`}
        >
          {added ? (
            <>
              <Check size={14} />
              Added
            </>
          ) : (
            <>
              <ShoppingCart size={14} />
              {adding ? "Adding..." : soldOut ? "Sold out" : "Add to cart"}
            </>
          )}
        </button>
      </div>
    </>
  );

  const shell = `group h-full bg-surface border border-line rounded-xl overflow-hidden hover:border-lineStrong transition ${
    isList ? "flex" : "flex flex-col"
  }`;

  // Only becomes a link when a destination is given, so cards can't point at
  // a route that doesn't exist yet.
  if (to) {
    return (
      <Link to={to} className={shell}>
        {body}
      </Link>
    );
  }

  return (
    <div onClick={onClick} className={`${shell} ${onClick ? "cursor-pointer" : ""}`}>
      {body}
    </div>
  );
}