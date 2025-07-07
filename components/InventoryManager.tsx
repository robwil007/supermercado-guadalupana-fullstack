

import React, { useState, useEffect, useMemo } from 'react';
import { Product, Category } from '../types';
import { getProducts, getCategories } from '../api/productService';
import { useData } from '../context/AppContext';
import { LoaderIcon, XIcon, SearchIcon, BoxIcon, TrashIcon } from './icons/InterfaceIcons';

const StockModal: React.FC<{
    product: Product;
    onClose: () => void;
}> = ({ product, onClose }) => {
    const { receiveStock, makeStockAdjustment } = useData();
    const [addQuantity, setAddQuantity] = useState('');
    const [setQuantity, setSetQuantity] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddStock = async () => {
        const quantity = parseInt(addQuantity, 10);
        if (isNaN(quantity) || quantity <= 0) return;
        setLoading(true);
        await receiveStock(product.id, quantity, "Entrada Manual");
        setLoading(false);
        onClose();
    };

    const handleSetStock = async () => {
        const quantity = parseInt(setQuantity, 10);
        if (isNaN(quantity) || quantity < 0) return;
        setLoading(true);
        const stockDifference = quantity - product.stock;
        await makeStockAdjustment(product.id, stockDifference, "Inventario Físico");
        setLoading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fade-in-up">
                 <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"><XIcon /></button>
                <div className="p-6">
                    <h3 className="text-lg font-bold mb-4">Gestionar Stock: {product.name}</h3>
                    <p className="mb-4">Stock actual: <span className="font-bold">{product.stock}</span></p>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Añadir Stock (Entrada)</label>
                            <div className="flex gap-2 mt-1">
                                <input type="number" value={addQuantity} onChange={e => setAddQuantity(e.target.value)} placeholder="Ej: 5" className="w-full p-2 border border-gray-300 rounded-lg"/>
                                <button onClick={handleAddStock} disabled={loading || !addQuantity} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center">
                                    {loading ? <LoaderIcon /> : 'Añadir'}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ajustar Stock Total (Inventario Físico)</label>
                            <div className="flex gap-2 mt-1">
                                <input type="number" value={setQuantity} onChange={e => setSetQuantity(e.target.value)} placeholder={`Ej: ${product.stock}`} className="w-full p-2 border border-gray-300 rounded-lg"/>
                                <button onClick={handleSetStock} disabled={loading || !setQuantity} className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-yellow-300 flex items-center justify-center">
                                    {loading ? <LoaderIcon /> : 'Ajustar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const InventoryManager: React.FC = () => {
    const { allProducts } = useData();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const refreshProducts = async () => {
         const productsData = await getProducts();
         setProducts(productsData.products);
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                 const [categoriesData] = await Promise.all([
                    getCategories()
                ]);
                setProducts(allProducts);
                const sortedCategories = categoriesData.sort((a,b) => a.name.localeCompare(b.name));
                setCategories(sortedCategories);

                if (sortedCategories.length > 0 && !selectedCategory) {
                    setSelectedCategory(sortedCategories[0]);
                }

            } catch (err) {
                setError("No se pudieron cargar los datos del inventario.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        setProducts(allProducts);
    }, [allProducts]);

     const filteredProducts = useMemo(() => {
        if (!selectedCategory) return [];
        
        let categoryProducts = products.filter(p => p.category === selectedCategory.name);

        if (searchTerm) {
            categoryProducts = categoryProducts.filter(p => 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                p.id.toString().includes(searchTerm)
            );
        }
        
        return categoryProducts;
    }, [products, selectedCategory, searchTerm]);

    if (loading) {
        return <div className="flex items-center justify-center h-96"><LoaderIcon className="text-primary" /> Cargando inventario...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 py-10">{error}</div>;
    }

    return (
        <div className="mt-6">
            {selectedProduct && <StockModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Category Selector */}
                <aside className="lg:col-span-1">
                     <div className="bg-white rounded-xl shadow-md p-4 sticky top-24">
                        <h3 className="font-bold text-lg mb-4 text-gray-800">Categorías</h3>
                        <ul className="space-y-1">
                            {categories.map(category => (
                                <li key={category.id}>
                                    <button
                                        onClick={() => setSelectedCategory(category)}
                                        className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors duration-200 ${selectedCategory?.id === category.id ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'}`}
                                    >
                                        <span className="w-6 h-6 flex items-center justify-center">{category.icon}</span>
                                        <span className="font-medium text-sm">{category.name}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>

                {/* Product Table */}
                <main className="lg:col-span-3">
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-4 border-b">
                             <div className="relative">
                                <input
                                    type="text"
                                    placeholder={`Buscar por nombre o código de barras...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <SearchIcon />
                                </div>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Actual</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProducts.map(product => (
                                        <tr key={product.id}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img className="h-10 w-10 rounded-md object-contain" src={product.image} alt={product.name} />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                        <div className="text-sm text-gray-500">Código de barras: {product.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-700 text-right">{product.stock}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <button onClick={() => setSelectedProduct(product)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-3 py-1.5 rounded-full font-semibold text-xs">
                                                    Gestionar Stock
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="text-center py-10 text-gray-500">
                                                {searchTerm ? 'No hay productos que coincidan con tu búsqueda.' : 'No hay productos en esta categoría.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
};

export default InventoryManager;