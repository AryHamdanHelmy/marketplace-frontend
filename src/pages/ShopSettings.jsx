import { useState, useEffect, useRef } from "react";
import { apiRequest } from "../api/Client";
import SellerSidebar from "../components/organisms/SellerSidebar";
import { Store, Landmark, Upload, Check, TriangleAlert } from "lucide-react";
import { downscaleImage } from "../utils/image";

export default function ShopSettings() {
  const [loading, setLoading] = useState(true);
  const [store, setStore] = useState(null);

  const [profile, setProfile] = useState({
    name: "",
    description: "",
    city: "",
    province: "",
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const logoInputRef = useRef(null);

  const [payout, setPayout] = useState({
    bank_name: "",
    bank_account_number: "",
    bank_account_holder: "",
  });

  const [profileErrors, setProfileErrors] = useState({});
  const [payoutErrors, setPayoutErrors] = useState({});
  const [banner, setBanner] = useState({ type: "", message: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPayout, setSavingPayout] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await apiRequest("/seller/store");
        if (cancelled) return;

        setStore(res.data);
        setProfile({
          name: res.data.name || "",
          description: res.data.description || "",
          city: res.data.city || "",
          province: res.data.province || "",
        });
        setPayout({
          bank_name: res.data.bank_name || "",
          bank_account_number: "",
          bank_account_holder: res.data.bank_account_holder || "",
        });
      } catch (err) {
        if (!cancelled) {
          setBanner({
            type: "error",
            message: err.message || "Couldn't load your shop.",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const prepared = await downscaleImage(file, {maxEdge: 1200, quality:0.85});
    setLogoFile(prepared);
    setLogoPreview(URL.createObjectURL(prepared));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileErrors({});
    setBanner({ type: "", message: "" });

    if (!profile.name.trim()) {
      setProfileErrors({ name: "Your shop needs a name" });
      return;
    }

    setSavingProfile(true);
    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("name", profile.name);
      formData.append("description", profile.description || "");
      formData.append("city", profile.city || "");
      formData.append("province", profile.province || "");
      if (logoFile) formData.append("logo", logoFile);

      // Laravel doesn't parse multipart bodies on PUT, so the request is sent
      // as POST with _method spoofing.
      const res = await apiRequest("/seller/store", {
        method: "POST",
        body: formData,
      });

      setStore(res.data);
      setLogoFile(null);
      setBanner({ type: "success", message: "Shop details saved." });
    } catch (err) {
      if (err.errors) {
        const mapped = {};
        Object.entries(err.errors).forEach(([field, messages]) => {
          mapped[field] = Array.isArray(messages) ? messages[0] : messages;
        });
        setProfileErrors(mapped);
      } else {
        setBanner({ type: "error", message: err.message || "Couldn't save." });
      }
    } finally {
      setSavingProfile(false);
    }
  };

  const savePayout = async (e) => {
    e.preventDefault();
    setPayoutErrors({});
    setBanner({ type: "", message: "" });

    setSavingPayout(true);
    try {
      const res = await apiRequest("/seller/store/payout", {
        method: "PUT",
        body: payout,
      });

      setStore((prev) => ({
        ...prev,
        bank_name: res.data.bank_name,
        bank_account_holder: res.data.account_holder,
        masked_account_number: res.data.masked_account_number,
      }));
      setPayout((prev) => ({ ...prev, bank_account_number: "" }));
      setBanner({ type: "success", message: "Payout account saved." });
    } catch (err) {
      if (err.errors) {
        const mapped = {};
        Object.entries(err.errors).forEach(([field, messages]) => {
          mapped[field] = Array.isArray(messages) ? messages[0] : messages;
        });
        setPayoutErrors(mapped);
      } else {
        setBanner({ type: "error", message: err.message || "Couldn't save." });
      }
    } finally {
      setSavingPayout(false);
    }
  };

  const toggleOpen = async () => {
    setTogglingStatus(true);
    try {
      const res = await apiRequest("/seller/store/status", {
        method: "PATCH",
        body: { is_open: !store.is_open },
      });
      setStore((prev) => ({ ...prev, is_open: res.data.is_open }));
    } catch (err) {
      setBanner({ type: "error", message: err.message || "Couldn't update." });
    } finally {
      setTogglingStatus(false);
    }
  };

  if (loading) {
    return (
      <>
        <SellerSidebar />
        <div className="min-h-screen bg-background pt-24 px-5 md:pl-70 md:pr-10">
          <p className="text-sm text-textSecondary">Loading your shop...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <SellerSidebar />
      <div className="min-h-screen bg-background text-textPrimary pt-24 px-5 pb-12 md:pl-70 md:pr-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-1">Shop Settings</h1>
          <p className="text-sm text-textSecondary mb-6">
            How buyers see your shop, and where your money goes.
          </p>

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

          {/* Open / closed */}
          <div className="bg-surface border border-line rounded-xl p-5 mb-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold flex items-center gap-2">
                  <Store size={17} className="text-primary" />
                  {store?.is_open ? "Shop is open" : "Shop is closed"}
                </h3>
                <p className="text-sm text-textSecondary mt-1">
                  {store?.is_open
                    ? "Buyers can place orders right now."
                    : "Your listings stay visible, but no new orders come in."}
                </p>
              </div>
              <button
                type="button"
                onClick={toggleOpen}
                disabled={togglingStatus}
                aria-pressed={store?.is_open}
                className={`relative h-7 w-13 shrink-0 rounded-full transition disabled:opacity-60 ${
                  store?.is_open ? "bg-primary" : "bg-ink-300"
                }`}
                style={{ width: "3.25rem" }}
              >
                <span
                  className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${
                    store?.is_open ? "left-8" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Profile */}
          <form
            onSubmit={saveProfile}
            className="bg-surface border border-line rounded-xl p-5 mb-5"
          >
            <h3 className="text-base font-bold border-b border-line pb-2 mb-4">
              Shop Profile
            </h3>

            <div className="flex items-center gap-4 mb-4">
              <div className="h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-ink-100 border border-line flex items-center justify-center">
                {logoPreview || store?.logo_url ? (
                  <img
                    src={logoPreview || store.logo_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Store size={24} className="text-textMuted" />
                )}
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                  <Upload size={15} />
                  {store?.logo_url || logoPreview ? "Change logo" : "Upload logo"}
                </button>
                <p className="text-xs text-textMuted mt-1">
                  Square works best. Large images are resized automatically.
                </p>
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                onChange={handleLogoChange}
                className="hidden"
              />
            </div>

            <Field label="Shop name" error={profileErrors.name}>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="e.g. Tanah Kasongan Ceramics"
                className={inputClass(profileErrors.name)}
              />
            </Field>

            <Field label="Description" error={profileErrors.description}>
              <textarea
                rows={4}
                value={profile.description}
                onChange={(e) =>
                  setProfile({ ...profile, description: e.target.value })
                }
                placeholder="What you make, and what makes it yours."
                className={inputClass(false) + " resize-y"}
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="City" error={profileErrors.city}>
                <input
                  type="text"
                  value={profile.city}
                  onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                  placeholder="Bantul"
                  className={inputClass(profileErrors.city)}
                />
              </Field>
              <Field label="Province" error={profileErrors.province}>
                <input
                  type="text"
                  value={profile.province}
                  onChange={(e) =>
                    setProfile({ ...profile, province: e.target.value })
                  }
                  placeholder="DI Yogyakarta"
                  className={inputClass(profileErrors.province)}
                />
              </Field>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="mt-2 px-6 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primaryHover transition disabled:opacity-60"
            >
              {savingProfile ? "Saving..." : "Save profile"}
            </button>
          </form>

          {/* Payout */}
          <form
            onSubmit={savePayout}
            className="bg-surface border border-line rounded-xl p-5"
          >
            <h3 className="text-base font-bold border-b border-line pb-2 mb-4 flex items-center gap-2">
              <Landmark size={17} className="text-primary" />
              Payout Account
            </h3>

            {store?.masked_account_number ? (
              <div className="flex items-center gap-2 bg-successSoft text-success text-sm rounded-lg px-4 py-3 mb-4">
                <Check size={16} />
                <span>
                  {store.bank_name} {store.masked_account_number} —{" "}
                  {store.bank_account_holder}
                </span>
              </div>
            ) : (
              <div className="flex items-start gap-2 bg-warningSoft text-warning text-sm rounded-lg px-4 py-3 mb-4">
                <TriangleAlert size={16} className="mt-0.5 shrink-0" />
                <span>
                  You can't withdraw your balance until this is set.
                </span>
              </div>
            )}

            <Field label="Bank" error={payoutErrors.bank_name}>
              <input
                type="text"
                value={payout.bank_name}
                onChange={(e) =>
                  setPayout({ ...payout, bank_name: e.target.value })
                }
                placeholder="BCA"
                className={inputClass(payoutErrors.bank_name)}
              />
            </Field>

            <Field
              label="Account number"
              error={payoutErrors.bank_account_number}
            >
              <input
                type="text"
                inputMode="numeric"
                value={payout.bank_account_number}
                onChange={(e) =>
                  setPayout({ ...payout, bank_account_number: e.target.value })
                }
                placeholder="Digits only, no spaces or dashes"
                className={inputClass(payoutErrors.bank_account_number)}
              />
            </Field>

            <Field
              label="Account holder name"
              error={payoutErrors.bank_account_holder}
            >
              <input
                type="text"
                value={payout.bank_account_holder}
                onChange={(e) =>
                  setPayout({ ...payout, bank_account_holder: e.target.value })
                }
                placeholder="Exactly as printed on the account"
                className={inputClass(payoutErrors.bank_account_holder)}
              />
            </Field>

            <p className="text-xs text-textMuted mb-4">
              Transfers to a name that doesn't match the account are rejected by
              the bank, and the money bounces back after several days.
            </p>

            <button
              type="submit"
              disabled={savingPayout}
              className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-primaryHover transition disabled:opacity-60"
            >
              {savingPayout ? "Saving..." : "Save payout account"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-textSecondary mb-1">
        {label}
      </label>
      {children}
      {error && <p className="text-danger text-xs mt-1">{error}</p>}
    </div>
  );
}

function inputClass(hasError) {
  return `w-full bg-surface border rounded-lg px-3 py-2 text-sm text-textPrimary focus:outline-none focus:ring-2 transition ${
    hasError ? "border-danger focus:ring-danger" : "border-line focus:ring-primary"
  }`;
}