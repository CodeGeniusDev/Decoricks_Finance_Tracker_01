import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Transaction, DateRangeFilter } from '../types';
import { getDateRange, convertToPKR } from '../utils/dateUtils';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface DashboardProps {
  transactions: Transaction[];
  dateFilter: DateRangeFilter;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, dateFilter }) => {
  const { start, end } = getDateRange(dateFilter);
  
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate >= start && transactionDate <= end;
  });

  const totals = filteredTransactions.reduce(
    (acc, transaction) => {
      const amount = convertToPKR(transaction.amount, transaction.currency);
      
      if (transaction.type === 'income') {
        acc.income += amount;
      } else {
        acc.expenses += amount;
      }
      return acc;
    },
    { income: 0, expenses: 0 }
  );

  const balance = totals.income - totals.expenses;

  // Category breakdown for income
  const incomeByCategory = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      const amount = convertToPKR(t.amount, t.currency);
      acc[t.category] = (acc[t.category] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);

  // Category breakdown for expenses
  const expensesByCategory = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const amount = convertToPKR(t.amount, t.currency);
      acc[t.category] = (acc[t.category] || 0) + amount;
      return acc;
    }, {} as Record<string, number>);

  const incomeChartData = {
    labels: Object.keys(incomeByCategory),
    datasets: [{
      data: Object.values(incomeByCategory),
      backgroundColor: [
        '#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  const expenseChartData = {
    labels: Object.keys(expensesByCategory),
    datasets: [{
      data: Object.values(expensesByCategory),
      backgroundColor: [
        '#EF4444', '#F87171', '#FCA5A5', '#FECACA', '#FEE2E2', '#FEF2F2'
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: PKR ${context.parsed.toLocaleString()}`;
          }
        }
      }
    }
  };

  const getFilterLabel = () => {
    switch (dateFilter.type) {
      case 'daily': return 'Today';
      case 'weekly': return 'This Week';
      case 'monthly': return 'This Month';
      case 'custom': return 'Custom Range';
      default: return 'All Time';
    }
  };

  return (
    <div className="space-y-6">
      {/* Filter Info */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 text-blue-800">
          <Calendar className="h-5 w-5" />
          <span className="font-medium">Showing data for: {getFilterLabel()}</span>
          {dateFilter.type === 'custom' && dateFilter.startDate && dateFilter.endDate && (
            <span className="text-sm">
              ({dateFilter.startDate} to {dateFilter.endDate})
            </span>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
              <p className="text-2xl font-bold text-gray-900">
                PKR {totals.income.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
              <p className="text-2xl font-bold text-gray-900">
                PKR {totals.expenses.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
              <DollarSign className={`h-6 w-6 ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Net Balance</h3>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                PKR {balance.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Income by Category</h3>
          {Object.keys(incomeByCategory).length > 0 ? (
            <div className="h-80">
              <Doughnut data={incomeChartData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No income data for selected period
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
          {Object.keys(expensesByCategory).length > 0 ? (
            <div className="h-80">
              <Doughnut data={expenseChartData} options={chartOptions} />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              No expense data for selected period
            </div>
          )}
        </div>
      </div>

      {/* Transaction Summary */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">
              {filteredTransactions.filter(t => t.type === 'income').length}
            </p>
            <p className="text-sm text-gray-500">Income Entries</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-red-600">
              {filteredTransactions.filter(t => t.type === 'expense').length}
            </p>
            <p className="text-sm text-gray-500">Expense Entries</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {filteredTransactions.length}
            </p>
            <p className="text-sm text-gray-500">Total Entries</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">
              {new Set(filteredTransactions.map(t => t.category)).size}
            </p>
            <p className="text-sm text-gray-500">Categories Used</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;