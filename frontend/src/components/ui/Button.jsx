import clsx from 'clsx';

function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-ocean text-white hover:bg-slateBlue',
    secondary: 'bg-white text-ink border border-slate-300 hover:bg-slate-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
  };

  return (
    <button
      className={clsx(
        'rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
