"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { LoadingPage } from "@/components/ui/LoadingSpinner";
import Modal, { ConfirmModal } from "@/components/ui/Modal";
import { toast } from "sonner";
import { slugify } from "@/lib/slugify";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  _count?: {
    products: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle category selection
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setSearchTerm(category.name);
    setShowDropdown(false);
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowDropdown(true);
    if (!value.trim()) {
      setSelectedCategory(null);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: slugify(name), // Auto-generate slug
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      setUpdating(true);
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories";
      
      const method = editingCategory ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchCategories();
        // If we were editing, refresh the selected category
        if (editingCategory) {
          const updatedCategory = await response.json();
          setSelectedCategory(updatedCategory);
          setSearchTerm(updatedCategory.name);
        }
        resetForm();
        toast.success(editingCategory ? "Category updated successfully" : "Category created successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to save category");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("Failed to save category");
    } finally {
      setUpdating(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
    });
    setShowEditModal(true);
  };

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;

    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchCategories();
        // Clear selection if we deleted the selected category
        if (selectedCategory && selectedCategory.id === categoryToDelete.id) {
          setSelectedCategory(null);
          setSearchTerm("");
        }
        setShowDeleteModal(false);
        setCategoryToDelete(null);
        toast.success("Category deleted successfully");
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category");
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", slug: "", description: "" });
    setEditingCategory(null);
    setShowAddForm(false);
    setShowEditModal(false);
  };

  if (loading) {
    return <LoadingPage message="Loading categories..." />;
  }

  return (
    <div className="grid gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-semibold">Categories Management</h1>
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          variant="primary"
        >
          {showAddForm ? "Cancel" : "Add Category"}
        </Button>
      </div>

      {/* Category Search & Selection */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Select Category</h2>
        <div className="relative max-w-md dropdown-container">
          <Input
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search categories..."
            className="w-full pr-10"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {filteredCategories.length === 0 ? (
                <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                  {searchTerm ? "No categories found" : "No categories available"}
                </div>
              ) : (
                filteredCategories.map((category) => (
                  <div
                    key={category.id}
                    onClick={() => handleCategorySelect(category)}
                    className="px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {category.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                          /{category.slug}
                        </div>
                      </div>
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-xs">
                        {category._count?.products || 0} products
                      </span>
                    </div>
                    {category.description && (
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-1">
                        {category.description}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Clear Selection */}
        {selectedCategory && (
          <Button
            onClick={() => {
              setSelectedCategory(null);
              setSearchTerm("");
            }}
            variant="secondary"
            className="mt-3 text-sm"
          >
            Clear Selection
          </Button>
        )}
      </Card>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingCategory ? "Edit Category" : "Add New Category"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Category Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter category name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Slug (Auto-generated)
              </label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="category-slug"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL-friendly version of the name. Auto-generated but can be customized.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the category"
                className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 resize-none"
                rows={3}
              />
            </div>

            <div className="flex gap-3">
              <Button type="submit" variant="primary">
                {editingCategory ? "Update Category" : "Create Category"}
              </Button>
              <Button type="button" onClick={resetForm} variant="secondary">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Selected Category Details */}
      {selectedCategory ? (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Category Details</h2>
            <div className="flex gap-2">
              <Button
                onClick={() => handleEdit(selectedCategory)}
                variant="secondary"
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
              >
                <span className="hidden sm:inline">Edit Category</span>
                <span className="sm:hidden">✏️</span>
              </Button>
              <Button
                onClick={() => handleDeleteClick(selectedCategory)}
                variant="secondary"
                className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30 dark:text-red-300 dark:border-red-800"
              >
                <span className="hidden sm:inline">Delete Category</span>
                <span className="sm:hidden">🗑️</span>
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category Name
                </label>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedCategory.name}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL Slug
                </label>
                <div className="text-sm font-mono text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                  /{selectedCategory.slug}
                </div>
              </div>

              {selectedCategory.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <div className="text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                    {selectedCategory.description}
                  </div>
                </div>
              )}
            </div>

            {/* Statistics */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Products Count
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {selectedCategory._count?.products || 0}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">products</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Created Date
                </label>
                <div className="text-gray-600 dark:text-gray-300">
                  {new Date(selectedCategory.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Updated
                </label>
                <div className="text-gray-600 dark:text-gray-300">
                  {new Date(selectedCategory.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-8">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 className="text-lg font-medium mb-2">No Category Selected</h3>
            <p className="text-sm mb-4">
              {categories.length === 0 
                ? "No categories available. Create your first category to get started."
                : "Search and select a category from the dropdown above to view its details."
              }
            </p>
            {categories.length === 0 && (
              <Button 
                onClick={() => setShowAddForm(true)}
                variant="primary"
              >
                Create First Category
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Edit Category Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCategory(null);
          resetForm();
        }}
        title="Edit Category"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Category Name *
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter category name"
              required
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Slug (Auto-generated)
            </label>
            <Input
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="category-slug"
              className="w-full font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              URL-friendly version of the name. Auto-generated but can be customized.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the category"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              type="submit" 
              variant="primary" 
              disabled={updating}
              className="flex-1"
            >
              {updating ? "Updating..." : "Update Category"}
            </Button>
            <Button 
              type="button" 
              onClick={() => {
                setShowEditModal(false);
                setEditingCategory(null);
                resetForm();
              }} 
              variant="secondary"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCategoryToDelete(null);
        }}
        title="Delete Category"
        size="sm"
      >
        <div className="mb-6">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {categoryToDelete && categoryToDelete._count && categoryToDelete._count.products > 0
              ? `Cannot delete "${categoryToDelete.name}" because it has ${categoryToDelete._count.products} product(s). You need to change the category of these products first before deleting this category.`
              : `Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
          </p>
        </div>
        
        <div className="flex justify-end gap-3">
          <Button 
            variant="secondary" 
            onClick={() => {
              setShowDeleteModal(false);
              setCategoryToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="secondary"
            onClick={handleDeleteConfirm}
            disabled={
              (categoryToDelete && categoryToDelete._count && categoryToDelete._count.products > 0) || deleting
            }
            className={`${
              categoryToDelete && categoryToDelete._count && categoryToDelete._count.products > 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-600 dark:text-gray-400"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            {categoryToDelete && categoryToDelete._count && categoryToDelete._count.products > 0
              ? "Cannot Delete"
              : deleting ? "Deleting..." : "Delete Category"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
