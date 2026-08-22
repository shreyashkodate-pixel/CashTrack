import React, { useState, useMemo } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { useCategories } from '../hooks/useCategories';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { TableRowSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ExpenseForm } from '../components/expense/ExpenseForm';
import { useAppContext } from '../context/AppContext';
import { expenseService } from '../services/expenseService';
import { Plus, Edit2, Trash2, FilterX, Receipt } from 'lucide-react';
import { format } from 'date-fns';
import './Expenses.css';

export const Expenses = () => {
  const { expenses, loading, refetch } = useExpenses();
  const { categories } = useCategories();
  const { addToast } = useAppContext();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const handleAdd = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await expenseService.delete(id);
      addToast('Expense deleted successfully', 'success');
      refetch();
    } catch (error) {
      addToast(error.message || 'Failed to delete expense', 'error');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters = searchQuery || selectedCategory || dateFrom || dateTo;

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp) => {
      // Search Title
      if (searchQuery && !exp.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Category Filter
      if (selectedCategory && exp.categoryId.toString() !== selectedCategory) {
        return false;
      }
      // Date Range Filters
      if (dateFrom && exp.expenseDate < dateFrom) {
        return false;
      }
      if (dateTo && exp.expenseDate > dateTo) {
        return false;
      }
      return true;
    });
  }, [expenses, searchQuery, selectedCategory, dateFrom, dateTo]);

  const categoryOptions = categories.map((cat) => ({
    value: cat.id.toString(),
    label: cat.name
  }));

  return (
    <div className="page-container">
      <header className="page-header">
        <div className="page-header-text">
          <h1>Expenses</h1>
          <p className="page-subtitle">Log, filter, and track all your transactions</p>
        </div>
        <Button onClick={handleAdd} variant="primary">
          <Plus size={16} />
          <span>Add Expense</span>
        </Button>
      </header>

      {/* Filter Toolbar */}
      <div className="filter-toolbar" role="search" aria-label="Filter expenses">
        <div className="filter-item">
          <Input 
            placeholder="Search by title..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <Select 
            placeholder="All Categories"
            options={categoryOptions}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <Input 
            type="date"
            placeholder="From Date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>

        <div className="filter-item">
          <Input 
            type="date"
            placeholder="To Date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>

        {hasActiveFilters && (
          <div className="filter-actions">
            <Button onClick={handleClearFilters} variant="ghost" size="sm">
              <FilterX size={14} />
              <span>Clear</span>
            </Button>
          </div>
        )}
      </div>

      {/* Expenses Table */}
      <Card className="table-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Category</th>
                <th className="text-right">Amount</th>
                <th className="action-cell">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  <TableRowSkeleton columns={5} />
                  <TableRowSkeleton columns={5} />
                  <TableRowSkeleton columns={5} />
                  <TableRowSkeleton columns={5} />
                </>
              ) : filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{format(new Date(expense.expenseDate), 'MMM dd, yyyy')}</td>
                    <td className="font-medium">{expense.title}</td>
                    <td>
                      <span className="delta-chip neutral">{expense.categoryName}</span>
                    </td>
                    <td className="text-right numeric">
                      ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="action-cell">
                      <button 
                        className="icon-btn edit-btn" 
                        onClick={() => handleEdit(expense)}
                        title="Edit expense"
                        aria-label="Edit expense"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="icon-btn delete-btn" 
                        onClick={() => handleDelete(expense.id)}
                        title="Delete expense"
                        aria-label="Delete expense"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : null}
            </tbody>
          </table>

          {!loading && filteredExpenses.length === 0 && (
            <div className="empty-state-wrapper">
              <EmptyState 
                icon={Receipt}
                title={hasActiveFilters ? "No matching expenses" : "No expenses recorded"}
                description={
                  hasActiveFilters 
                    ? "Try adjusting your filters or search query to find what you're looking for." 
                    : "Get started by recording your first expense transaction."
                }
                actionLabel={hasActiveFilters ? "Clear Filters" : "Add First Expense"}
                onAction={hasActiveFilters ? handleClearFilters : handleAdd}
              />
            </div>
          )}
        </div>
      </Card>

      <ExpenseForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingExpense}
        onSuccess={() => {
          setIsModalOpen(false);
          refetch();
        }}
      />
    </div>
  );
};
