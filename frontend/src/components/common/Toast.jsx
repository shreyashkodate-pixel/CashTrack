import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import './Toast.css';

export const ToastContainer = () => {
  const { toasts } = useAppContext();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' && <CheckCircle size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
          </div>
          <div className="toast-message">{toast.message}</div>
        </div>
      ))}
    </div>
  );
};
