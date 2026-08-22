import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { categoryService } from '../../services/categoryService';
import { useAppContext } from '../../context/AppContext';

export const CategoryForm = ({ isOpen, onClose, initialData, onSuccess }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useAppContext();

  useEffect(() => {
    if (initialData && isOpen) {
      setName(initialData.name);
    } else {
      setName('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      if (initialData) {
        await categoryService.update(initialData.id, { name });
        addToast('Category updated successfully', 'success');
      } else {
        await categoryService.create({ name });
        addToast('Category created successfully', 'success');
      }
      onSuccess();
    } catch (error) {
      addToast(error.message || 'Failed to save category', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={initialData ? 'Edit Category' : 'Add Category'}
    >
      <form onSubmit={handleSubmit} className="modal-form">
        <Input 
          label="Category Name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="e.g. Food, Transport"
          required 
          autoFocus
        />
        <div className="form-actions">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading || !name.trim()}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
