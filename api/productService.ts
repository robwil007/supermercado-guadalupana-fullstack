
import { Product, Category, StockMovement } from '../types';
import { products as initialProducts, categories as initialCategories } from '../constants';

// This file now simulates making actual API calls to a Medusa.js backend.
// The data is sourced from constants.tsx to mock the database.

/**
 * Fetches the list of all products from the backend.
 * Simulates a network delay.
 */
export const getProducts = async (page: number = 1, limit: number = 100): Promise<{ products: Product[], total: number }> => {
  console.log(`Fetching page ${page} of products from backend API...`);
  // In a real app, this would be:
  // const response = await fetch(`/api/products?page=${page}&limit=${limit}`);
  // if (!response.ok) throw new Error('Failed to fetch products');
  // return await response.json();

  // Simulate API call with delay and pagination
  return new Promise(resolve => {
    setTimeout(() => {
      const productsWithCost = initialProducts.map(p => ({ ...p, cost: p.cost || p.price * 0.7 }));
      const paginatedProducts = productsWithCost.slice((page - 1) * limit, page * limit);
      resolve({ products: paginatedProducts, total: productsWithCost.length });
    }, 500);
  });
};


/**
 * Fetches the list of all categories from the backend.
 */
export const getCategories = async (): Promise<Category[]> => {
    console.log("Fetching categories from backend API...");
    // In a real app, this would be: const response = await fetch('/api/categories');
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(initialCategories);
        }, 200);
    });
};


// Other functions remain as placeholders for subsequent sprints.
// They are kept here to prevent breaking other parts of the app that call them.
export const getProductMovements = async (productId: string): Promise<StockMovement[]> => { console.warn("API CALL NOT IMPLEMENTED: getProductMovements"); return []; };
export const getAllMovements = async (): Promise<StockMovement[]> => { console.warn("API CALL NOT IMPLEMENTED: getAllMovements"); return []; };
export const updateProductStock = async (productId: string, quantityChange: number, type: StockMovement['type'], reason?: string): Promise<Product> => {
    console.warn("API CALL NOT IMPLEMENTED: updateProductStock");
    const product = initialProducts.find(p => p.id === productId);
    if (!product) throw new Error("Product not found");
    product.stock += quantityChange;
    return product;
};
export const updateProduct = async (updatedProduct: Product): Promise<Product> => { console.warn("API CALL NOT IMPLEMENTED: updateProduct"); return updatedProduct; };
export const createProduct = async (productData: Omit<Product, 'id' | 'stock'>): Promise<void> => { console.warn("API CALL NOT IMPLEMENTED: createProduct"); };
export const processCSVImport = async (products: Product[]): Promise<boolean> => { console.warn("API CALL NOT IMPLEMENTED: processCSVImport"); return true; };
