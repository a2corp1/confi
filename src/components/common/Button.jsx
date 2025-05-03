import React from 'react';
import { Link } from 'react-router-dom';

const Button = ({ 
  children, 
  onClick, 
  to, 
  variant = 'primary', 
  size = 'md', 
  className = '',
  icon,
  iconPosition = 'right',
  fullWidth = false,
  disabled = false,
  type = 'button',
  external = false,
  ...props 
}) => {
  // Variant styles
  const variantStyles = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white',
    secondary: 'bg-dark-800 hover:bg-dark-700 text-white border border-dark-700',
    outline: 'bg-transparent hover:bg-dark-800 text-white border border-dark-600 hover:border-dark-500',
    ghost: 'bg-transparent hover:bg-dark-800 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
  };

  // Size styles
  const sizeStyles = {
    sm: 'py-1.5 px-3 text-sm',
    md: 'py-2 px-4',
    lg: 'py-2.5 px-5 text-lg',
  };

  // Combine all styles
  const buttonStyles = `
    ${variantStyles[variant] || variantStyles.primary}
    ${sizeStyles[size] || sizeStyles.md}
    ${fullWidth ? 'w-full' : ''}
    rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50
    ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
    flex items-center justify-center gap-2
    ${className}
  `;

  // Icon placement logic
  const renderContent = () => (
    <>
      {icon && iconPosition === 'left' && <span>{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span>{icon}</span>}
    </>
  );

  // If "to" prop exists, render a link instead of button
  if (to) {
    if (external) {
      return (
        <a 
          href={to} 
          className={buttonStyles} 
          target="_blank" 
          rel="noopener noreferrer"
          {...props}
        >
          {renderContent()}
        </a>
      );
    }
    
    return (
      <Link 
        to={to} 
        className={buttonStyles}
        {...props}
      >
        {renderContent()}
      </Link>
    );
  }

  return (
    <button 
      onClick={onClick} 
      className={buttonStyles} 
      disabled={disabled}
      type={type}
      {...props}
    >
      {renderContent()}
    </button>
  );
};

export default Button;