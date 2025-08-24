import { DateRangeFilter } from '../types';

export const getDateRange = (filter: DateRangeFilter): { start: Date; end: Date } => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (filter.type) {
    case 'daily':
      return {
        start: today,
        end: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1)
      };
    
    case 'weekly':
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      return { start: weekStart, end: weekEnd };
    
    case 'monthly':
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);
      return { start: monthStart, end: monthEnd };
    
    case 'custom':
      return {
        start: filter.startDate ? new Date(filter.startDate) : today,
        end: filter.endDate ? new Date(filter.endDate + 'T23:59:59') : today
      };
    
    default:
      return { start: today, end: today };
  }
};

export const formatCurrency = (amount: number, currency: 'PKR' | 'USD'): string => {
  return `${currency} ${amount.toLocaleString()}`;
};

export const convertToPKR = (amount: number, currency: 'PKR' | 'USD'): number => {
  return currency === 'USD' ? amount * 280 : amount; // Rough conversion rate
};