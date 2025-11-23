import React from 'react';
import '../../styles/ui.css';

export function Input({ label, error, ...props }) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <input className="input-field" {...props} />
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}
