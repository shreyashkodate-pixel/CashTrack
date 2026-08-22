import React from 'react';
import './Skeleton.css';

export const Skeleton = ({ 
  className = '', 
  width, 
  height, 
  circle = false,
  style = {} 
}) => {
  const customStyle = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...style
  };

  return (
    <span 
      className={`skeleton ${circle ? 'skeleton-circle' : ''} ${className}`} 
      style={customStyle}
      aria-hidden="true"
    />
  );
};

export const MetricCardSkeleton = () => (
  <div className="skeleton-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Skeleton width="40%" height="12px" />
      <Skeleton width="28px" height="28px" circle />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
      <Skeleton width="60%" height="28px" />
      <Skeleton width="35%" height="12px" />
    </div>
  </div>
);

export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} style={{ padding: '14px 16px' }}>
        <Skeleton width={i === 0 ? '70%' : i === 1 ? '90%' : '50%'} height="14px" />
      </td>
    ))}
  </tr>
);
