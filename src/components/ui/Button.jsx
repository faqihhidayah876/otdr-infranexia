export default function Button({ children, className = '', type = 'button', disabled = false, ...props }) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}