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
            `Are you sure you want to delete the user with ID ${userId}?`
        );
        if (!confirmDelete) return;
        setDeletingId(userId);
        try {
            await apiRequest(`/users/${userId}`, { method: "DELETE" });
            setUsers((prev) => prev.filter((u) => u.id !== userId));
        } catch (err) {
            alert(err.message || "Failed to delete user");
        } finally {
            setDeletingId(null);
        }
    }
    return (
        <div className="min-h-screen text-darkblue pt-24 px-6 py-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-semibold mb-6">User List</h1>

                {loading && <p className="text-gray-400">Load user data...</p>}

                {!loading && error && (
                    <p className="text-red-400">Error: {error}</p>
                )}

                {!loading && !error && users.length === 0 && (
                    <p className="text-gray-400">No users found.</p>
                )}

                {!loading && !error && users.length > 0 && (
                    <>
                        <div className="overflow-x-auto bg-white rounded-lg border-2 border-black/50">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-darkblue/90">
                                    <tr>
                                        <th className="px-4 py-3 font-medium text-pastel-green">No.</th>
                                        <th className="px-4 py-3 font-medium text-pastel-green">Name</th>
                                        <th className="px-4 py-3 font-medium text-pastel-green">Role</th>
                                        <th className="px-4 py-3 font-medium text-pastel-green text-right">
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
                                            <td className="px-4 py-3 text-darkblue">
                                                {meta ? (meta.current_page - 1) * meta.per_page + idx + 1 : idx + 1}
                                            </td>
                                            <td className="px-4 py-3 text-darkblue">{user.name}</td>
                                            <td className="px-4 py-3 text-darkblue">{user.role}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Link
                                                    to={`/users/${user.id}`}
                                                    className="text-pastelgreen hover:underline"
                                                >Show
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => handleDelete(user.id, user.name)}
                                                    disabled={deletingId === user.id}
                                                    className="text-red-400 hover:text-red-300 text-xs font-semibold disabled:opacity-50"
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
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-4 text-sm text-black">
                                <p className="text-center md:text-left">
                                    Page {meta.current_page} of {meta.last_page} — {meta.total} users total
                                </p>

                                <div className="flex items-center justify-center gap-2 flex-wrap">
                                    <button
                                        onClick={() => goToPage(meta.current_page - 1)}
                                        disabled={meta.current_page <= 1}
                                        className="px-3 py-1.5 rounded-lg bg-pastel-cyan/20 border border-pastel-cyan/35 hover:bg-pastel-cyan/30 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                    >
                                        ← Prev
                                    </button>

                                    <PageNumbers meta={meta} onGoToPage={goToPage} />

                                    <button
                                        onClick={() => goToPage(meta.current_page + 1)}
                                        disabled={meta.current_page >= meta.last_page}
                                        className="px-3 py-1.5 rounded-lg bg-pastel-cyan/20 border border-pastel-cyan/35 hover:bg-pastel-cyan/30 disabled:opacity-40 disabled:cursor-not-allowed transition"
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
                            ? "bg-pastelblue text-white"
                            : "bg-black/5 border border-black/10 hover:bg-black/10 text-black"
                    }`}
                >
                    {p}
                </button>
            ))}
        </div>
    );
}