import React, { forwardRef } from 'react';

export const Select = forwardRef(({ label, error, options = [], className = '', ...props }, ref) => {
  return (
    <div className={`input-wrapper ${className}`}>
      {label && <label className="input-label">{label}</label>}
      <select 
        ref={ref}
        className={`input-field ${error ? 'input-error' : ''}`}
        {...props}
      >
        <option value="" disabled>Select an option</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
});
