import React, { useState } from 'react';
import { AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import './ErrorState.css';

export const ErrorState = ({
  title = 'An error occurred',
  description = 'We encountered an unexpected issue. Please try again or contact support if the problem persists.',
  error,
  onRetry,
  className = ''
}) => {
  const [showDetails, setShowDetails] = useState(false);

  // Extract message from error object
  const technicalDetails = error 
    ? (error.stack || error.message || String(error))
    : null;

  return (
    <div className={`error-state-container ${className}`}>
      <div className="error-state-icon-circle">
        <AlertCircle size={24} />
      </div>
      
      <div className="error-state-text">
        <h3 className="error-state-title">{title}</h3>
        <p className="error-state-description">{description}</p>
      </div>

      <div className="error-state-actions">
        {onRetry && (
          <Button onClick={onRetry} variant="primary" size="sm">
            Try again
          </Button>
        )}
        <Button 
          onClick={() => window.open('mailto:support@cashtrack.com')} 
          variant="secondary" 
          size="sm"
        >
          Contact support
        </Button>
      </div>

      {technicalDetails && (
        <div className="error-state-details">
          <div 
            className="error-state-details-summary"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <span>Technical details</span>
          </div>
          {showDetails && (
            <pre className="error-state-details-content">
              {technicalDetails}
            </pre>
          )}
        </div>
      )}
    </div>
  );
};
