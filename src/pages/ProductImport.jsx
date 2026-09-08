import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { apiRequest } from "../api/Client";
import SellerSidebar from "../components/organisms/SellerSidebar";
import { Download, Upload, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

export default function ProductImport() {
    const [tab, setTab] = useState("upload");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [serverError, setServerError] = useState("");
    const [result, setResult] = useState(null);
    const [dragging, setDragging] = useState(false);
    const fileInputRef = useRef(null);

    const { data: historyRes, loading: loadingHistory, refetch } = useFetch("/product-import/history", []);
    const history = historyRes?.data || [];

    const formatDate = (iso) =>
        new Date(iso).toLocaleString("id-ID", {
            day: "numeric", month: "short", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });

    const handleDownloadTemplate = async () => {
        try {
            const token = localStorage.getItem("token");
            const baseUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

            const res = await fetch(`${baseUrl}/product-import/template`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Failed to download template");

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `template-produk-${new Date().toISOString().slice(0, 10)}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            setServerError(err.message || "Failed to download template");
        }
    };

    const handleFileSelect = async (selectedFile) => {
        if (!selectedFile) return;

        const validTypes = [".xlsx", ".xls"];
        const isValid = validTypes.some((ext) =>
            selectedFile.name.toLowerCase().endsWith(ext)
        );

        if (!isValid) {
            setServerError("Only .xlsx files are supported");
            return;
        }

        setFile(selectedFile);
        setServerError("");
        setResult(null);
        setUploading(true);

        // Kirim ke preview dulu — validasi tanpa menyimpan
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const res = await apiRequest("/product-import/preview", {
                method: "POST",
                body: formData,
            });
            setPreview(res.data);
        } catch (err) {
            setServerError(err.message || "Failed to read file");
            setPreview(null);
            setFile(null);
        } finally {
            setUploading(false);
        }
    };

    const handleConfirmImport = async () => {
        if (!file || saving) return;

        setSaving(true);
        setServerError("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await apiRequest("/product-import", {
                method: "POST",
                body: formData,
            });
            setResult(res.data);
            setPreview(null);
            setFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
            refetch();
        } catch (err) {
            setServerError(err.message || "Import failed");
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setFile(null);
        setPreview(null);
        setResult(null);
        setServerError("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <>
            <SellerSidebar />
            <div className="min-h-screen bg-gray-50 pt-24 px-5 pb-12 md:pl-70 md:pr-10">
                <div className="max-w-4xl mx-auto">

                    <h1 className="text-2xl font-bold text-textPrimary mb-1">Mass Upload</h1>
                    <p className="text-sm text-textSecondary mb-6">
                        Upload multiple products at once using an Excel file.
                    </p>

                    {/* Tabs */}
                    <div className="flex gap-6 border-b border-lineStrong mb-6">
                        <button
                            onClick={() => setTab("template")}
                            className={`pb-3 text-sm font-medium transition relative ${
                                tab === "template"
                                    ? "text-textPrimary"
                                    : "text-textSecondary hover:text-textPrimary"
                            }`}
                        >
                            Download Template
                            {tab === "template" && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                            )}
                        </button>
                        <button
                            onClick={() => setTab("upload")}
                            className={`pb-3 text-sm font-medium transition relative ${
                                tab === "upload"
                                    ? "text-textPrimary"
                                    : "text-textSecondary hover:text-textPrimary"
                            }`}
                        >
                            Upload File
                            {tab === "upload" && (
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary" />
                            )}
                        </button>
                    </div>

                    {serverError && (
                        <div className="bg-red-50 border border-red-200 text-danger text-sm rounded-xl px-4 py-3 mb-4">
                            {serverError}
                        </div>
                    )}

                    {/* --- Tab: Download Template --- */}
                    {tab === "template" && (
                        <div className="bg-white border border-lineStrong rounded-xl p-8 text-center">
                            <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                                <FileSpreadsheet size={26} className="text-success" />
                            </div>
                            <h2 className="text-base font-bold text-textPrimary mb-2">
                                Download the Excel template
                            </h2>
                            <p className="text-sm text-textSecondary max-w-md mx-auto mb-6 leading-relaxed">
                                The template includes a category dropdown so you don't have to type
                                category names manually. Fill it in, then upload it in the next tab.
                            </p>

                            <button
                                onClick={handleDownloadTemplate}
                                className="inline-flex items-center gap-2 bg-primary hover:bg-pastel-cyan text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition"
                            >
                                <Download size={16} />
                                Download Template
                            </button>

                            <div className="mt-8 pt-6 border-t border-gray-100 text-left max-w-md mx-auto">
                                <p className="text-xs font-bold text-textSecondary uppercase tracking-wide mb-3">
                                    Notes
                                </p>
                                <ul className="text-xs text-gray-500 space-y-2 leading-relaxed">
                                    <li>• Required columns: name, category, price, stock</li>
                                    <li>• Maximum 200 rows per file</li>
                                    <li>• Imported products are saved as <strong>draft</strong> — add images before publishing</li>
                                    <li>• Delete the example row before uploading</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* --- Tab: Upload File --- */}
                    {tab === "upload" && (
                        <>
                            {/* Hasil import */}
                            {result && (
                                <div className="bg-white border border-lineStrong rounded-xl p-6 mb-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                            <CheckCircle size={20} className="text-success" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-bold text-textPrimary mb-1">
                                                {result.success_count} products imported
                                            </h3>
                                            <p className="text-xs text-textSecondary mb-3">
                                                Saved as draft. Add images before publishing them.
                                            </p>

                                            {result.failed_count > 0 && (
                                                <div className="bg-amber-50 border border-line rounded-lg px-3 py-2 mb-3">
                                                    <p className="text-xs text-danger font-medium mb-1">
                                                        {result.failed_count} rows were skipped
                                                    </p>
                                                    <ul className="text-[11px] text-danger space-y-0.5">
                                                        {result.errors?.slice(0, 5).map((err, i) => (
                                                            <li key={i}>• {err}</li>
                                                        ))}
                                                        {result.errors?.length > 5 && (
                                                            <li>• and {result.errors.length - 5} more...</li>
                                                        )}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                <Link
                                                    to="/seller/dashboard"
                                                    className="text-xs font-semibold text-textPrimary hover:underline"
                                                >
                                                    View products →
                                                </Link>
                                                <span className="text-textSecondary">|</span>
                                                <button
                                                    onClick={handleReset}
                                                    className="text-xs font-semibold text-textSecondary hover:text-textPrimary"
                                                >
                                                    Upload another file
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Dropzone */}
                            {!preview && !result && (
                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                    onDragLeave={() => setDragging(false)}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        setDragging(false);
                                        handleFileSelect(e.dataTransfer.files[0]);
                                    }}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`bg-white border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition ${
                                        dragging
                                            ? "border-pastel-blue bg-blue-50/40"
                                            : "border-lineStrong hover:border-pastel-blue hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                                        <Upload size={24} className="text-textSecondary" />
                                    </div>

                                    {uploading ? (
                                        <p className="text-sm text-gray-500">Reading file...</p>
                                    ) : (
                                        <>
                                            <p className="text-sm font-medium text-textPrimary mb-1">
                                                Drop your Excel file here, or click to browse
                                            </p>
                                            <p className="text-xs text-textSecondary">
                                                Max 3 MB · .xlsx only
                                            </p>
                                        </>
                                    )}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={(e) => handleFileSelect(e.target.files[0])}
                                        className="hidden"
                                    />
                                </div>
                            )}

                            {/* Pratinjau */}
                            {preview && (
                                <div className="bg-white border border-lineStrong rounded-xl overflow-hidden mb-6">
                                    {/* Ringkasan */}
                                    <div className="px-5 py-4 bg-gray-50 border-b border-gray-100">
                                        <div className="flex items-center justify-between gap-3 mb-3">
                                            <p className="text-sm font-semibold text-textPrimary truncate">
                                                {preview.file_name}
                                            </p>
                                            <button
                                                onClick={handleReset}
                                                className="text-xs text-textSecondary hover:text-textPrimary shrink-0"
                                            >
                                                Change file
                                            </button>
                                        </div>

                                        <div className="flex gap-4 text-xs">
                                            <span className="text-gray-500">
                                                {preview.total_rows} rows
                                            </span>
                                            <span className="text-emerald-600 font-medium">
                                                {preview.valid_count} valid
                                            </span>
                                            {preview.error_count > 0 && (
                                                <span className="text-red-500 font-medium">
                                                    {preview.error_count} errors
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Tabel baris */}
                                    <div className="overflow-x-auto max-h-96">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-gray-50 text-textSecondary uppercase tracking-wide border-b border-gray-100 sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-2.5 font-semibold w-12">#</th>
                                                    <th className="px-4 py-2.5 font-semibold">Name</th>
                                                    <th className="px-4 py-2.5 font-semibold">Category</th>
                                                    <th className="px-4 py-2.5 font-semibold">Price</th>
                                                    <th className="px-4 py-2.5 font-semibold">Stock</th>
                                                    <th className="px-4 py-2.5 font-semibold">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {preview.rows.map((row) => (
                                                    <tr
                                                        key={row.row}
                                                        className={row.is_valid ? "" : "bg-red-50/50"}
                                                    >
                                                        <td className="px-4 py-2.5 text-textSecondary">{row.row}</td>
                                                        <td className="px-4 py-2.5 text-textPrimary font-medium">
                                                            {row.name || <span className="text-gray-300">—</span>}
                                                        </td>
                                                        <td className="px-4 py-2.5 text-gray-500">
                                                            {row.category || <span className="text-gray-300">—</span>}
                                                        </td>
                                                        <td className="px-4 py-2.5 text-gray-500">
                                                            {row.price !== null
                                                                ? new Intl.NumberFormat("id-ID").format(row.price)
                                                                : <span className="text-gray-300">—</span>}
                                                        </td>
                                                        <td className="px-4 py-2.5 text-gray-500">{row.stock}</td>
                                                        <td className="px-4 py-2.5">
                                                            {row.is_valid ? (
                                                                <span className="inline-flex items-center gap-1 text-emerald-600">
                                                                    <CheckCircle size={12} /> Valid
                                                                </span>
                                                            ) : (
                                                                <div className="flex flex-col gap-0.5">
                                                                    {row.errors.map((err, i) => (
                                                                        <span key={i} className="inline-flex items-start gap-1 text-red-500">
                                                                            <XCircle size={12} className="shrink-0 mt-0.5" />
                                                                            {err}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Aksi */}
                                    <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                                        {preview.error_count > 0 ? (
                                            <p className="text-xs text-amber-600 flex items-center gap-1.5">
                                                <AlertTriangle size={13} />
                                                Invalid rows will be skipped
                                            </p>
                                        ) : (
                                            <span />
                                        )}

                                        <button
                                            onClick={handleConfirmImport}
                                            disabled={saving || preview.valid_count === 0}
                                            className="bg-primary hover:bg-pastel-cyan text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
                                        >
                                            {saving
                                                ? "Importing..."
                                                : `Import ${preview.valid_count} products`}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Riwayat */}
                            <div className="bg-white border border-lineStrong rounded-xl overflow-hidden mt-6">
                                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                                    <h2 className="text-xs font-bold text-textSecondary uppercase tracking-widest">
                                        Upload History
                                    </h2>
                                </div>

                                {loadingHistory && (
                                    <div className="p-5 flex flex-col gap-2">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                                        ))}
                                    </div>
                                )}

                                {!loadingHistory && history.length === 0 && (
                                    <p className="text-textSecondary text-sm p-8 text-center">
                                        No upload history yet.
                                    </p>
                                )}

                                {!loadingHistory && history.length > 0 && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead className="bg-gray-50 text-textSecondary uppercase tracking-wide border-b border-gray-100">
                                                <tr>
                                                    <th className="px-5 py-2.5 font-semibold">Date</th>
                                                    <th className="px-5 py-2.5 font-semibold">File</th>
                                                    <th className="px-5 py-2.5 font-semibold">Result</th>
                                                    <th className="px-5 py-2.5 font-semibold">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {history.map((item) => (
                                                    <tr key={item.id} className="hover:bg-gray-50 transition">
                                                        <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                                                            {formatDate(item.created_at)}
                                                        </td>
                                                        <td className="px-5 py-3 text-textPrimary truncate max-w-45">
                                                            {item.file_name}
                                                        </td>
                                                        <td className="px-5 py-3 text-gray-500">
                                                            <span className="text-emerald-600 font-medium">
                                                                {item.success_count}
                                                            </span>
                                                            {" / "}
                                                            {item.total_rows}
                                                            {item.failed_count > 0 && (
                                                                <span className="text-red-400 ml-1">
                                                                    ({item.failed_count} failed)
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-3">
                                                            <span className={`inline-flex px-2 py-0.5 rounded-full font-medium capitalize ${
                                                                item.status === "completed"
                                                                    ? "bg-emerald-100 text-emerald-700"
                                                                    : "bg-amber-100 text-amber-600"
                                                            }`}>
                                                                {item.status === "completed" ? "Success" : "Partial"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}