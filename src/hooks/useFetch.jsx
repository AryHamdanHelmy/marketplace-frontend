import { useState, useEffect } from "react";
import { apiRequest } from "../api/Client";

/**
 * Custom hook buat GET request standar (fetch on mount / on deps change).
 *
 * @param {string|null} endpoint - path API, mis. "/users?page=1". Kalau null, fetch di-skip.
 * @param {Array} deps - dependency array, sama kayak useEffect. Fetch ulang tiap ini berubah.
 * @returns {{ data, loading, error, refetch }}
 */
export function useFetch(endpoint, deps = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (!endpoint) {
            setLoading(false);
            return;
        }

        let ignore = false;

        async function fetchData() {
            try {
                setLoading(true);
                setError(null);
                const res = await apiRequest(endpoint);
                if (!ignore) {
                    setData(res);
                }
            } catch (err) {
                if (!ignore) {
                    setError(err.message || "Something went wrong");
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        fetchData();

        return () => {
            ignore = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endpoint, reloadKey, ...deps]);

    // Buat manual refetch tanpa perlu ganti deps (mis. setelah aksi lain yang gak terkait state deps)
    const refetch = () => setReloadKey((k) => k + 1);

    return { data, loading, error, refetch, setData };
}