import { useState } from "react";
import { apiRequest } from "../../api/Client";

export default function ProductCard({ product, onClick }) {
  const { title, description, price, thumbnail, rating_label, category } = product;
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price ?? 0);

  const handleAddToCart = async (e) => {
    e.stopPropagation(); // supaya gak ikut trigger onClick card (navigasi ke detail)

    if (adding) return;
    setAdding(true);

    try {
      await apiRequest("/cart", {
        method: "POST",
        body: { product_id: product.id, quantity: 1 },
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 1500); // balik ke teks normal setelah 1.5 detik
    } catch (err) {
      alert(err.message || "Failed to add product to cart");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      onClick={onClick}
      className="flex flex-col gap-2 cursor-pointer group"
    >
      <div className="rounded-2xl overflow-hidden aspect-square w-full bg-black/5">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
            No image
          </div>
        )}
      </div>

      <div className="px-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-black text-sm md:text-base truncate">
            {title}
          </h3>
          {rating_label && (
            <span className="text-[10px] shrink-0 px-2 py-0.5 rounded-full bg-pastel-blue text-pastel-green">
              {rating_label}
            </span>
          )}
        </div>

        {category && (
          <p className="text-xs text-emerald-700 mt-0.5">{category.name}</p>
        )}

        <p className="text-xs text-description leading-snug mt-1 line-clamp-2">
          {description}
        </p>

        <p className="text-sm font-semibold text-black mt-1.5">
          {formattedPrice}
        </p>

        <button
          onClick={handleAddToCart}
          disabled={adding}
          className={`mt-2 w-full text-xs font-semibold rounded-lg py-1.5 transition disabled:opacity-60 ${
            added
              ? "bg-emerald-600 text-white"
              : "bg-pastel-blue hover:bg-pastel-cyan text-white"
          }`}
        >
          {added ? "Added ✓" : adding ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}