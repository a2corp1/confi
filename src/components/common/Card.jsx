const Card = ({ title, subtitle, children, footer, className = '' }) => {
    return (
      <div className={`card ${className}`}>
        {(title || subtitle) && (
          <div className="card-header">
            {title && <h3 className="text-lg font-medium text-white">{title}</h3>}
            {subtitle && <p className="mt-1 text-sm text-dark-400">{subtitle}</p>}
          </div>
        )}
        <div className="card-body">{children}</div>
        {footer && <div className="card-footer">{footer}</div>}
      </div>
    );
  };
  
  export default Card;