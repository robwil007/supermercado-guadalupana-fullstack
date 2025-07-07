

import React, { useState, useEffect, useMemo } from 'react';
import { Product } from '../types';
import { getProducts } from '../api/productService';
import { useData } from '../context/AppContext';
import { LoaderIcon, XIcon, SearchIcon, WarningIcon, ArrowUpIcon, ArrowDownIcon } from './icons/InterfaceIcons';

type SortKey = keyof Product | 'stockValue';
type SortDirection = 'asc' | 'desc';

const LOW_STOCK_THRESHOLD = 20;

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
        await receiveStock(product.id, quantity, 'Entrada Manual');
        setLoading(false);
        onClose();
    };

    const handleSetStock = async () => {
        const quantity = parseInt(setQuantity, 10);
        if (isNaN(quantity) || quantity < 0) return;
        setLoading(true);
        const stockDifference = quantity - product.stock;
        await makeStockAdjustment(product.id, stockDifference, 'Inventario Físico');
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


const InventorySummary: React.FC = () => {
    const { allProducts } = useData();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({ key: 'name', direction: 'asc' });

    
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setProducts(allProducts);
            setLoading(false);
        };
        fetchData();
    }, [allProducts]);

    useEffect(() => {
        if (!selectedProduct) {
            setProducts(allProducts);
        }
    }, [selectedProduct, allProducts]);

    const inventoryKpis = useMemo(() => {
        const totalValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);
        const totalItems = products.reduce((sum, p) => sum + p.stock, 0);
        const skuCount = products.length;
        const lowStockCount = products.filter(p => p.stock <= LOW_STOCK_THRESHOLD && p.stock > 0).length;
        return { totalValue, totalItems, skuCount, lowStockCount };
    }, [products]);
    
    const lowStockProducts = useMemo(() => {
        return products.filter(p => p.stock <= LOW_STOCK_THRESHOLD).sort((a,b) => a.stock - b.stock);
    }, [products]);

    const sortedAndFilteredProducts = useMemo(() => {
        let filtered = [...products];

        if(searchTerm){
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered.sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;

            if(sortConfig.key === 'stockValue') {
                aValue = a.stock * a.price;
                bValue = b.stock * b.price;
            } else {
                aValue = a[sortConfig.key as keyof Product] as string | number;
                bValue = b[sortConfig.key as keyof Product] as string | number;
            }

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [products, searchTerm, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: SortDirection = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key: SortKey) => {
        if (sortConfig.key !== key) return null;
        if (sortConfig.direction === 'asc') return <ArrowUpIcon />;
        return <ArrowDownIcon />;
    };

    const SortableHeader: React.FC<{ sortKey: SortKey, className?: string, children: React.ReactNode }> = ({ sortKey, className, children }) => (
        <th scope="col" className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${className}`} onClick={() => requestSort(sortKey)}>
            <div className="flex items-center justify-between">
                {children}
                <span className="ml-2 w-4 h-4">{getSortIcon(sortKey)}</span>
            </div>
        </th>
    );

    if (loading) {
        return <div className="flex items-center justify-center h-96"><LoaderIcon className="text-primary" /> Cargando resumen...</div>;
    }

    if (error) {
        return <div className="text-center text-red-500 py-10">{error}</div>;
    }

    return (
        <div className="mt-6 space-y-6">
            {selectedProduct && <StockModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white rounded-xl shadow p-5"><p className="text-sm font-medium text-gray-500">Valor Total del Inventario</p><p className="mt-1 text-3xl font-semibold text-gray-900">Bs. {inventoryKpis.totalValue.toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p></div>
                <div className="bg-white rounded-xl shadow p-5"><p className="text-sm font-medium text-gray-500">Artículos Totales en Stock</p><p className="mt-1 text-3xl font-semibold text-gray-900">{inventoryKpis.totalItems.toLocaleString('es-ES')}</p></div>
                <div className="bg-white rounded-xl shadow p-5"><p className="text-sm font-medium text-gray-500">SKUs Únicos</p><p className="mt-1 text-3xl font-semibold text-gray-900">{inventoryKpis.skuCount}</p></div>
                <div className={`bg-white rounded-xl shadow p-5 ${inventoryKpis.lowStockCount > 0 ? 'border-2 border-yellow-400' : ''}`}><p className="text-sm font-medium text-gray-500">Productos con Bajo Stock</p><p className={`mt-1 text-3xl font-semibold ${inventoryKpis.lowStockCount > 0 ? 'text-yellow-600' : 'text-gray-900'}`}>{inventoryKpis.lowStockCount}</p></div>
            </div>

            {/* Low Stock Alerts */}
            {lowStockProducts.length > 0 && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="p-4 border-b bg-yellow-50 flex items-center gap-2">
                        <WarningIcon className="text-yellow-500 h-6 w-6" />
                        <h3 className="text-lg font-bold text-yellow-800">Alertas de Bajo Stock ( &le; {LOW_STOCK_THRESHOLD} unidades)</h3>
                    </div>
                    <div className="overflow-x-auto max-h-72">
                         <table className="min-w-full divide-y divide-gray-200">
                            <tbody className="bg-white divide-y divide-gray-200">
                                {lowStockProducts.map(p => (
                                    <tr key={p.id}>
                                        <td className="px-6 py-3"><img className="h-10 w-10 rounded-md object-contain" src={p.image} alt={p.name} /></td>
                                        <td className="px-6 py-3 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{p.name}</div><div className="text-xs text-gray-500">{p.id}</div></td>
                                        <td className={`px-6 py-3 whitespace-nowrap text-lg font-bold text-center ${p.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>{p.stock}</td>
                                        <td className="px-6 py-3 whitespace-nowrap text-center">
                                             <button onClick={() => setSelectedProduct(p)} className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-3 py-1.5 rounded-full font-semibold text-xs">Gestionar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                         </table>
                    </div>
                </div>
            )}
            
            {/* Full Inventory Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                         <h3 className="text-lg font-bold text-gray-800">Inventario Completo</h3>
                         <div className="relative w-1/3">
                            <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50" />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <SortableHeader sortKey="name" className="text-left">Producto</SortableHeader>
                                <SortableHeader sortKey="category" className="text-left">Categoría</SortableHeader>
                                <SortableHeader sortKey="price" className="text-right">Precio</SortableHeader>
                                <SortableHeader sortKey="stock" className="text-right">Stock</SortableHeader>
                                <SortableHeader sortKey="stockValue" className="text-right">Valor Stock</SortableHeader>
                            </tr>
                        </thead>
                         <tbody className="bg-white divide-y divide-gray-200">
                            {sortedAndFilteredProducts.map(p => (
                                <tr key={p.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10"><img className="h-10 w-10 rounded-md object-contain" src={p.image} alt={p.name} /></div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{p.name}</div>
                                                <div className="text-sm text-gray-500">{p.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{p.category}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">Bs. {p.price.toFixed(2)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-800 text-right">{p.stock}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-600 text-right">Bs. {(p.stock * p.price).toFixed(2)}</td>
                                </tr>
                            ))}
                            {sortedAndFilteredProducts.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-10 text-gray-500">No hay productos que coincidan.</td></tr>
                            )}
                         </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
};

export default InventorySummary;