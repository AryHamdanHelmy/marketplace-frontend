import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/Client";
import { useAuth } from "../context/AuthContext";
import {
    User, MapPin, Lock, Plus, Pencil, Trash2, Check, Star,
    Eye, EyeOff, Store, Receipt,
} from "lucide-react";

const TABS = [
    { value: "profile", label: "Profile", icon: User },
    { value: "addresses", label: "Addresses", icon: MapPin },
    { value: "security", label: "Security", icon: Lock },
];

export default function Account() {
    const { user } = useAuth();
    const [tab, setTab] = useState("profile");
    const [banner, setBanner] = useState({ type: "", message: "" });

    const notify = (type, message) => {
        setBanner({ type, message });
        setTimeout(() => setBanner({ type: "", message: "" }), 4000);
    };

    return (
        <div className="min-h-screen bg-background pt-20 pb-12 px-4">
            <div className="max-w-2xl mx-auto">

                {/* Header */}
                <div className="flex items-center gap-4 mb-5">
                    <span className="h-14 w-14 rounded-full bg-primarySoft flex items-center justify-center shrink-0">
                        <User size={24} className="text-primary" />
                    </span>
                    <div className="min-w-0">
                        <h1 className="text-heading text-textPrimary truncate">
                            {user?.name}
                        </h1>
                        <p className="text-sm text-textSecondary truncate">{user?.email}</p>
                    </div>
                </div>

                {/* Shortcuts */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    <Link
                        to="/orders"
                        className="flex items-center gap-3 bg-surface border border-line rounded-xl p-4 hover:border-lineStrong transition"
                    >
                        <Receipt size={18} className="text-primary shrink-0" />
                        <span className="text-sm font-semibold text-textPrimary">
                            My orders
                        </span>
                    </Link>
                    {user?.role === "seller" ? (
                        <Link
                            to="/seller/dashboard"
                            className="flex items-center gap-3 bg-surface border border-line rounded-xl p-4 hover:border-lineStrong transition"
                        >
                            <Store size={18} className="text-primary shrink-0" />
                            <span className="text-sm font-semibold text-textPrimary">
                                Seller Center
                            </span>
                        </Link>
                    ) : (
                        <Link
                            to="/explore"
                            className="flex items-center gap-3 bg-surface border border-line rounded-xl p-4 hover:border-lineStrong transition"
                        >
                            <Store size={18} className="text-primary shrink-0" />
                            <span className="text-sm font-semibold text-textPrimary">
                                Keep browsing
                            </span>
                        </Link>
                    )}
                </div>

                {banner.message && (
                    <div
                        className={`text-sm rounded-lg px-4 py-3 mb-4 border ${
                            banner.type === "success"
                                ? "bg-successSoft border-success/30 text-success"
                                : "bg-dangerSoft border-danger/30 text-danger"
                        }`}
                    >
                        {banner.message}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
                    {TABS.map(({ value, label, icon: Icon }) => (
                        <button
                            key={value}
                            onClick={() => setTab(value)}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
                                tab === value
                                    ? "bg-textPrimary text-white font-semibold"
                                    : "bg-ink-100 text-textSecondary hover:bg-ink-200"
                            }`}
                        >
                            <Icon size={15} />
                            {label}
                        </button>
                    ))}
                </div>

                {tab === "profile" && <ProfileTab notify={notify} />}
                {tab === "addresses" && <AddressesTab notify={notify} />}
                {tab === "security" && <SecurityTab notify={notify} />}
            </div>
        </div>
    );
}

function ProfileTab({ notify }) {
    const [form, setForm] = useState({ name: "", email: "" });
    const [joined, setJoined] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await apiRequest("/profile");
                setForm({ name: res.data.name, email: res.data.email });
                setJoined(res.data.joined_at);
            } catch (err) {
                notify("error", err.message || "Couldn't load your profile.");
            } finally {
                setLoading(false);
            }
        })();
        // notify is stable enough for a one-time load
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        try {
            const res = await apiRequest("/profile", { method: "PUT", body: form });
            notify("success", res.message || "Profile updated.");
        } catch (err) {
            if (err.errors) {
                const mapped = {};
                Object.entries(err.errors).forEach(([field, messages]) => {
                    mapped[field] = Array.isArray(messages) ? messages[0] : messages;
                });
                setErrors(mapped);
            } else {
                notify("error", err.message || "Couldn't save.");
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <p className="text-sm text-textSecondary">Loading...</p>;
    }

    return (
        <form onSubmit={save} className="bg-surface border border-line rounded-xl p-5">
            <Field label="Name" error={errors.name}>
                <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={input(errors.name)}
                />
            </Field>

            <Field label="Email" error={errors.email}>
                <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={input(errors.email)}
                />
            </Field>

            {joined && (
                <p className="text-xs text-textMuted mb-4">
                    With Rapaku since{" "}
                    {new Date(joined).toLocaleDateString("id-ID", {
                        month: "long",
                        year: "numeric",
                    })}
                </p>
            )}

            <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primaryHover transition disabled:opacity-60"
            >
                {saving ? "Saving..." : "Save changes"}
            </button>
        </form>
    );
}

function AddressesTab({ notify }) {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(null);   // address object or "new"
    const [busyId, setBusyId] = useState(null);

    const load = async () => {
        try {
            const res = await apiRequest("/addresses");
            setAddresses(res.data || []);
        } catch (err) {
            notify("error", err.message || "Couldn't load your addresses.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const makeDefault = async (id) => {
        setBusyId(id);
        try {
            await apiRequest(`/addresses/${id}/default`, { method: "PATCH" });
            await load();
        } catch (err) {
            notify("error", err.message || "Couldn't update.");
        } finally {
            setBusyId(null);
        }
    };

    const remove = async (id) => {
        if (!window.confirm("Delete this address? Past orders keep their own copy.")) {
            return;
        }

        setBusyId(id);
        try {
            await apiRequest(`/addresses/${id}`, { method: "DELETE" });
            await load();
            notify("success", "Address deleted.");
        } catch (err) {
            notify("error", err.message || "Couldn't delete.");
        } finally {
            setBusyId(null);
        }
    };

    if (loading) {
        return <p className="text-sm text-textSecondary">Loading...</p>;
    }

    if (editing) {
        return (
            <AddressForm
                address={editing === "new" ? null : editing}
                onCancel={() => setEditing(null)}
                onSaved={async (message) => {
                    setEditing(null);
                    await load();
                    notify("success", message);
                }}
            />
        );
    }

    return (
        <>
            {addresses.length === 0 ? (
                <div className="bg-surface border border-line rounded-xl p-8 text-center mb-3">
                    <p className="text-sm text-textSecondary">
                        No addresses saved yet.
                    </p>
                </div>
            ) : (
                <div className="space-y-3 mb-3">
                    {addresses.map((address) => (
                        <div
                            key={address.id}
                            className={`bg-surface border rounded-xl p-4 transition-opacity ${
                                address.is_default ? "border-primary" : "border-line"
                            } ${busyId === address.id ? "opacity-50" : ""}`}
                        >
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-textPrimary">
                                        {address.label || address.recipient_name}
                                        {address.is_default && (
                                            <span className="ml-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wide bg-primarySoft text-primary px-2 py-0.5 rounded-full">
                                                <Star size={9} className="fill-primary" />
                                                Default
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-textSecondary mt-0.5">
                                        {address.recipient_name} · {address.phone}
                                    </p>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <button
                                        onClick={() => setEditing(address)}
                                        aria-label="Edit address"
                                        className="p-2 rounded-lg text-textSecondary hover:text-primary hover:bg-ink-100 transition"
                                    >
                                        <Pencil size={15} />
                                    </button>
                                    <button
                                        onClick={() => remove(address.id)}
                                        disabled={busyId === address.id}
                                        aria-label="Delete address"
                                        className="p-2 rounded-lg text-textSecondary hover:text-danger hover:bg-dangerSoft transition disabled:opacity-40"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm text-textSecondary leading-relaxed">
                                {address.street}
                                {address.district ? `, ${address.district}` : ""}
                                <br />
                                {address.city}, {address.province} {address.postal_code}
                            </p>

                            {address.courier_note && (
                                <p className="mt-2 text-xs text-textSecondary bg-ink-100 rounded-lg px-3 py-2">
                                    {address.courier_note}
                                </p>
                            )}

                            {!address.is_default && (
                                <button
                                    onClick={() => makeDefault(address.id)}
                                    disabled={busyId === address.id}
                                    className="mt-3 text-xs font-semibold text-primary hover:underline disabled:opacity-40"
                                >
                                    Make this my default
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={() => setEditing("new")}
                className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-lineStrong py-4 text-sm font-semibold text-primary hover:bg-primarySoft transition"
            >
                <Plus size={16} />
                Add an address
            </button>
        </>
    );
}

function AddressForm({ address, onSaved, onCancel }) {
    const [form, setForm] = useState({
        label: address?.label || "",
        recipient_name: address?.recipient_name || "",
        phone: address?.phone || "",
        street: address?.street || "",
        district: address?.district || "",
        city: address?.city || "",
        province: address?.province || "",
        postal_code: address?.postal_code || "",
        courier_note: address?.courier_note || "",
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const change = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    };

    const save = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        try {
            if (address) {
                await apiRequest(`/addresses/${address.id}`, { method: "PUT", body: form });
                onSaved("Address updated.");
            } else {
                await apiRequest("/addresses", { method: "POST", body: form });
                onSaved("Address saved.");
            }
        } catch (err) {
            if (err.errors) {
                const mapped = {};
                Object.entries(err.errors).forEach(([field, messages]) => {
                    mapped[field] = Array.isArray(messages) ? messages[0] : messages;
                });
                setErrors(mapped);
            } else {
                setErrors({ general: err.message || "Couldn't save the address." });
            }
            setSaving(false);
        }
    };

    return (
        <form onSubmit={save} noValidate className="bg-surface border border-line rounded-xl p-5">
            <h3 className="text-base font-bold text-textPrimary mb-4">
                {address ? "Edit address" : "New address"}
            </h3>

            {errors.general && (
                <p className="text-sm text-danger mb-3">{errors.general}</p>
            )}

            <Field label="Label" error={errors.label}>
                <input name="label" value={form.label} onChange={change} placeholder="Home, Office" className={input(errors.label)} />
            </Field>

            <Field label="Recipient name" error={errors.recipient_name}>
                <input name="recipient_name" value={form.recipient_name} onChange={change} className={input(errors.recipient_name)} />
            </Field>

            <Field label="Phone" error={errors.phone}>
                <input name="phone" inputMode="tel" value={form.phone} onChange={change} placeholder="08123456789" className={input(errors.phone)} />
            </Field>

            <Field label="Street address" error={errors.street}>
                <textarea name="street" rows={2} value={form.street} onChange={change} className={input(errors.street) + " resize-y"} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
                <Field label="District" error={errors.district}>
                    <input name="district" value={form.district} onChange={change} placeholder="Kecamatan" className={input(errors.district)} />
                </Field>
                <Field label="City" error={errors.city}>
                    <input name="city" value={form.city} onChange={change} className={input(errors.city)} />
                </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Field label="Province" error={errors.province}>
                    <input name="province" value={form.province} onChange={change} className={input(errors.province)} />
                </Field>
                <Field label="Postal code" error={errors.postal_code}>
                    <input name="postal_code" inputMode="numeric" value={form.postal_code} onChange={change} className={input(errors.postal_code)} />
                </Field>
            </div>

            <Field label="Note for the courier" error={errors.courier_note}>
                <input name="courier_note" value={form.courier_note} onChange={change} placeholder="Leave with the security post" className={input(errors.courier_note)} />
            </Field>

            <div className="flex gap-2 mt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 rounded-full border border-lineStrong py-2.5 text-sm font-semibold text-textPrimary hover:bg-ink-100 transition"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 rounded-full bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primaryHover transition disabled:opacity-60"
                >
                    {saving ? "Saving..." : "Save"}
                </button>
            </div>
        </form>
    );
}

function SecurityTab({ notify }) {
    const [form, setForm] = useState({
        current_password: "",
        password: "",
        password_confirmation: "",
    });
    const [show, setShow] = useState(false);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const change = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    };

    const save = async (e) => {
        e.preventDefault();
        setErrors({});

        if (form.password !== form.password_confirmation) {
            setErrors({ password_confirmation: "These don't match" });
            return;
        }

        setSaving(true);

        try {
            const res = await apiRequest("/profile/password", {
                method: "PUT",
                body: form,
            });
            setForm({ current_password: "", password: "", password_confirmation: "" });
            notify("success", res.message || "Password changed.");
        } catch (err) {
            if (err.errors) {
                const mapped = {};
                Object.entries(err.errors).forEach(([field, messages]) => {
                    mapped[field] = Array.isArray(messages) ? messages[0] : messages;
                });
                setErrors(mapped);
            } else {
                notify("error", err.message || "Couldn't change your password.");
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={save} noValidate className="bg-surface border border-line rounded-xl p-5">
            <h3 className="text-base font-bold text-textPrimary mb-1">Change password</h3>
            <p className="text-sm text-textSecondary mb-4">
                Other devices will be signed out. This one stays.
            </p>

            <Field label="Current password" error={errors.current_password}>
                <div className="relative">
                    <input
                        name="current_password"
                        type={show ? "text" : "password"}
                        autoComplete="current-password"
                        value={form.current_password}
                        onChange={change}
                        className={input(errors.current_password) + " pr-11"}
                    />
                    <button
                        type="button"
                        onClick={() => setShow((v) => !v)}
                        aria-label={show ? "Hide passwords" : "Show passwords"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary transition"
                    >
                        {show ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                </div>
            </Field>

            <Field label="New password" error={errors.password}>
                <input
                    name="password"
                    type={show ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={change}
                    placeholder="At least 8 characters"
                    className={input(errors.password)}
                />
            </Field>

            <Field label="Confirm new password" error={errors.password_confirmation}>
                <div className="relative">
                    <input
                        name="password_confirmation"
                        type={show ? "text" : "password"}
                        autoComplete="new-password"
                        value={form.password_confirmation}
                        onChange={change}
                        className={input(errors.password_confirmation) + " pr-11"}
                    />
                    {form.password_confirmation &&
                        form.password === form.password_confirmation && (
                            <Check
                                size={17}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-success"
                            />
                        )}
                </div>
            </Field>

            <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primaryHover transition disabled:opacity-60"
            >
                {saving ? "Changing..." : "Change password"}
            </button>
        </form>
    );
}

function Field({ label, error, children }) {
    return (
        <div className="mb-3">
            <label className="block text-xs font-semibold text-textSecondary mb-1">
                {label}
            </label>
            {children}
            {error && <p className="text-danger text-xs mt-1">{error}</p>}
        </div>
    );
}

function input(hasError) {
    return `w-full bg-surface border rounded-lg px-3 py-2 text-base focus:outline-none focus:ring-2 transition ${
        hasError ? "border-danger focus:ring-danger" : "border-line focus:ring-primary"
    }`;
}