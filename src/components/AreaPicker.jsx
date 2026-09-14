import { useState, useEffect, useRef } from "react";
import { apiRequest } from "../api/Client";
import { Search, Check, Loader2, X } from "lucide-react";

const MIN_QUERY = 3;
const DEBOUNCE_MS = 350;

/**
 * Picks a courier delivery area.
 *
 * Couriers price by their own area ids, not by typed city names, so this is
 * what turns an address into something quotable. Used by both address forms —
 * the one on the account page and the one in checkout.
 *
 * Every keystroke here can cost an API call against a daily quota, so it
 * debounces, refuses queries under three characters, and drops responses that
 * arrive out of order.
 */
export default function AreaPicker({ value, onChange, error }) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchError, setSearchError] = useState("");

    const boxRef = useRef(null);
    const abortRef = useRef(null);

    // Close when the click lands outside. Without this the dropdown sits on
    // top of the fields below it and swallows taps meant for them.
    useEffect(() => {
        const onClickAway = (e) => {
            if (boxRef.current && !boxRef.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", onClickAway);
        return () => document.removeEventListener("mousedown", onClickAway);
    }, []);

    useEffect(() => {
        const trimmed = query.trim();

        if (trimmed.length < MIN_QUERY) {
            setResults([]);
            setSearchError("");
            return;
        }

        const timer = setTimeout(async () => {
            // Cancel the previous search. Typing "tangerang" fires several
            // requests, and without this the slowest one can land last and
            // overwrite the results for what the user actually typed.
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            setLoading(true);
            setSearchError("");

            try {
                const res = await apiRequest(
                    `/shipping/areas?q=${encodeURIComponent(trimmed)}`,
                    { signal: controller.signal }
                );

                setResults(res.data || []);
                setOpen(true);
            } catch (err) {
                if (err.name === "AbortError") return;

                setResults([]);
                setSearchError(
                    err.status === 429
                        ? "Too many searches at once. Wait a moment and try again."
                        : "Couldn't search areas right now."
                );
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, DEBOUNCE_MS);

        return () => clearTimeout(timer);
    }, [query]);

    const pick = (area) => {
        onChange(area);
        setQuery("");
        setResults([]);
        setOpen(false);
    };

    const clear = () => {
        onChange({ id: "", label: "" });
        setQuery("");
        setResults([]);
    };

    // Once an area is chosen the search box is replaced by the choice itself.
    // Leaving both visible invites someone to type a new area, not pick it,
    // and walk away thinking it saved.
    if (value?.id) {
        return (
            <div>
                <div className="flex items-start gap-2 rounded-lg border border-primary bg-primarySoft p-3">
                    <Check size={15} className="mt-0.5 shrink-0 text-primary" />
                    <span className="flex-1 min-w-0 text-sm text-textPrimary">
                        {value.label}
                    </span>
                    <button
                        type="button"
                        onClick={clear}
                        aria-label="Change area"
                        className="shrink-0 text-textMuted transition hover:text-textPrimary"
                    >
                        <X size={16} />
                    </button>
                </div>
                {error && <p className="mt-1 text-xs text-danger">{error}</p>}
            </div>
        );
    }

    return (
        <div ref={boxRef} className="relative">
            <div className="relative">
                <Search
                    size={15}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-textMuted"
                />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => results.length && setOpen(true)}
                    placeholder="Search your district, e.g. Cibodas"
                    className={`w-full rounded-lg border bg-surface py-2 pl-9 pr-9 text-base transition focus:outline-none focus:ring-2 ${
                        error
                            ? "border-danger focus:ring-danger"
                            : "border-line focus:ring-primary"
                    }`}
                />
                {loading && (
                    <Loader2
                        size={15}
                        className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-textMuted"
                    />
                )}
            </div>

            {query.trim().length > 0 && query.trim().length < MIN_QUERY && (
                <p className="mt-1 text-xs text-textMuted">
                    Type at least {MIN_QUERY} characters.
                </p>
            )}

            {searchError && <p className="mt-1 text-xs text-danger">{searchError}</p>}
            {error && !searchError && <p className="mt-1 text-xs text-danger">{error}</p>}

            {open && results.length > 0 && (
                <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-line bg-surface shadow-lg">
                    {results.map((area) => (
                        <li key={area.id}>
                            <button
                                type="button"
                                onClick={() => pick(area)}
                                className="w-full border-b border-line px-3 py-2.5 text-left text-sm text-textPrimary transition last:border-0 hover:bg-primarySoft"
                            >
                                {area.label}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {open && !loading && results.length === 0 && query.trim().length >= MIN_QUERY && !searchError && (
                <div className="absolute z-20 mt-1 w-full rounded-lg border border-line bg-surface px-3 py-3 text-sm text-textSecondary shadow-lg">
                    No areas match that. Try the kecamatan name instead of the
                    street.
                </div>
            )}
        </div>
    );
}