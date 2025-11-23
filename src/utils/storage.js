const STORAGE_KEYS = {
  TRANSACTIONS: 'money_manager_transactions',
  CATEGORIES: 'money_manager_categories',
};

export const getStoredTransactions = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading transactions from storage', error);
    return [];
  }
};

export const saveStoredTransactions = (transactions) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions to storage', error);
  }
};

export const getStoredCategories = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : null; // Return null if not set to initialize defaults
  } catch (error) {
    console.error('Error reading categories from storage', error);
    return null;
  }
};

export const saveStoredCategories = (categories) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (error) {
    console.error('Error saving categories to storage', error);
  }
};
