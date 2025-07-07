import { Product, Category, StockMovement } from '../types';

// =============================================
// PRODUCTION API SERVICE
// =============================================

// Esta es la URL de tu backend desplegado en Vercel.
const BACKEND_URL = "https://supermercado-guadalupana-fullstack-robwils-projects-91e15b0f.vercel.app";

/**
 * Fetches the list of all products from the LIVE Medusa.js backend.
 */
export const getProducts = async (): Promise<{ products: Product[], total: number }> => {
  try {
    const response = await fetch(`${BACKEND_URL}/store/products`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    
    // Medusa.js devuelve productos con `title` y `thumbnail`.
    // Mapeamos estos campos a `name` e `image` que nuestra app espera.
    const mappedProducts: Product[] = data.products.map((p: any) => ({
      id: p.id,
      name: p.title,
      description: p.description,
      price: (p.variants?.[0]?.prices?.[0]?.amount || 0) / 100, // Medusa usa centavos
      image: p.thumbnail || 'https://i.ibb.co/9gT5y1S/placeholder-product.png',
      category: p.collection?.title || 'General',
      stock: 100, // TODO: This will come from Medusa's inventory service later
      cost: 0, // TODO: This will come from a custom field or variant later
    }));

    return { products: mappedProducts, total: data.count };
  } catch (error) {
    console.error("Failed to fetch products from production backend:", error);
    // Fallback a un array vacío si la API falla
    return { products: [], total: 0 };
  }
};

/**
 * Fetches the list of all categories (collections in Medusa) from the backend.
 */
export const getCategories = async (): Promise<Category[]> => {
    // Esta función se puede expandir para llamar a `/store/collections` de Medusa
    // Por ahora, devolvemos las categorías hardcodeadas para mantener la UI
    const { categories: initialCategories } = await import('../constants');
    return initialCategories;
};


// Other functions remain as placeholders for subsequent sprints.
// They are kept here to prevent breaking other parts of the app that call them.
export const getProductMovements = async (productId: string): Promise<StockMovement[]> => { console.warn("API CALL NOT IMPLEMENTED: getProductMovements"); return []; };
export const getAllMovements = async (): Promise<StockMovement[]> => { console.warn("API CALL NOT IMPLEMENTED: getAllMovements"); return []; };
export const updateProductStock = async (productId: string, quantityChange: number, type: StockMovement['type'], reason?: string): Promise<Product> => {
    console.warn("API CALL NOT IMPLEMENTED: updateProductStock");
    // This logic will be handled entirely by the backend now.
    const productsResponse = await getProducts();
    const product = productsResponse.products.find(p => p.id === productId);
    if (!product) throw new Error("Product not found");
    product.stock += quantityChange;
    return product;
};
export const updateProduct = async (updatedProduct: Product): Promise<Product> => { console.warn("API CALL NOT IMPLEMENTED: updateProduct"); return updatedProduct; };
export const createProduct = async (productData: Omit<Product, 'id' | 'stock'>): Promise<void> => { console.warn("API CALL NOT IMPLEMENTED: createProduct"); };
export const processCSVImport = async (products: Product[]): Promise<boolean> => { console.warn("API CALL NOT IMPLEMENTED: processCSVImport"); return true; };
