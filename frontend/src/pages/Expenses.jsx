import React, { useState } from 'react';
import { useExpenses } from '../hooks/useExpenses';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { ExpenseForm } from '../components/expense/ExpenseForm';
import { useAppContext } from '../context/AppContext';
import { expenseService } from '../services/expenseService';
import { format } from 'date-fns';

export const Expenses = () => {
  const { expenses, loading, refetch } = useExpenses();
  const { addToast } = useAppContext();
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

  const handleSuccess = () => {
    setIsModalOpen(false);
    refetch();
  };

  return (
    <div className="page-container">
      <header className="page-header flex-between">
        <div>
          <h1>Expenses</h1>
          <p className="subtitle">Track and manage your expenses</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus size={18} />
          Add Expense
        </Button>
      </header>

      {loading ? (
        <div>Loading expenses...</div>
      ) : (
        <Card className="table-card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th className="action-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>{format(new Date(expense.expenseDate), 'MMM dd, yyyy')}</td>
                    <td>{expense.title}</td>
                    <td>
                      <span className="overline">{expense.categoryName}</span>
                    </td>
                    <td style={{ textAlign: 'right' }} className="numeric">
                      ₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="action-cell">
                      <button className="icon-btn edit-btn" onClick={() => handleEdit(expense)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-btn delete-btn" onClick={() => handleDelete(expense.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan="5" className="empty-state">No expenses found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ExpenseForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingExpense}
        onSuccess={handleSuccess}
      />
    </div>
  );
};
