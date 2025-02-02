import { apiClient } from './api.client';

export interface Category {
  _id: string;
  title: string;
  icon: string;
  count: number;
  user: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateCategoryData {
  title: string;
  icon: string;
}

// Get all categories
export const getCategories = async (): Promise<Category[]> => {
  try {
    const { data } = await apiClient.get('/categories');
    return data;
  } catch (error) {
    console.error('Get categories error:', error);
    throw error;
  }
};

// Create new category
export const createCategory = async (categoryData: CreateCategoryData): Promise<Category> => {
  try {
    const { data } = await apiClient.post('/categories', categoryData);
    return data;
  } catch (error) {
    console.error('Create category error:', error);
    throw error;
  }
};

// Update category
export const updateCategory = async (id: string, categoryData: Partial<CreateCategoryData>): Promise<Category> => {
  try {
    const { data } = await apiClient.put(`/categories/${id}`, categoryData);
    return data;
  } catch (error) {
    console.error('Update category error:', error);
    throw error;
  }
};

// Delete category
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    await apiClient.delete(`/categories/${id}`);
  } catch (error) {
    console.error('Delete category error:', error);
    throw error;
  }
};

// Update category count
export const updateCategoryCount = async (id: string, count: number): Promise<Category> => {
  try {
    const { data } = await apiClient.patch(`/categories/${id}/count`, { count });
    return data;
  } catch (error) {
    console.error('Update category count error:', error);
    throw error;
  }
}; 