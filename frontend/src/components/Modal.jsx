import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  // Capture escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content glass" 
        onClick={(e) => e.stopPropagation()}
        style={{ border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)' }}
      >
        <div className="flex-between" style={{ marginBottom: '24px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '12px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>{title}</h3>
          <button 
            onClick={onClose} 
            className="btn-icon"
            style={{ padding: '6px', cursor: 'pointer', background: 'none', border: 'none' }}
          >
            <X size={18} />
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
