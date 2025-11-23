import React from 'react';
import '../../styles/ui.css';

export function Select({ label, options, error, ...props }) {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}</label>}
      <div className="select-wrapper">
        <select className="input-field select-field" {...props}>
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  );
}
