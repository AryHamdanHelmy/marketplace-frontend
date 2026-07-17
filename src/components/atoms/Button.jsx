export default function Button({
  children,
  variant = "primary",
  type = "button",
  disabled = false,
  onClick,
  className = "",
}) {
  const base = "w-full font-semibold rounded-full py-1 transition disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-pastel-blue hover:bg-pastel-cyan text-white",
    secondary: "bg-white/10 hover:bg-white/20 text-white",
    ghost: "bg-transparent text-indigo-400 hover:underline py-0",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
