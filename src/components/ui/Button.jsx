export default function Button({ children, className = '', ...props }) {
  return (
    <button
      className={`px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}