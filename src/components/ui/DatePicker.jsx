import React from 'react';
import '../../styles/ui.css';

export function DatePicker({ label, error, ...props }) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input 
        type="date" 
        className="input-field date-field" 
        {...props} 
      />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}
