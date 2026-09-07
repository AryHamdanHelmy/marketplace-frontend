/**
 * Komponen alert reusable untuk pesan error / success.
 * Dipakai di Login, Register, atau form lain yang butuh feedback.
 *
 * Props:
 * - type: "error" | "success"
 * - message: string
 * - onClose: optional, kalau diisi akan muncul tombol close (x)
 */
export default function Alert({ type = "error", message, onClose }) {
  if (!message) return null;

  const isError = type === "error";

  // Rapikan teks: huruf pertama kapital, hapus titik ganda di akhir
  const formattedMessage =
    message.charAt(0).toUpperCase() + message.slice(1);

  const styles = isError
    ? {
        wrapper: "bg-danger/10 border border-danger/20 text-red-400",
        icon: "text-red-400",
      }
    : {
        wrapper: "bg-success/10 border border-success/20 text-green-400",
        icon: "text-green-400",
      };

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-lg px-4 py-3 mb-4 text-sm ${styles.wrapper}`}
    >
      <span className={`shrink-0 mt-0.5 ${styles.icon}`}>
        {isError ? <ErrorIcon /> : <SuccessIcon />}
      </span>

      <span className="flex-1">{formattedMessage}</span>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 text-current opacity-60 hover:opacity-100 transition"
          aria-label="Tutup pesan"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}

function ErrorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 8v5M12 16h.01"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SuccessIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path
        d="M8 12.5l2.5 2.5L16 9.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}