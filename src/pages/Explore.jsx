import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { apiRequest } from "../api/Client";
import ProductCard from "../components/organisms/ProductCard";
import {
  SlidersHorizontal, LayoutGrid, List, X, ChevronDown, ArrowUp,
} from "lucide-react";

const PER_PAGE = 12;

const SORTS = [
  { value: "created_at:desc",  label: "Newest" },
  { value: "rating:desc",      label: "Top rated" },
  { value: "price:asc",        label: "Price: low to high" },
  { value: "price:desc",       label: "Price: high to low" },
];

const rupiah = (value) =>
  "Rp " + Number(value ?? 0).toLocaleString("id-ID", { maximumFractionDigits: 0 });

export default function Explore() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);

  const [categoryId, setCategoryId] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("created_at:desc");

  const [draftMin, setDraftMin] = useState("");
  const [draftMax, setDraftMax] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useState("grid");

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiRequest("/categories");
        setCategories(res.data || []);
      } catch {
        // Categories are a convenience here — the page still works without them
      }
    })();
  }, []);

  const buildQuery = useCallback(
    (targetPage) => {
      const [sortBy, order] = sort.split(":");
      const params = new URLSearchParams({
        page: targetPage,
        per_page: PER_PAGE,
        sort_by: sortBy,
        order,
      });

      if (search) params.set("search", search);
      if (categoryId) params.set("category_id", categoryId);
      if (minPrice) params.set("min_price", minPrice);
      if (maxPrice) params.set("max_price", maxPrice);

      return params.toString();
    },
    [search, categoryId, minPrice, maxPrice, sort]
  );

  // Changing a filter resets to page one and replaces the list. Load-more
  // appends instead, so the two paths are kept separate.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    (async () => {
      try {
        const res = await apiRequest(`/products?${buildQuery(1)}`);
        if (cancelled) return;
        setProducts(res.data || []);
        setMeta(res.meta || null);
        setPage(1);
      } catch (err) {
        if (!cancelled) setError(err.message || "Couldn't load products.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [buildQuery]);

  const loadMore = async () => {
    const next = page + 1;
    setLoadingMore(true);

    try {
      const res = await apiRequest(`/products?${buildQuery(next)}`);
      setProducts((prev) => [...prev, ...(res.data || [])]);
      setMeta(res.meta || null);
      setPage(next);
    } catch (err) {
      setError(err.message || "Couldn't load more.");
    } finally {
      setLoadingMore(false);
    }
  };

  const applyPriceFilter = () => {
    setMinPrice(draftMin);
    setMaxPrice(draftMax);
    setFiltersOpen(false);
  };

  const clearAll = () => {
    setCategoryId("");
    setMinPrice("");
    setMaxPrice("");
    setDraftMin("");
    setDraftMax("");
  };

  const activeCategory = categories.find((c) => String(c.id) === String(categoryId));
  const activeFilterCount = [categoryId, minPrice, maxPrice].filter(Boolean).length;
  const hasMore = meta && meta.current_page < meta.last_page;

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4">

        {/* Category chips */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3 -mx-4 px-4">
            <button
              onClick={() => setCategoryId("")}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                !categoryId
                  ? "bg-primary text-white font-semibold"
                  : "bg-ink-100 text-textSecondary hover:bg-ink-200"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(String(cat.id))}
                className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition ${
                  String(categoryId) === String(cat.id)
                    ? "bg-primary text-white font-semibold"
                    : "bg-ink-100 text-textSecondary hover:bg-ink-200"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex items-center gap-2 py-3">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-line bg-surface text-sm text-textPrimary hover:bg-ink-100 transition"
          >
            <SlidersHorizontal size={15} />
            Filter
            {activeFilterCount > 0 && (
              <span className="min-w-5 h-5 px-1.5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="relative flex-1 min-w-0">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort products"
              className="w-full appearance-none bg-surface border border-line rounded-lg pl-3 pr-8 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDown
              size={15}
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-textMuted"
            />
          </div>

          <div className="flex rounded-lg border border-line overflow-hidden shrink-0">
            <button
              onClick={() => setView("grid")}
              aria-label="Grid view"
              aria-pressed={view === "grid"}
              className={`p-2 transition ${
                view === "grid" ? "bg-primary text-white" : "bg-surface text-textSecondary"
              }`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              aria-pressed={view === "list"}
              className={`p-2 transition ${
                view === "list" ? "bg-primary text-white" : "bg-surface text-textSecondary"
              }`}
            >
              <List size={16} />
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className="bg-surface border border-line rounded-xl p-4 mb-3">
            <p className="text-label uppercase text-textSecondary mb-2">Price range</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                value={draftMin}
                onChange={(e) => setDraftMin(e.target.value)}
                placeholder="Min"
                className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm tabular focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-textMuted">–</span>
              <input
                type="number"
                inputMode="numeric"
                value={draftMax}
                onChange={(e) => setDraftMax(e.target.value)}
                placeholder="Max"
                className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-sm tabular focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button
              onClick={applyPriceFilter}
              className="w-full mt-3 px-4 py-2 rounded-lg bg-primary hover:bg-primaryHover text-white text-sm font-semibold transition"
            >
              Apply
            </button>
          </div>
        )}

        {/* Active filters */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {activeCategory && (
              <FilterChip
                label={activeCategory.name}
                onRemove={() => setCategoryId("")}
              />
            )}
            {minPrice && (
              <FilterChip
                label={`From ${rupiah(minPrice)}`}
                onRemove={() => {
                  setMinPrice("");
                  setDraftMin("");
                }}
              />
            )}
            {maxPrice && (
              <FilterChip
                label={`Up to ${rupiah(maxPrice)}`}
                onRemove={() => {
                  setMaxPrice("");
                  setDraftMax("");
                }}
              />
            )}
            <button
              onClick={clearAll}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Heading */}
        <div className="flex items-baseline justify-between mb-3">
          <h1 className="text-xl font-bold text-textPrimary">
            {search ? `Results for "${search}"` : "Explore"}
          </h1>
          {meta && (
            <span className="text-sm text-textSecondary tabular">
              {meta.total} item{meta.total === 1 ? "" : "s"}
            </span>
          )}
        </div>

        {error && (
          <div className="bg-dangerSoft border border-danger/30 text-danger text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-surface border border-line rounded-xl overflow-hidden">
                <div className="aspect-square bg-ink-100 animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-ink-100 rounded animate-pulse" />
                  <div className="h-3 bg-ink-100 rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="bg-surface border border-line rounded-xl p-12 text-center">
            <p className="text-textSecondary text-sm mb-2">
              Nothing matches that{search ? ` search` : " yet"}.
            </p>
            {activeFilterCount > 0 && (
              <button
                onClick={clearAll}
                className="text-primary text-sm font-semibold hover:underline"
              >
                Clear the filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div
              className={
                view === "grid"
                  ? "grid grid-cols-2 md:grid-cols-4 gap-3"
                  : "flex flex-col gap-3"
              }
            >
              {products.map((product) => (
                <ProductCard key={product.id} product={product} view={view} to={`/product/${product.id}`} />
              ))}
            </div>

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full mt-5 py-3 rounded-xl border border-line bg-surface text-sm font-semibold text-textPrimary hover:bg-ink-100 transition disabled:opacity-60"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            )}

            <p className="text-center text-xs text-textMuted mt-4">
              Showing {products.length} of {meta?.total ?? products.length}
            </p>
          </>
        )}
      </div>

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        className="fixed bottom-20 right-4 md:bottom-6 h-10 w-10 rounded-full bg-surface border border-line text-textSecondary shadow-sm flex items-center justify-center hover:bg-ink-100 transition"
      >
        <ArrowUp size={18} />
      </button>
    </div>
  );
}

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-ink-100 text-textSecondary text-xs rounded-full pl-3 pr-2 py-1.5">
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="hover:text-textPrimary transition"
      >
        <X size={13} />
      </button>
    </span>
  );
}

