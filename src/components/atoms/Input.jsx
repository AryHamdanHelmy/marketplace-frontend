export default function Input({
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  autoFocus = false,
  disabled = false,
  hasError = false,
  autoComplete,
  rightSlot, // untuk elemen tambahan di kanan input, mis. tombol "X" atau "Change"
}) {
  return (
    <div className="relative">
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        autoComplete={autoComplete}
        className={`w-full rounded-md bg-pastelblue/10 text-base text-black px-3 py-2 outline-1 focus:ring-2 transition disabled:opacity-60 ${
          hasError ? "ring-1 ring-red-500 focus:ring-red-500" : "focus:ring-pastel-blue"
        } ${rightSlot ? "pr-16" : ""}`}
      />
      {rightSlot && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
      )}
    </div>
  );
}