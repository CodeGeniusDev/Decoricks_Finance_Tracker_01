import { AppData, Transaction, Category } from '../types';
import { DEFAULT_CATEGORIES } from '../data/categories';

const STORAGE_KEY = 'decoricks-finance-data';

export const loadData = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      return {
        transactions: data.transactions || [],
        categories: data.categories || DEFAULT_CATEGORIES,
      };
    }
  } catch (error) {
    console.error('Error loading data:', error);
  }
  
  return {
    transactions: [],
    categories: DEFAULT_CATEGORIES,
  };
};

export const saveData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving data:', error);
  }
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const exportToJSON = (data: AppData): void => {
  const dataStr = JSON.stringify(data, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
  const exportFileDefaultName = `decoricks-finance-${new Date().toISOString().split('T')[0]}.json`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};

export const exportToCSV = (transactions: Transaction[]): void => {
  const csvContent = [
    ['Date', 'Type', 'Category', 'Amount', 'Currency', 'Description'].join(','),
    ...transactions.map(t => [
      t.date,
      t.type,
      `"${t.category}"`,
      t.amount,
      t.currency,
      `"${t.description}"`
    ].join(','))
  ].join('\n');
  
  const dataUri = 'data:text/csv;charset=utf-8,'+ encodeURIComponent(csvContent);
  const exportFileDefaultName = `decoricks-transactions-${new Date().toISOString().split('T')[0]}.csv`;
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
};