'use client';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  isLoading,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
    danger: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800',
  };

  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={`${baseStyles} ${variants[variant]} ${props.className || ''}`}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}
