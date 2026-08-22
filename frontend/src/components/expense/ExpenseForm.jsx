import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { expenseService } from '../../services/expenseService';
import { useCategories } from '../../hooks/useCategories';
import { useAppContext } from '../../context/AppContext';

export const ExpenseForm = ({ isOpen, onClose, initialData, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    categoryId: '',
    expenseDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const { categories } = useCategories();
  const { addToast } = useAppContext();

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        title: initialData.title,
        amount: initialData.amount.toString(),
        categoryId: initialData.categoryId.toString(),
        expenseDate: initialData.expenseDate
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        categoryId: '',
        expenseDate: new Date().toISOString().split('T')[0]
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.amount || !formData.categoryId || !formData.expenseDate) {
      addToast('Please fill all required fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        amount: parseFloat(formData.amount),
        categoryId: parseInt(formData.categoryId, 10),
        expenseDate: formData.expenseDate
      };

      if (initialData) {
        await expenseService.update(initialData.id, payload);
        addToast('Expense updated successfully', 'success');
      } else {
        await expenseService.create(payload);
        addToast('Expense created successfully', 'success');
      }
      onSuccess();
    } catch (error) {
      addToast(error.message || 'Failed to save expense', 'error');
    } finally {
      setLoading(false);
    }
  };

  const categoryOptions = categories.map(cat => ({
    value: cat.id.toString(),
    label: cat.name
  }));

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? 'Edit Expense' : 'Add Expense'}
    >
      <form onSubmit={handleSubmit} className="modal-form">
        <Input 
          label="Title" 
          name="title"
          value={formData.title} 
          onChange={handleChange} 
          placeholder="What was this expense for?"
          required 
          autoFocus
        />
        <div className="form-grid-2">
          <Input 
            label="Amount (₹)" 
            name="amount"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.amount} 
            onChange={handleChange} 
            placeholder="0.00"
            required 
          />
          <Input 
            label="Date" 
            name="expenseDate"
            type="date"
            value={formData.expenseDate} 
            onChange={handleChange} 
            required 
          />
        </div>
        <Select 
          label="Category"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          options={categoryOptions}
          required
        />
        <div className="form-actions">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
