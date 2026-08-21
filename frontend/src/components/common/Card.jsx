import React from 'react';
import './Card.css';

export const Card = ({ children, className = '', ...props }) => {
  return (
    <div className={`card surface-card ${className}`} {...props}>
      {children}
    </div>
  );
};
