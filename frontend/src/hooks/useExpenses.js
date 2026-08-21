import { useState, useEffect, useCallback } from 'react';
import { expenseService } from '../services/expenseService';

export const useExpenses = (filters = {}) => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({ totalCount: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [expensesData, summaryData] = await Promise.all([
        expenseService.getAll(filters),
        expenseService.getSummary(filters)
      ]);
      setExpenses(expensesData);
      setSummary(summaryData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]); // Simple dependency tracking for filters object

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  return { expenses, summary, loading, error, refetch: fetchExpenses };
};
