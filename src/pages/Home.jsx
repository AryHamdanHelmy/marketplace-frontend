import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/Client";
import ProductCard from "../components/organisms/ProductCard";
import {
  ArrowRight, ArrowUpRight, Store, ShieldCheck, Package, MapPin, Sparkles,
} from "lucide-react";

const rupiah = (value) =>
  "Rp " + Number(value ?? 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

const buildCategoryItems = (categories, limit = 8) => {
  const mainItems = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    image_url: cat.image_url,
    href: `/explore?category_id=${cat.id}`,
  }));

  const remaining = limit - mainItems.length;
  if (remaining <= 0) return mainItems.slice(0, limit);

  const subItems = categories
    .flatMap((cat) =>
      (cat.children || []).map((child) => ({
        id: `sub-${child.id}`,
        name: child.name,
        image_url: null, // children tidak punya image_url dari API
        icon: child.icon,
        href: `/explore?category_id=${cat.id}&subcategory_id=${child.id}`,
      }))
    )
    .slice(0, remaining);

  return [...mainItems, ...subItems];
};

const TRUST = [
  {
    icon: Sparkles,
    title: "Made, not resold",
    body: "Every shop belongs to the person who made what's inside it.",
  },
  {
    icon: ShieldCheck,
    title: "Escrow on every order",
    body: "Your payment is held until you confirm the parcel arrived.",
  },
  {
    icon: Store,
    title: "One cart, many shops",
    body: "Buy from several studios at once and pay a single time.",
  },
];

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [shops, setShops] = useState([]);
  const [newest, setNewest] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [hero, setHero] = useState(null);
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

      // The hero photograph is whichever real product is rated highest and
      // actually has an image.
      setHero((topRatedRes?.data || []).find((p) => p.thumbnail) || null);

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background pb-12">

      {/* Hero */}
      <section className="px-4 pt-20 md:pt-24 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl md:rounded-3xl bg-surface border border-line p-6 md:p-10 md:grid md:grid-cols-2 md:gap-10 md:items-center">

            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-ink-100 px-3 py-1 mb-4">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-label uppercase text-textSecondary">
                  Makers across Indonesia
                </span>
                <span className="text-textMuted">·</span>
                <span className="text-xs text-textSecondary">ラパク</span>
              </span>

              <h1 className="text-display md:text-[2.75rem] md:leading-[1.1] text-textPrimary max-w-lg">
                One gate. Every shop.
              </h1>
              <p className="mt-3 md:mt-4 text-sm md:text-base leading-relaxed text-textSecondary max-w-md">
                Rapaku comes from <em>lapakku</em> — "my stall" — said with a
                Japanese accent. Every seller here gets a proper shopfront,
                however small their workshop.
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
            </div>

            {/* Hero image — desktop only. On phones it would push the buttons
                below the fold for no gain. */}
            <div className="hidden md:block">
              {hero ? (
                <Link
                  to={`/products/${hero.id}`}
                  className="relative block aspect-4/3 rounded-2xl overflow-hidden bg-ink-100 group"
                >
                  <img
                    src={hero.thumbnail}
                    alt={hero.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-textPrimary/85 to-transparent p-5">
                    {hero.seller?.shop?.city && (
                      <p className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wide text-white/80">
                        <MapPin size={10} />
                        {hero.seller.shop.city}
                      </p>
                    )}
                    <p className="text-base font-semibold text-white line-clamp-1">
                      {hero.title}
                    </p>
                    <p className="text-sm text-white/90 tabular">
                      {rupiah(hero.price)}
                    </p>
                  </div>
                </Link>
              ) : (
                <div className="aspect-4/3 rounded-2xl bg-ink-100 animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <SectionHeading title="Browse by category" />

            {/* Phones keep the scrolling rail. Desktop gets a grid, because a
                rail that fits on screen shouldn't pretend to scroll. */}
            <div className="flex md:grid md:grid-cols-8 gap-4 overflow-x-auto md:overflow-visible scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 pb-1">
              {buildCategoryItems(categories, 8).map((item) => (
                <Link
                    key={item.id}
                    to={item.href}
                    className="flex flex-col items-center gap-2 shrink-0 w-20 md:w-auto group"
                >
                    <span className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-surface border border-line overflow-hidden flex items-center justify-center group-hover:border-primary transition">
                    {item.image_url ? (
                        <img
                        src={item.image_url}
                        alt=""
                        loading="lazy"
                        className="w-full h-full object-cover"
                        />
                    ) : (
                        <Package size={22} className="text-primary" />
                    )}
                    </span>
                    <span className="text-xs text-textSecondary text-center leading-tight line-clamp-2 group-hover:text-textPrimary transition">
                    {item.name}
                    </span>
                </Link>
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

      {/* Popular shops */}
      {shops.length > 0 && (
        <section className="px-4 py-4">
          <div className="max-w-6xl mx-auto">
            <SectionHeading title="Shops worth a look" href="/explore" />
            <div className="flex md:grid md:grid-cols-3 gap-3 overflow-x-auto md:overflow-visible scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 pb-1">
              {shops.slice(0, 3).map((shop) => (
                <div
                  key={shop.slug}
                  className="shrink-0 w-56 md:w-auto bg-surface border border-line rounded-xl p-4 hover:border-lineStrong transition"
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
                        <p className="text-xs text-textSecondary truncate inline-flex items-center gap-1">
                          <MapPin size={10} />
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

      {/* Newest */}
      <ProductRail
        title="Just listed"
        href="/explore"
        products={newest}
        loading={loading}
      />

      {/* Trust bar */}
      <section className="px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl bg-surface border border-line p-6 md:p-8 grid gap-5 md:grid-cols-3 md:gap-8">
            {TRUST.map(({ icon: Icon, title, body }) => (
              <div key={title} className="flex gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primarySoft text-primary">
                  <Icon size={18} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-textPrimary">{title}</p>
                  <p className="mt-0.5 text-sm text-textSecondary leading-relaxed">
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sell with us */}
      <section className="px-4 pb-6">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl bg-ink-100 p-6 md:p-10 text-center">
            <h2 className="text-heading md:text-display text-textPrimary">
              Make something? Sell it here.
            </h2>
            <p className="mt-2 text-sm md:text-base text-textSecondary max-w-md mx-auto">
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
    <div className="flex items-baseline justify-between mb-3 md:mb-4">
      <h2 className="text-heading md:text-2xl md:font-bold text-textPrimary">
        {title}
      </h2>
      {href && (
        <Link
          to={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline shrink-0"
        >
          See all
          <ArrowUpRight size={15} />
        </Link>
      )}
    </div>
  );
}

function ProductRail({ title, href, products, loading }) {
  if (!loading && products.length === 0) return null;

  return (
    <section className="px-4 py-4">
      <div className="max-w-6xl mx-auto">
        <SectionHeading title={title} href={href} />

        {loading ? (
          <div className="flex md:grid md:grid-cols-4 gap-3 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-40 md:w-auto bg-surface border border-line rounded-xl overflow-hidden"
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
          // Rail on phones, four-up grid on desktop. Horizontal scrolling with
          // a mouse is awkward, and the width is there to use.
          <div className="flex md:grid md:grid-cols-4 gap-3 overflow-x-auto md:overflow-visible scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 pb-1">
            {products.slice(0, 4).map((product) => (
              <div key={product.id} className="shrink-0 w-40 md:w-auto flex">
                <ProductCard product={product} to={`/products/${product.id}`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}