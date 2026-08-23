import React, { useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import { Button } from '../components/common/Button';
import { Skeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { CategoryForm } from '../components/category/CategoryForm';
import { useAppContext } from '../context/AppContext';
import { categoryService } from '../services/categoryService';
import { Plus, Edit2, Trash2, Tags, Tag } from 'lucide-react';
import './Categories.css';

export const Categories = () => {
  const { categories, loading, error, refetch } = useCategories();
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
    if (!window.confirm('Are you sure you want to delete this category? Any associated expenses may prevent deletion.')) return;
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
      <header className="page-header">
        <div className="page-header-text">
          <h1>Categories</h1>
          <p className="page-subtitle">Manage and organize your custom expense categories</p>
        </div>
        <Button onClick={handleAdd} variant="primary">
          <Plus size={16} />
          <span>Add Category</span>
        </Button>
      </header>

      {error ? (
        <ErrorState 
          title="Connection to server failed"
          description="Could not fetch categories. Please verify your Render backend configuration, CORS allowed origins, and database credentials."
          error={error}
          onRetry={refetch}
        />
      ) : loading ? (
        <div className="categories-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="category-card skeleton-category-card">
              <div className="skeleton-category-inner">
                <Skeleton width="36px" height="36px" circle />
                <Skeleton width="50%" height="16px" />
              </div>
            </div>
          ))}
        </div>
      ) : categories.length > 0 ? (
        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <div className="category-badge-wrapper">
                <div className="category-icon-bubble">
                  <Tag size={18} />
                </div>
                <span className="category-name-text">{category.name}</span>
              </div>
              <div className="category-actions">
                <button 
                  className="icon-btn edit-btn" 
                  onClick={() => handleEdit(category)}
                  title="Edit category"
                  aria-label="Edit category"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  className="icon-btn delete-btn" 
                  onClick={() => handleDelete(category.id)}
                  title="Delete category"
                  aria-label="Delete category"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState 
          icon={Tags}
          title="No categories found"
          description="Create your first category to start organizing your transactions."
          actionLabel="Add Category"
          onAction={handleAdd}
        />
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
