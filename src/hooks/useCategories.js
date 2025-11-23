import { useState, useEffect } from 'react';
import { useUser } from '@stackframe/react';
import { API_URL } from '../config/api';

const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Food', icon: 'Utensils', type: 'expense', subCategories: ['Groceries', 'Restaurants', 'Snacks'] },
  { id: '2', name: 'Transport', icon: 'Car', type: 'expense', subCategories: ['Fuel', 'Public Transport', 'Taxi'] },
  { id: '3', name: 'Shopping', icon: 'ShoppingBag', type: 'expense', subCategories: ['Clothes', 'Electronics', 'Home'] },
  { id: '4', name: 'Entertainment', icon: 'Film', type: 'expense', subCategories: ['Movies', 'Games', 'Events'] },
  { id: '5', name: 'Bills', icon: 'Receipt', type: 'expense', subCategories: ['Electricity', 'Water', 'Internet'] },
  { id: '6', name: 'Health', icon: 'HeartPulse', type: 'expense', subCategories: ['Doctor', 'Medicine', 'Fitness'] },
  { id: '7', name: 'Salary', icon: 'Briefcase', type: 'income', subCategories: ['Full-time', 'Freelance'] },
  { id: '8', name: 'Investment', icon: 'TrendingUp', type: 'income', subCategories: ['Stocks', 'Crypto', 'Real Estate'] },
];

export function useCategories() {
  const user = useUser();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (user) {
      user.getAuthJson().then(authJson => {
        const token = authJson.accessToken;
        fetch(`${API_URL}/api/categories`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
          .then(res => res.json())
          .then(data => {
            if (data.length === 0) {
               setCategories([]);
            } else {
              setCategories(data);
            }
          })
          .catch(console.error);
      });
    } else {
      setCategories(DEFAULT_CATEGORIES); 
    }
  }, [user]);

  const addCategory = async (category) => {
    if (!user) return;
    try {
      const authJson = await user.getAuthJson();
      const token = authJson.accessToken;
      const res = await fetch(`${API_URL}/api/categories`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(category)
      });
      if (!res.ok) throw new Error('Failed to create');
      const newCat = await res.json();
      setCategories(prev => [...prev, newCat]);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteCategory = async (id) => {
    if (!user) return;
    try {
      const authJson = await user.getAuthJson();
      const token = authJson.accessToken;
      const res = await fetch(`${API_URL}/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete');
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  const addSubCategory = async (categoryId, subCategoryName) => {
    if (!user) return;
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    const newSubs = [...(category.subCategories || []), subCategoryName];
    
    try {
      const authJson = await user.getAuthJson();
      const token = authJson.accessToken;
      const res = await fetch(`${API_URL}/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subCategories: newSubs })
      });
      if (!res.ok) throw new Error('Failed to update');
      const updatedCat = await res.json();
      setCategories(prev => prev.map(c => c.id === categoryId ? updatedCat : c));
    } catch (error) {
      console.error(error);
    }
  };

  const deleteSubCategory = async (categoryId, subCategoryName) => {
    if (!user) return;
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    const newSubs = (category.subCategories || []).filter(s => s !== subCategoryName);

    try {
      const authJson = await user.getAuthJson();
      const token = authJson.accessToken;
      const res = await fetch(`${API_URL}/api/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subCategories: newSubs })
      });
      if (!res.ok) throw new Error('Failed to update');
      const updatedCat = await res.json();
      setCategories(prev => prev.map(c => c.id === categoryId ? updatedCat : c));
    } catch (error) {
      console.error(error);
    }
  };

  return {
    categories,
    addCategory,
    deleteCategory,
    addSubCategory,
    deleteSubCategory,
    DEFAULT_CATEGORIES
  };
}
