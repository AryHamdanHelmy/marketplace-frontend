import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/Client";
import { useFetch } from "../hooks/useFetch";
import {
    ChevronLeft, ChevronRight, Trash2, ChevronRight as Arrow,
    Shield, Store, ShoppingBag,
} from "lucide-react";

const PER_PAGE = 10;

const ROLE_STYLE = {
    admin:  { className: "bg-accentSoft text-accent",   icon: Shield },
    seller: { className: "bg-primarySoft text-primary", icon: Store },
    buyer:  { className: "bg-ink-100 text-textSecondary", icon: ShoppingBag },
};

export default function Users() {
    const [page, setPage] = useState(1);
    const [deletingId, setDeletingId] = useState(null);
    const [actionError, setActionError] = useState("");

    const { data, loading, error, setData } = useFetch(
        `/users?page=${page}&per_page=${PER_PAGE}`,
        [page]
    );

    const users = data?.data || [];
    const meta = data?.meta || null;

    const goToPage = (newPage) => {
        if (newPage < 1) return;
        if (meta && newPage > meta.last_page) return;
        setPage(newPage);
    };

    const handleDelete = async (user) => {
        const confirmed = window.confirm(
            `Delete ${user.name}? Their email is released so they can sign up again, but past orders stay on record.`
        );
        if (!confirmed) return;

        setDeletingId(user.id);
        setActionError("");

        try {
            await apiRequest(`/users/${user.id}`, { method: "DELETE" });

            // Updated locally rather than refetched, so the table doesn't
            // flash empty while a request goes out.
            setData((prev) => ({
                ...prev,
                data: prev.data.filter((u) => u.id !== user.id),
            }));
        } catch (err) {
            // An alert() covers the page and loses the admin's place
            setActionError(err.message || "Couldn't delete that user.");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-background text-textPrimary pt-24 px-4 pb-12">
            <div className="max-w-4xl mx-auto">

                <h1 className="text-2xl font-bold mb-1">Users</h1>
                <p className="text-sm text-textSecondary mb-5">
                    Everyone with a Rapaku account.
                </p>

                {actionError && (
                    <div className="bg-dangerSoft border border-danger/30 text-danger text-sm rounded-lg px-4 py-3 mb-4">
                        {actionError}
                    </div>
                )}

                {loading && users.length === 0 && (
                    <p className="text-sm text-textSecondary">Loading...</p>
                )}

                {!loading && error && (
                    <p className="text-sm text-danger">Error: {error}</p>
                )}

                {!loading && !error && users.length === 0 && (
                    <div className="bg-surface border border-line rounded-xl p-12 text-center">
                        <p className="text-sm text-textSecondary">No users found.</p>
                    </div>
                )}

                {users.length > 0 && (
                    <>
                        {/* Kept mounted while loading so switching pages doesn't
                            collapse the layout and jump the scroll position. */}
                        <div
                            className={`transition-opacity ${
                                loading ? "opacity-50 pointer-events-none" : ""
                            }`}
                        >
                            {/* Mobile: cards. A five-column table on a phone means
                                scrolling sideways to reach the delete button. */}
                            <div className="space-y-3 md:hidden">
                                {users.map((user) => (
                                    <UserCard
                                        key={user.id}
                                        user={user}
                                        deleting={deletingId === user.id}
                                        onDelete={() => handleDelete(user)}
                                    />
                                ))}
                            </div>

                            {/* Desktop: table */}
                            <div className="hidden md:block bg-surface border border-line rounded-xl overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-surfaceAlt border-b border-line">
                                        <tr>
                                            <th className="px-4 py-3 text-label uppercase text-textSecondary w-12">
                                                #
                                            </th>
                                            <th className="px-4 py-3 text-label uppercase text-textSecondary">
                                                User
                                            </th>
                                            <th className="px-4 py-3 text-label uppercase text-textSecondary">
                                                Role
                                            </th>
                                            <th className="px-4 py-3 text-label uppercase text-textSecondary text-right">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((user, idx) => (
                                            <tr
                                                key={user.id}
                                                className="border-t border-line hover:bg-surfaceAlt transition"
                                            >
                                                <td className="px-4 py-3 text-textMuted tabular">
                                                    {meta
                                                        ? (meta.current_page - 1) * meta.per_page + idx + 1
                                                        : idx + 1}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <p className="text-textPrimary font-medium">
                                                        {user.name}
                                                    </p>
                                                    <p className="text-xs text-textSecondary">
                                                        {user.email}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <RoleBadge role={user.role} />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Link
                                                            to={`/users/${user.id}`}
                                                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-primary hover:bg-primarySoft transition"
                                                        >
                                                            Details
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(user)}
                                                            disabled={deletingId === user.id}
                                                            aria-label={`Delete ${user.name}`}
                                                            className="p-2 rounded-lg text-textSecondary hover:text-danger hover:bg-dangerSoft transition disabled:opacity-40"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {meta && meta.last_page > 1 && (
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-5">
                                <p className="text-xs text-textSecondary text-center md:text-left">
                                    Page {meta.current_page} of {meta.last_page} ·{" "}
                                    <span className="tabular">{meta.total}</span> users
                                </p>

                                <div className="flex items-center justify-center gap-1.5">
                                    <PageButton
                                        onClick={() => goToPage(meta.current_page - 1)}
                                        disabled={meta.current_page <= 1 || loading}
                                        label="Previous page"
                                    >
                                        <ChevronLeft size={16} />
                                    </PageButton>

                                    <PageNumbers meta={meta} onGoToPage={goToPage} disabled={loading} />

                                    <PageButton
                                        onClick={() => goToPage(meta.current_page + 1)}
                                        disabled={meta.current_page >= meta.last_page || loading}
                                        label="Next page"
                                    >
                                        <ChevronRight size={16} />
                                    </PageButton>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function UserCard({ user, deleting, onDelete }) {
    return (
        <div
            className={`bg-surface border border-line rounded-xl p-4 transition-opacity ${
                deleting ? "opacity-50" : ""
            }`}
        >
            <div className="flex items-start gap-3">
                <span className="h-10 w-10 rounded-full bg-ink-100 text-textSecondary flex items-center justify-center shrink-0 font-semibold">
                    {user.name?.charAt(0)?.toUpperCase() || "?"}
                </span>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-textPrimary truncate">
                        {user.name}
                    </p>
                    <p className="text-xs text-textSecondary truncate">{user.email}</p>
                    <div className="mt-2">
                        <RoleBadge role={user.role} />
                    </div>
                </div>

                <button
                    onClick={onDelete}
                    disabled={deleting}
                    aria-label={`Delete ${user.name}`}
                    className="p-2 rounded-lg text-textSecondary hover:text-danger hover:bg-dangerSoft transition disabled:opacity-40 shrink-0"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            <Link
                to={`/users/${user.id}`}
                className="mt-3 pt-3 border-t border-line flex items-center justify-between text-sm font-semibold text-primary"
            >
                View details
                <Arrow size={15} />
            </Link>
        </div>
    );
}

function RoleBadge({ role }) {
    const style = ROLE_STYLE[role] || ROLE_STYLE.buyer;
    const Icon = style.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${style.className}`}
        >
            <Icon size={12} />
            {role}
        </span>
    );
}

function PageButton({ children, onClick, disabled, label }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className="h-9 w-9 flex items-center justify-center rounded-lg bg-surface border border-line text-textSecondary hover:bg-ink-100 hover:text-textPrimary transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
            {children}
        </button>
    );
}

function PageNumbers({ meta, onGoToPage, disabled }) {
    const { current_page, last_page } = meta;

    // At most five numbers, centred on the current page
    const start = Math.max(1, Math.min(current_page - 2, last_page - 4));
    const end = Math.min(last_page, start + 4);

    const pages = [];
    for (let i = Math.max(1, start); i <= end; i++) pages.push(i);

    return (
        <>
            {pages.map((p) => (
                <button
                    key={p}
                    onClick={() => onGoToPage(p)}
                    disabled={disabled}
                    aria-current={p === current_page ? "page" : undefined}
                    className={`h-9 w-9 rounded-lg text-sm tabular transition disabled:opacity-40 disabled:cursor-not-allowed ${
                        p === current_page
                            ? "bg-primary text-white font-semibold"
                            : "bg-surface border border-line text-textPrimary hover:bg-ink-100"
                    }`}
                >
                    {p}
                </button>
            ))}
        </>
    );
}