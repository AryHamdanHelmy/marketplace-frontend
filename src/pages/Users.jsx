import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";

const PER_PAGE = 10;

export default function Users() {
    const [users, setUsers] = useState([]);
    const [meta, setMeta] = useState(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        let ignore = false;
        async function fetchUsers() {
            try {
                setLoading(true);
                setError(null);
                const res = await apiRequest(`/users?page=${page}&per_page=${PER_PAGE}`);
                if (!ignore) {
                    setUsers(res.data || []);
                    setMeta(res.meta || null);
                }
            } catch (err) {
                if (!ignore) {
                    setError(err.message || "Terjadi kesalahan saat memuat data");
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        fetchUsers();

        return () => {
            ignore = true;
        };
    }, [page]);

    const goToPage = (newPage) => {
        if (newPage < 1) return;
        if (meta && newPage > meta.last_page) return;
        setPage(newPage);
    };

    const handleDelete = async (userId) => {
        const confirmDelete = window.confirm(
            `Apakah anda yakin ingin menghapus pengguna dengan ID ${userId}?`
        );
        if (!confirmDelete) return;
        setDeletingId(userId);
        try {
            await apiRequest(`/users/${userId}`, { method: "DELETE" });
            setUsers((prev) => prev.filter((u) => u.id !== userId));
        } catch (err) {
            alert(err.message || "Gagal menghapus pengguna");
        } finally {
            setDeletingId(null);
        }
    }
    return (
        <div className="min-h-screen bg-hitam text-white pt-24 px-6 py-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-semibold mb-6">User List</h1>

                {loading && <p className="text-gray-400">Load user data...</p>}

                {!loading && error && (
                    <p className="text-red-400">Error: {error}</p>
                )}

                {!loading && !error && users.length === 0 && (
                    <p className="text-gray-400">Don't have user data.</p>
                )}

                {!loading && !error && users.length > 0 && (
                    <>
                        <div className="overflow-x-auto rounded-lg border border-white/10">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-white/5">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-gray-300">No.</th>
                                        <th className="px-4 py-3 font-medium text-gray-300">Name</th>
                                        <th className="px-4 py-3 font-medium text-gray-300">Role</th>
                                        <th className="px-4 py-3 font-medium text-gray-300 text-right">
                                            Detail
                                        </th>
                                        <th className="px-4 py-3 font-medium text-gray-300">Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, idx) => (
                                        <tr
                                            key={user.id ?? idx}
                                            className="border-t border-white/10 hover:bg-white/5"
                                        >
                                            <td className="px-4 py-3 text-gray-200">
                                                {meta ? (meta.current_page - 1) * meta.per_page + idx + 1 : idx + 1}
                                            </td>
                                            <td className="px-4 py-3 text-gray-200">{user.name}</td>
                                            <td className="px-4 py-3 text-gray-200">{user.role}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Link
                                                    to={`/users/${user.id}`}
                                                    className="text-indigo-400 hover:underline"
                                                >Show
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => handleDelete(user.id, user.name)}
                                                    disabled={deletingId === user.id}
                                                    className="text-red-400 hover:text-red-300 text-xs font-semibold disabled:opacity-50"
                                                >
                                                    {deletingId === user.id ? "Menghapus..." : "Delete"}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {meta && (
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4 text-sm text-gray-400">
                                <p className="text-center md:text-left">
                                    Halaman {meta.current_page} dari {meta.last_page} — total{" "}
                                    {meta.total} pengguna
                                </p>

                                <div className="flex items-center justify-center gap-2 flex-wrap">
                                    <button
                                        onClick={() => goToPage(meta.current_page - 1)}
                                        disabled={meta.current_page <= 1}
                                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                    >
                                        ← Prev
                                    </button>

                                    <PageNumbers meta={meta} onGoToPage={goToPage} />

                                    <button
                                        onClick={() => goToPage(meta.current_page + 1)}
                                        disabled={meta.current_page >= meta.last_page}
                                        className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition"
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

function PageNumbers({ meta, onGoToPage }) {
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
                    className={`w-8 h-8 rounded-lg text-sm transition ${
                        p === current_page
                            ? "bg-indigo-600 text-white"
                            : "bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300"
                    }`}
                >
                    {p}
                </button>
            ))}
        </div>
    );
}