import React, { useState, useEffect } from 'react';
import { AppData, Transaction, Category, DateRangeFilter } from './types';
import { loadData, saveData } from './utils/storage';
import Dashboard from './components/Dashboard';
import DateFilter from './components/DateFilter';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import ExportImport from './components/ExportImport';
import { BarChart3, Plus, FileText, Settings, Home } from 'lucide-react';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>({ transactions: [], categories: [] });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add' | 'transactions' | 'settings'>('dashboard');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [dateFilter, setDateFilter] = useState<DateRangeFilter>({ type: 'monthly' });

  useEffect(() => {
    const loadedData = loadData();
    setData(loadedData);
  }, []);

  const handleSaveData = (newData: AppData) => {
    setData(newData);
    saveData(newData);
  };

  const handleSaveTransaction = (transaction: Transaction) => {
    const newTransactions = editingTransaction
      ? data.transactions.map(t => t.id === transaction.id ? transaction : t)
      : [...data.transactions, transaction];
    
    const newData = { ...data, transactions: newTransactions };
    handleSaveData(newData);
    
    if (editingTransaction) {
      setEditingTransaction(null);
      setActiveTab('transactions');
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setActiveTab('add');
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      const newTransactions = data.transactions.filter(t => t.id !== id);
      const newData = { ...data, transactions: newTransactions };
      handleSaveData(newData);
    }
  };

  const handleAddCategory = (category: Category) => {
    const newData = { ...data, categories: [...data.categories, category] };
    handleSaveData(newData);
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setActiveTab('transactions');
  };

  const handleImport = (importedData: AppData) => {
    handleSaveData(importedData);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'add', label: editingTransaction ? 'Edit' : 'Add Transaction', icon: Plus },
    { id: 'transactions', label: 'Transactions', icon: FileText },
    { id: 'settings', label: 'Backup', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Home className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Decoricks Finance App</h1>
                <p className="text-sm text-gray-500">Home Decor Business Tracker</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              {data.transactions.length} transactions recorded
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Date Filter for Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="mb-6">
            <DateFilter filter={dateFilter} onChange={setDateFilter} />
          </div>
        )}

        {/* Tab Content */}
        <div>
          {activeTab === 'dashboard' && (
            <Dashboard transactions={data.transactions} dateFilter={dateFilter} />
          )}
          
          {activeTab === 'add' && (
            <TransactionForm
              categories={data.categories}
              editingTransaction={editingTransaction}
              onSave={handleSaveTransaction}
              onAddCategory={handleAddCategory}
              onCancel={editingTransaction ? handleCancelEdit : undefined}
            />
          )}
          
          {activeTab === 'transactions' && (
            <TransactionList
              transactions={data.transactions}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
            />
          )}
          
          {activeTab === 'settings' && (
            <ExportImport data={data} onImport={handleImport} />
          )}
        </div>
      </div>
    </div>
  );
};

export default App;