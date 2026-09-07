export default function Label({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} className="block text-label text-textPrimary mb-1">
      {children}
    </label>
  );
}
