import React from 'react';
import './Card.css';

export const Card = ({ 
  children, 
  variant = 'default', // 'default' | 'metric' | 'interactive'
  className = '', 
  ...props 
}) => {
  const variantClass = variant !== 'default' ? `card-${variant}` : '';

  return (
    <div className={`card ${variantClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ title, description, action, className = '' }) => (
  <div className={`card-header ${className}`}>
    <div>
      {title && <h3 className="card-title">{title}</h3>}
      {description && <p className="card-description">{description}</p>}
    </div>
    {action && <div className="card-action">{action}</div>}
  </div>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`card-body ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`card-footer ${className}`}>{children}</div>
);
