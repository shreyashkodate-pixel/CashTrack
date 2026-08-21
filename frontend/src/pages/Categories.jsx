import React, { useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { CategoryForm } from '../components/category/CategoryForm';
import { useAppContext } from '../context/AppContext';
import { categoryService } from '../services/categoryService';
import './Categories.css';

export const Categories = () => {
  const { categories, loading, refetch } = useCategories();
  const { addToast } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoryService.delete(id);
      addToast('Category deleted successfully', 'success');
      refetch();
    } catch (error) {
      addToast(error.message || 'Failed to delete category', 'error');
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
          <h1>Categories</h1>
          <p className="subtitle">Manage your expense categories</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus size={18} />
          Add Category
        </Button>
      </header>

      {loading ? (
        <div>Loading categories...</div>
      ) : (
        <Card className="table-card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th className="action-cell">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>{category.name}</td>
                    <td className="action-cell">
                      <button className="icon-btn edit-btn" onClick={() => handleEdit(category)}>
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-btn delete-btn" onClick={() => handleDelete(category.id)}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan="2" className="empty-state">No categories found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <CategoryForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingCategory}
        onSuccess={handleSuccess}
      />
    </div>
  );
};
