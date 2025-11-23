import React from 'react';
import { Trash2 } from 'lucide-react';
import '../styles/transaction-list.css';

export function TransactionList({ transactions, onDelete, onEdit, viewMode = 'daily' }) {
  // Group transactions
  const grouped = transactions.reduce((acc, transaction) => {
    const date = new Date(transaction.date);
    let key;
    
    if (viewMode === 'monthly') {
      key = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else {
      key = transaction.date;
    }

    if (!acc[key]) acc[key] = [];
    acc[key].push(transaction);
    return acc;
  }, {});

  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    if (viewMode === 'monthly') {
      return new Date(b) - new Date(a);
    }
    return new Date(b) - new Date(a);
  });

  const formatHeader = (key) => {
    if (viewMode === 'monthly') return key;
    
    const date = new Date(key);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const getGroupTotal = (groupTransactions) => {
    return groupTransactions.reduce((acc, t) => {
      return t.type === 'expense' ? acc - t.amount : acc + t.amount;
    }, 0);
  };

  return (
    <div className="transaction-list">
      {sortedKeys.map(key => (
        <div key={key} className="date-group">
          <div className="group-header">
            <h3 className="date-header">{formatHeader(key)}</h3>
            {viewMode === 'monthly' && (
              <span className="group-total">
                {getGroupTotal(grouped[key]) < 0 ? '-' : '+'}₹{Math.abs(getGroupTotal(grouped[key])).toFixed(2)}
              </span>
            )}
          </div>
          <div className="transactions">
            {grouped[key].map(t => (
              <div 
                key={t.id} 
                className="transaction-item"
                onClick={() => onEdit(t)}
              >
                <div className="t-icon">
                  {t.category[0]}
                </div>
                <div className="t-details">
                  <div className="t-main">
                    <div className="t-cat-group">
                      <span className="t-category">{t.category}</span>
                      {t.subCategory && <span className="t-subcategory"> / {t.subCategory}</span>}
                    </div>
                    <span className={`t-amount ${t.type}`}>
                      {t.type === 'expense' ? '-' : '+'}
                      ₹{t.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="t-sub">
                    <span className="t-account">{t.account}</span>
                    {t.description && <span className="t-note"> • {t.description}</span>}
                    {viewMode === 'monthly' && (
                      <span className="t-date"> • {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    )}
                  </div>
                </div>
                <button 
                  className="delete-btn" 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(t.id);
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {transactions.length === 0 && (
        <div className="empty-state">
          <p>No transactions yet.</p>
        </div>
      )}
    </div>
  );
}
