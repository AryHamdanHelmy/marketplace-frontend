import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/Client";
import { ArrowRight, Star, Store, ShieldCheck, Package } from "lucide-react";

const rupiah = (value) =>
  "Rp " + Number(value ?? 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [newest, setNewest] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // Each section is fetched independently and allowed to fail on its own.
      // One missing endpoint shouldn't blank the whole homepage.
      const settle = (promise) => promise.then((r) => r).catch(() => null);

      const [categoriesRes, shopsRes, newestRes, topRatedRes] = await Promise.all([
        settle(apiRequest("/categories")),
        settle(apiRequest("/shops?per_page=6")),
        settle(apiRequest("/products?sort_by=created_at&order=desc&per_page=8")),
        settle(apiRequest("/products?sort_by=rating&order=desc&per_page=8")),
      ]);

      if (cancelled) return;

      setCategories(categoriesRes?.data || []);
      setShops(shopsRes?.data || []);
      setNewest(newestRes?.data || []);
      setTopRated(topRatedRes?.data || []);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background pb-12">

      {/* Hero */}
      <section className="px-4 pt-20 pb-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl bg-surface border border-line p-6 md:p-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-ink-100 px-3 py-1 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="text-label uppercase text-textSecondary">
                Makers across Indonesia
              </span>
              <span className="text-textMuted">·</span>
              <span className="text-xs text-textSecondary">ラパク</span>
            </span>

            <h1 className="text-display text-textPrimary max-w-lg">
              One gate. Every shop.
            </h1>
            <p className="mt-3 text-sm md:text-base leading-relaxed text-textSecondary max-w-md">
              Rapaku comes from <em>lapakku</em> — "my stall" — said with a
              Japanese accent. Every seller here gets a proper shopfront.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/explore"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primaryHover transition"
              >
                Start browsing
                <ArrowRight size={17} />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full border border-lineStrong px-5 py-3 text-sm font-semibold text-textPrimary hover:bg-ink-100 transition"
              >
                Open your shop
              </Link>
            </div>

            <div className="mt-6 pt-5 border-t border-line flex flex-wrap gap-x-5 gap-y-2 text-xs text-textSecondary">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-primary" />
                Payment held until you confirm delivery
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Store size={14} className="text-primary" />
                Independent sellers, not resellers
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="px-4 py-4">
          <div className="max-w-5xl mx-auto">
            <SectionHeading title="Browse by category" />
            <div className="flex gap-4 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/explore?category_id=${cat.id}`}
                  className="flex flex-col items-center gap-2 shrink-0 w-20"
                >
                  <span className="h-16 w-16 rounded-full bg-surface border border-line overflow-hidden flex items-center justify-center">
                    {cat.image_url ? (
                      <img
                        src={cat.image_url}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package size={22} className="text-primary" />
                    )}
                  </span>
                  <span className="text-xs text-textSecondary text-center leading-tight line-clamp-2">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured shops */}
      {shops.length > 0 && (
        <section className="px-4 py-4">
          <div className="max-w-5xl mx-auto">
            <SectionHeading title="Shops worth a look" href="/explore" />
            <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
              {shops.map((shop) => (
                <div
                  key={shop.slug}
                  className="shrink-0 w-56 bg-surface border border-line rounded-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-11 w-11 rounded-lg bg-ink-100 overflow-hidden shrink-0 flex items-center justify-center">
                      {shop.logo_url ? (
                        <img
                          src={shop.logo_url}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Store size={19} className="text-textMuted" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-textPrimary truncate">
                        {shop.name}
                      </p>
                      {shop.city && (
                        <p className="text-xs text-textSecondary truncate">
                          {shop.city}
                        </p>
                      )}
                    </div>
                  </div>
                  {shop.description && (
                    <p className="mt-3 text-xs text-textSecondary line-clamp-2">
                      {shop.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top rated */}
      <ProductRail
        title="Top rated"
        href="/explore?sort=rating"
        products={topRated}
        loading={loading}
      />

      {/* Newest */}
      <ProductRail
        title="Just listed"
        href="/explore"
        products={newest}
        loading={loading}
      />

      {/* Sell with us */}
      <section className="px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl bg-ink-100 p-6 text-center">
            <h2 className="text-heading text-textPrimary">
              Make something? Sell it here.
            </h2>
            <p className="mt-2 text-sm text-textSecondary max-w-md mx-auto">
              Listing is free. You keep your own shopfront, and payment lands in
              your balance once the buyer confirms delivery.
            </p>
            <Link
              to="/register"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white hover:bg-primaryHover transition"
            >
              Open your shop
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ title, href }) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <h2 className="text-heading text-textPrimary">{title}</h2>
      {href && (
        <Link
          to={href}
          className="text-sm font-semibold text-primary hover:underline shrink-0"
        >
          See all
        </Link>
      )}
    </div>
  );
}

function ProductRail({ title, href, products, loading }) {
  if (!loading && products.length === 0) return null;

  return (
    <section className="px-4 py-4">
      <div className="max-w-5xl mx-auto">
        <SectionHeading title={title} href={href} />

        {loading ? (
          <div className="flex gap-3 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-40 bg-surface border border-line rounded-xl overflow-hidden"
              >
                <div className="aspect-square bg-ink-100 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-ink-100 rounded animate-pulse" />
                  <div className="h-3 bg-ink-100 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto scrollbar-hide -mx-4 px-4 pb-1">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="shrink-0 w-40 bg-surface border border-line rounded-xl overflow-hidden hover:border-lineStrong transition"
              >
                <div className="aspect-square bg-ink-100 relative">
                  {product.seller?.shop?.city && (
                    <span className="absolute top-2 left-2 bg-surface/95 backdrop-blur text-[10px] font-semibold uppercase tracking-wide text-textPrimary px-2 py-0.5 rounded-full">
                      {product.seller.shop.city}
                    </span>
                  )}
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-textMuted text-xs">
                      No image
                    </div>
                  )}
                </div>

                <div className="p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-[11px] uppercase tracking-wide text-textMuted truncate">
                      {product.seller?.shop?.name || product.seller?.name}
                    </p>
                    {Number(product.rating) > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-[11px] text-textSecondary shrink-0">
                        <Star size={11} className="text-primary fill-primary" />
                        <span className="tabular">
                          {Number(product.rating).toFixed(1)}
                        </span>
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-textPrimary line-clamp-2 mb-1.5">
                    {product.title}
                  </p>

                  <p className="text-sm font-bold text-primary tabular">
                    {rupiah(product.price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}