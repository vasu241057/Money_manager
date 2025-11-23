import { useState, useEffect } from 'react';
import { useUser } from '@stackframe/react';

export const useTransactions = () => {
  const user = useUser();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (user) {
      user.getAuthJson().then(authJson => {
        const token = authJson.accessToken;
        fetch('/api/transactions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch');
            return res.json();
          })
          .then(data => {
            // Ensure dates are Date objects
            const parsedData = data.map(t => ({
              ...t,
              date: new Date(t.date)
            }));
            setTransactions(parsedData);
          })
          .catch(err => console.error(err));
      });
    } else {
      setTransactions([]);
    }
  }, [user]);

  const addTransaction = async (transaction) => {
    if (!user) return;
    try {
      const authJson = await user.getAuthJson();
      const token = authJson.accessToken;
      
      let res;
      if (transaction.id) {
        // Update existing
        res = await fetch(`/api/transactions/${transaction.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(transaction)
        });
      } else {
        // Create new
        res = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(transaction)
        });
      }

      if (!res.ok) throw new Error('Failed to save');
      const savedTransaction = await res.json();
      
      setTransactions(prev => {
        if (transaction.id) {
          return prev.map(t => t.id === savedTransaction.id ? { ...savedTransaction, date: new Date(savedTransaction.date) } : t);
        } else {
          return [{ ...savedTransaction, date: new Date(savedTransaction.date) }, ...prev];
        }
      });
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTransaction = async (id) => {
    if (!user) return;
    try {
      const authJson = await user.getAuthJson();
      const token = authJson.accessToken;
      const res = await fetch(`/api/transactions/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete');
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return { transactions, addTransaction, deleteTransaction };
};
