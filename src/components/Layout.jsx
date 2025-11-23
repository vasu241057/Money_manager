import React from 'react';
import '../styles/layout.css';

export function Layout({ children }) {
  return (
    <div className="layout">
      <main className="content">
        {children}
      </main>
    </div>
  );
}
