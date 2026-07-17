export default function ErrorText({ children }) {
  if (!children) return null;
  return <p className="text-black text-xs mt-1">{children}</p>;
}
