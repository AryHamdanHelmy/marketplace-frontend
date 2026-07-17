export default function ProductCard({ product, onClick }) {
  const { title, description, price, thumbnail, rating_label, category } = product;

  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price ?? 0);

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
      </div>
    </div>
  );
}