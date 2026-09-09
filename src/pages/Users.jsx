import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/Client";
import { useFetch } from "../hooks/useFetch";

const PER_PAGE = 10;

export default function Users() {
    const [page, setPage] = useState(1);
    const [deletingId, setDeletingId] = useState(null);

    const { data, loading, error, setData } = useFetch(
        `/users?page=${page}&per_page=${PER_PAGE}`,
        [page]
    );

    // Ambil users & meta dari response, dengan fallback aman kalau data belum ada
    const users = data?.data || [];
    const meta = data?.meta || null;

    const goToPage = (newPage) => {
        if (newPage < 1) return;
        if (meta && newPage > meta.last_page) return;
        setPage(newPage);
    };

    const handleDelete = async (userId) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete the user with ID ${userId}?`
        );
        if (!confirmDelete) return;
        setDeletingId(userId);
        try {
            await apiRequest(`/users/${userId}`, { method: "DELETE" });
            // Update data lokal lewat setData dari useFetch, tanpa perlu refetch ke server
            setData((prev) => ({
                ...prev,
                data: prev.data.filter((u) => u.id !== userId),
            }));
        } catch (err) {
            alert(err.message || "Failed to delete user");
        } finally {
            setDeletingId(null);
        }
    }
    return (
        <div className="min-h-screen text-textPrimary pt-24 px-6 py-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-semibold mb-6">User List</h1>

                {/* Loading text cuma muncul pas belum ada data sama sekali (first load) */}
                {loading && users.length === 0 && (
                    <p className="text-textSecondary">Load user data...</p>
                )}

                {!loading && error && (
                    <p className="text-danger">Error: {error}</p>
                )}

                {!loading && !error && users.length === 0 && (
                    <p className="text-textSecondary">No users found.</p>
                )}

                {/* Tabel tetap tampil selama ada data, gak peduli status loading -
                    biar pas ganti halaman gak ngilang total & bikin layout collapse */}
                {users.length > 0 && (
                    <>
                        <div
                            className={`overflow-x-auto bg-surface rounded-lg border-2 border-line transition-opacity ${
                                loading ? "opacity-50 pointer-events-none" : "opacity-100"
                            }`}
                        >
                            <table className="w-full text-left text-sm">
                                <thead className="bg-surface">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-textMuted">No.</th>
                                        <th className="px-4 py-3 font-medium text-textMuted">Name</th>
                                        <th className="px-4 py-3 font-medium text-textMuted">Role</th>
                                        <th className="px-4 py-3 font-medium text-textMuted text-right">
                                            Detail
                                        </th>
                                        <th className="px-4 py-3 font-medium text-textMuted">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, idx) => (
                                        <tr
                                            key={user.id ?? idx}
                                            className="border-t border-line hover:bg-surfaceAlt"
                                        >
                                            <td className="px-4 py-3 text-textPrimary">
                                                {meta ? (meta.current_page - 1) * meta.per_page + idx + 1 : idx + 1}
                                            </td>
                                            <td className="px-4 py-3 text-textPrimary">{user.name}</td>
                                            <td className="px-4 py-3 text-textPrimary">{user.role}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Link
                                                    to={`/users/${user.id}`}
                                                    className="text-success hover:underline"
                                                >Show
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => handleDelete(user.id, user.name)}
                                                    disabled={deletingId === user.id}
                                                    className="text-primary hover:text-danger text-xs font-semibold disabled:opacity-50"
                                                >
                                                    {deletingId === user.id ? "Deleting..." : "Delete"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {meta && (
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4 text-sm text-textPrimary">
                                <p className="text-center md:text-left">
                                    Page {meta.current_page} of {meta.last_page} — {meta.total} users total
                                </p>

                                <div className="flex items-center justify-center gap-2 flex-wrap">
                                    <button
                                        onClick={() => goToPage(meta.current_page - 1)}
                                        disabled={meta.current_page <= 1 || loading}
                                        className="px-3 py-1.5 rounded-lg bg-surface border border-line hover:bg-primaryHover disabled:opacity-40 disabled:cursor-not-allowed transition"
                                    >
                                        ← Prev
                                    </button>

                                    <PageNumbers meta={meta} onGoToPage={goToPage} disabled={loading} />

                                    <button
                                        onClick={() => goToPage(meta.current_page + 1)}
                                        disabled={meta.current_page >= meta.last_page || loading}
                                        className="px-3 py-1.5 rounded-lg bg-surface border border-line hover:bg-primaryHover disabled:opacity-40 disabled:cursor-not-allowed transition"
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function PageNumbers({ meta, onGoToPage, disabled }) {
    const { current_page, last_page } = meta;

    // Tampilkan maksimal 5 nomor halaman di sekitar halaman aktif
    const start = Math.max(1, current_page - 2);
    const end = Math.min(last_page, start + 4);

    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);

    return (
        <div className="flex items-center gap-1 flex-wrap justify-center">
            {pages.map((p) => (
                <button
                    key={p}
                    onClick={() => onGoToPage(p)}
                    disabled={disabled}
                    className={`w-8 h-8 rounded-lg text-sm transition disabled:opacity-40 disabled:cursor-not-allowed ${
                        p === current_page
                            ? "bg-primary text-white"
                            : "bg-black/5 border border-line hover:bg-primaryHover text-textPrimary"
                    }`}
                >
                    {p}
                </button>
            ))}
        </div>
    );
}