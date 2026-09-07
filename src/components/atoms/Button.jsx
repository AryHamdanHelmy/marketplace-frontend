export default function Button({
  children,
  variant = "primary",
  type = "button",
  disabled = false,
  onClick,
  className = "",
}) {
  const base = "w-full font-semibold rounded-xl px-3 py-2 transition disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-primaryDark/50 hover:bg-primary text-white",
    secondary: "bg-primary/10 hover:bg-primary/20 text-white",
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
