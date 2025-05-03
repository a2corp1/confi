const Badge = ({ 
    variant = 'primary', 
    children, 
    className = '', 
    dot = false,
    large = false
  }) => {
    const baseClasses = 'inline-flex items-center rounded-full font-medium';
    const sizeClasses = large ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';
    
    const variantClasses = {
      primary: 'bg-primary-900 text-primary-300',
      secondary: 'bg-secondary-900 text-secondary-300',
      success: 'bg-success-900 text-success-300',
      warning: 'bg-warning-900 text-warning-300',
      danger: 'bg-danger-900 text-danger-300',
      info: 'bg-dark-800 text-dark-300',
    };
  
    const dotColors = {
      primary: 'bg-primary-400',
      secondary: 'bg-secondary-400',
      success: 'bg-success-400',
      warning: 'bg-warning-400',
      danger: 'bg-danger-400',
      info: 'bg-dark-400',
    };
  
    return (
      <span className={`${baseClasses} ${sizeClasses} ${variantClasses[variant]} ${className}`}>
        {dot && (
          <span className={`mr-1.5 h-2 w-2 rounded-full ${dotColors[variant]}`} />
        )}
        {children}
      </span>
    );
  };
  
  export default Badge;