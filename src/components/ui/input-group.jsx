export function InputGroup({ className = "", children, ...props }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 focus-within:ring-2 focus-within:ring-pastel-blue transition ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function InputGroupInput({ className = "", ...props }) {
  return (
    <input
      className={`flex-1 bg-transparent text-white placeholder:text-gray-400 text-sm outline-none min-w-0 ${className}`}
      {...props}
    />
  );
}

export function InputGroupAddon({ align = "inline-start", className = "", children }) {
  return (
    <span
      className={`flex items-center text-gray-400 text-xs shrink-0 ${
        align === "inline-end" ? "order-last" : ""
      } ${className}`}
    >
      {children}
    </span>
  );
}