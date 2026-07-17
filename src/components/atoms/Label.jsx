export default function Label({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-black mb-1">
      {children}
    </label>
  );
}
