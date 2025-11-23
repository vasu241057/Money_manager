import { useState, Suspense } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { CategoryManager } from './components/CategoryManager';
import { useTransactions } from './hooks/useTransactions';
import { useUser, StackHandler, StackProvider, StackTheme } from '@stackframe/react';
import { Plus, LogOut } from 'lucide-react';
import { BrowserRouter, Route, Routes, useLocation, Navigate } from 'react-router-dom';
import { stackClientApp } from './stack';
import './styles/app.css';

function HandlerRoutes() {
  const location = useLocation();
  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <StackHandler app={stackClientApp} location={location.pathname} />
      </div>
    </div>
  );
}

function MoneyManagerApp() {
  const { transactions, addTransaction, deleteTransaction } = useTransactions();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [viewMode, setViewMode] = useState('daily');
  const user = useUser();

  if (!user) {
    return <Navigate to="/handler/sign-in" replace />;
  }

  return (
    <Layout>
      <div className="header">
        <h2>My Wallet</h2>
        <div className="header-actions">
          <button className="settings-btn" onClick={() => setIsCategoryManagerOpen(true)}>
            Categories
          </button>
          <button className="settings-btn" onClick={() => user.signOut()}>
            <LogOut size={18} />
          </button>
        </div>
      </div>
      
      <Dashboard transactions={transactions} />
      
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Transactions</h3>
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'daily' ? 'active' : ''}`}
            onClick={() => setViewMode('daily')}
          >
            Daily
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'monthly' ? 'active' : ''}`}
            onClick={() => setViewMode('monthly')}
          >
            Monthly
          </button>
        </div>
      </div>
      
      <TransactionList 
        transactions={transactions} 
        onDelete={deleteTransaction} 
        onEdit={(t) => {
          setEditingTransaction(t);
          setIsFormOpen(true);
        }}
        viewMode={viewMode}
      />

      <button className="fab" onClick={() => {
        setEditingTransaction(null);
        setIsFormOpen(true);
      }}>
        <Plus size={24} />
      </button>

      {isFormOpen && (
        <TransactionForm 
          initialData={editingTransaction}
          onSubmit={addTransaction} 
          onClose={() => {
            setIsFormOpen(false);
            setEditingTransaction(null);
          }} 
        />
      )}

      {isCategoryManagerOpen && (
        <CategoryManager onClose={() => setIsCategoryManagerOpen(false)} />
      )}
    </Layout>
  );
}

export default function App() {
  return (
    <Suspense fallback={null}>
      <BrowserRouter>
        <StackProvider app={stackClientApp}>
          <StackTheme>
            <Routes>
              <Route path="/handler/*" element={<HandlerRoutes />} />
              <Route path="/" element={<MoneyManagerApp />} />
            </Routes>
          </StackTheme>
        </StackProvider>
      </BrowserRouter>
    </Suspense>
  );
}
