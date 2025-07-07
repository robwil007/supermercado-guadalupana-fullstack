

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Product, StockMovement, Category } from '../types';
import { useData } from '../context/AppContext';
import { getCategories } from '../api/productService';
import { LoaderIcon, XIcon, SearchIcon, UploadIcon, DownloadIcon, HistoryIcon, ArrowUpIcon, ArrowDownIcon, PlusIcon } from './icons/InterfaceIcons';
import ProductDetailPanel from './ProductDetailPanel';

type SortKey = keyof Product | 'profit' | 'margin';

const HistoryModal: React.FC<{ product: Product; onClose: () => void; }> = ({ product, onClose }) => {
    const { getProductMovements } = useData();
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovements = async () => {
            setLoading(true);
            const data = await getProductMovements(product.id);
            setMovements(data);
            setLoading(false);
        };
        fetchMovements();
    }, [product.id, getProductMovements]);

    const getMovementTypeStyle = (type: StockMovement['type']) => {
        switch(type) {
            case 'reception': return 'bg-blue-100 text-blue-800';
            case 'sale-pos':
            case 'sale-online': return 'bg-green-100 text-green-800';
            case 'adjustment': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh]">
                <header className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold">Historial de Movimientos: {product.name}</h3>
                    <button onClick={onClose}><XIcon /></button>
                </header>
                <div className="p-4 flex-grow overflow-y-auto">
                    {loading ? <LoaderIcon className="text-primary"/> : (
                        <table className="min-w-full divide-y divide-gray-200">
                           <thead className="bg-gray-50">
                               <tr>
                                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Fecha</th>
                                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Tipo</th>
                                   <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Cantidad</th>
                                   <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Razón/Detalle</th>
                               </tr>
                           </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {movements.map(m => (
                                    <tr key={m.id}>
                                        <td className="px-4 py-2 whitespace-nowrap text-sm">{new Date(m.date).toLocaleString('es-ES')}</td>
                                        <td className="px-4 py-2"><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getMovementTypeStyle(m.type)}`}>{m.type}</span></td>
                                        <td className={`px-4 py-2 text-right font-bold ${m.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>{m.quantity}</td>
                                        <td className="px-4 py-2 text-sm text-gray-600">{m.reason}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                     {movements.length === 0 && !loading && <p className="text-center text-gray-500 py-8">No hay movimientos para este producto.</p>}
                </div>
            </div>
        </div>
    )
};

const AdjustmentModal: React.FC<{ product: Product; onClose: () => void; type: 'reception' | 'adjustment' }> = ({ product, onClose, type }) => {
    const { receiveStock, makeStockAdjustment } = useData();
    const [quantity, setQuantity] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isReception = type === 'reception';
    const reasons = ['Dañado', 'Vencido', 'Pérdida/Robo', 'Uso Interno', 'Error de Conteo'];

    const handleSubmit = async () => {
        const numQuantity = parseInt(quantity, 10);
        if(isNaN(numQuantity) || numQuantity <= 0) {
            alert('Cantidad inválida'); return;
        }
        if(!isReception && !reason) {
            alert('Debe seleccionar una razón para el ajuste.'); return;
        }
        
        setIsSubmitting(true);
        if(isReception) {
            await receiveStock(product.id, numQuantity, reason || 'Recepción de mercadería');
        } else {
            await makeStockAdjustment(product.id, -numQuantity, reason);
        }
        setIsSubmitting(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <header className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold">{isReception ? 'Registrar Entrada de Mercadería' : 'Registrar Ajuste de Inventario'}</h3>
                    <button onClick={onClose}><XIcon /></button>
                </header>
                <div className="p-6 space-y-4">
                    <p>Producto: <span className="font-semibold">{product.name}</span></p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Cantidad (en unidades)</label>
                        <input type="number" value={quantity} onChange={e => setQuantity(e.target.value)} className="w-full mt-1 p-2 border rounded" placeholder={isReception ? "Ej: 120" : "Ej: 5"}/>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700">{isReception ? 'Razón/Referencia (Opcional)' : 'Razón (Requerido)'}</label>
                         {isReception ? (
                            <input type="text" value={reason} onChange={e => setReason(e.target.value)} className="w-full mt-1 p-2 border rounded" placeholder="Ej: Factura #1234, Proveedor PIL"/>
                         ) : (
                            <select value={reason} onChange={e => setReason(e.target.value)} className="w-full mt-1 p-2 border rounded bg-white">
                                <option value="">Seleccione una razón...</option>
                                {reasons.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                         )}
                    </div>
                </div>
                 <footer className="p-4 bg-gray-50 border-t">
                    <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-2 bg-primary text-white font-bold rounded hover:bg-primary-dark disabled:bg-gray-400">
                        {isSubmitting ? <LoaderIcon /> : 'Confirmar'}
                    </button>
                </footer>
            </div>
        </div>
    )
};

const ImportModal: React.FC<{ onClose: () => void; onImport: (products: Product[]) => void }> = ({ onClose, onImport }) => {
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            try {
                const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
                if (lines.length < 2) throw new Error("CSV inválido o vacío.");
                
                const headers = lines[0].split(',').map(h => h.trim());
                const requiredHeaders = ['id', 'name', 'cost', 'price', 'stock', 'category', 'image'];
                if(!requiredHeaders.every(h => headers.includes(h))) {
                    throw new Error(`El archivo CSV debe contener las siguientes columnas: ${requiredHeaders.join(', ')}`);
                }

                const products: Product[] = lines.slice(1).map(line => {
                    const values = line.split(',');
                    const productData = headers.reduce((obj, header, index) => {
                       obj[header as keyof Product] = values[index]?.trim() as any;
                       return obj;
                    }, {} as any);
                    
                    // Type conversion and validation
                    productData.price = parseFloat(productData.price) || 0;
                    productData.cost = parseFloat(productData.cost) || 0;
                    productData.stock = parseInt(productData.stock, 10) || 0;
                    
                    if(productData.bundle_offers && typeof productData.bundle_offers === 'string') {
                        try {
                           productData.bundleOffers = JSON.parse(productData.bundle_offers.replace(/""/g, '"'));
                        } catch {
                           productData.bundleOffers = [];
                        }
                    } else {
                        productData.bundleOffers = [];
                    }

                    return productData;
                });

                onImport(products);
                onClose();
            } catch (error: any) {
                alert(`Error al procesar el archivo CSV: ${error.message}`);
                console.error(error);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <header className="p-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-bold">Importar Productos desde CSV</h3>
                    <button onClick={onClose}><XIcon /></button>
                </header>
                 <div className="p-6 space-y-4">
                    <p className="text-sm">Sube un archivo CSV con las siguientes columnas: <br/> <code className="bg-gray-100 p-1 rounded text-xs">id,name,cost,price,stock,category,image,bundle_offers</code></p>
                    <p className="text-xs text-gray-500">Nota: La importación actualizará los productos existentes (por ID) o creará nuevos si el ID no existe. La columna `bundle_offers` debe ser un string JSON válido, ej: `"[{\\"quantity\\":2,\\"price\\":15}]"`. Si no hay ofertas, dejar en blanco.</p>
                    <input type="file" accept=".csv" onChange={handleFileChange} className="w-full p-2 border rounded"/>
                </div>
            </div>
        </div>
    )
};


const InventoryHub: React.FC = () => {
    const { allProducts, processProductImport } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortKey, direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
    const [selectedProduct, setSelectedProduct] = useState<Product | Partial<Product> | null>(null);
    const [isNewProduct, setIsNewProduct] = useState(false);
    const [modal, setModal] = useState<'history' | 'reception' | 'adjustment' | 'import' | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
       const fetchCategories = async () => {
           const cats = await getCategories();
           setCategories(cats);
       }
       fetchCategories();
    }, [])
    
    const handleSelectProduct = (product: Product) => {
        setSelectedProduct(product);
        setIsNewProduct(false);
    }
    
    const handleAddNewProduct = () => {
        const newProdTemplate: Product = {
            id: `new-product-${Date.now()}`, // Add a temporary ID
            stock: 0, // Add stock
            name: '',
            category: categories[0]?.name || '',
            price: 0,
            cost: 0,
            image: 'https://i.ibb.co/9gT5y1S/placeholder-product.png',
            bundleOffers: []
        };
        setSelectedProduct(newProdTemplate);
        setIsNewProduct(true);
    };

    const handleClosePanel = () => {
        setSelectedProduct(null);
        setIsNewProduct(false);
    }

    const filteredAndSortedProducts = useMemo(() => {
        let filtered = [...allProducts];
        if (searchTerm) {
             filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        return filtered.sort((a, b) => {
            let aValue: any;
            let bValue: any;

            if (sortConfig.key === 'profit') {
                aValue = (a.price || 0) - (a.cost || 0);
                bValue = (b.price || 0) - (b.cost || 0);
            } else if (sortConfig.key === 'margin') {
                aValue = a.price > 0 ? ((a.price - (a.cost || 0)) / a.price) * 100 : 0;
                bValue = b.price > 0 ? ((b.price - (b.cost || 0)) / b.price) * 100 : 0;
            } else {
                aValue = a[sortConfig.key as keyof Product];
                bValue = b[sortConfig.key as keyof Product];
            }
            
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [allProducts, searchTerm, sortConfig]);

    const requestSort = (key: SortKey) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleExportCSV = () => {
        const headers = ['id', 'name', 'cost', 'price', 'stock', 'category', 'image', 'bundle_offers'];
        const csvContent = [
            headers.join(','),
            ...allProducts.map(p => {
                const row = [
                    p.id,
                    `"${p.name.replace(/"/g, '""')}"`,
                    p.cost || 0,
                    p.price,
                    p.stock,
                    p.category,
                    p.image,
                    p.bundleOffers ? `"${JSON.stringify(p.bundleOffers).replace(/"/g, '""')}"` : ''
                ];
                return row.join(',');
            })
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "inventario_guadalupana.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const getSortIcon = (key: SortKey) => {
        if (sortConfig.key !== key) return <span className="w-4 h-4 opacity-20"><ArrowUpIcon/></span>;
        return <span className="w-4 h-4">{sortConfig.direction === 'asc' ? <ArrowUpIcon /> : <ArrowDownIcon />}</span>;
    };
    
    const SortableHeader: React.FC<{ sortKey: SortKey, label: string, className?: string }> = ({ sortKey, label, className }) => (
        <th scope="col" className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 ${className}`} onClick={() => requestSort(sortKey)}>
             <div className="flex items-center gap-1"><span>{label}</span> {getSortIcon(sortKey)}</div>
        </th>
    );

    return (
        <div className="flex gap-6 h-full">
            <div className="flex-grow flex flex-col">
                {modal === 'history' && selectedProduct?.id && <HistoryModal product={selectedProduct as Product} onClose={() => setModal(null)} />}
                {(modal === 'reception' || modal === 'adjustment') && selectedProduct?.id && <AdjustmentModal product={selectedProduct as Product} type={modal} onClose={() => setModal(null)} />}
                {modal === 'import' && <ImportModal onClose={() => setModal(null)} onImport={processProductImport}/>}

                <div className="bg-white rounded-xl shadow-md p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative flex-grow">
                            <input type="text" placeholder="Buscar producto por nombre o ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 pl-10 border rounded-lg"/>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
                        </div>
                        <div className="flex-shrink-0 flex gap-2">
                            <button onClick={handleAddNewProduct} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold"><PlusIcon /> Añadir Producto</button>
                            <button onClick={() => setModal('import')} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold"><UploadIcon /> Importar</button>
                            <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-semibold"><DownloadIcon /> Exportar</button>
                        </div>
                    </div>
                </div>

                {selectedProduct && !isNewProduct && selectedProduct.id && (
                     <div className="bg-white rounded-xl shadow-md p-3 mb-6 flex items-center justify-between">
                        <p>Seleccionado: <span className="font-bold">{selectedProduct.name}</span></p>
                        <div className="flex gap-2">
                            <button onClick={() => setModal('history')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-800 rounded-lg font-semibold text-sm"><HistoryIcon /> Ver Historial</button>
                            <button onClick={() => setModal('reception')} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-lg font-semibold text-sm">Registrar Entrada</button>
                            <button onClick={() => setModal('adjustment')} className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-lg font-semibold text-sm">Registrar Ajuste</button>
                        </div>
                     </div>
                )}

                 <div className="bg-white rounded-xl shadow-md overflow-hidden flex-grow">
                    <div className="overflow-auto h-full">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th scope="col" className="w-4"></th>
                                    <SortableHeader sortKey="name" label="Producto" className="text-left" />
                                    <SortableHeader sortKey="cost" label="Costo" className="text-right" />
                                    <SortableHeader sortKey="price" label="Precio Venta" className="text-right" />
                                    <SortableHeader sortKey="profit" label="Ganancia" className="text-right" />
                                    <SortableHeader sortKey="margin" label="Margen" className="text-right" />
                                    <SortableHeader sortKey="stock" label="Stock" className="text-right" />
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                               {filteredAndSortedProducts.map(p => {
                                   const cost = p.cost || 0;
                                   const profit = p.price - cost;
                                   const margin = p.price > 0 ? (profit / p.price) * 100 : 0;
                                   const isSelected = selectedProduct?.id === p.id;
                                   return (
                                        <tr key={p.id} className={`cursor-pointer hover:bg-blue-50 ${isSelected ? 'bg-blue-100' : ''}`} onClick={() => handleSelectProduct(p)}>
                                            <td className="px-2 py-2"><div className={`w-2 h-10 rounded-full ${isSelected ? 'bg-primary' : 'bg-transparent'}`}></div></td>
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <img src={p.image} className="w-10 h-10 object-contain mr-3 rounded"/>
                                                    <div>
                                                        <div className="font-medium">{p.name}</div>
                                                        <div className="text-xs text-gray-500">{p.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2 text-right">Bs. {cost.toFixed(2)}</td>
                                            <td className="px-4 py-2 text-right">Bs. {p.price.toFixed(2)}</td>
                                            <td className={`px-4 py-2 text-right font-semibold ${profit >= 0 ? 'text-green-700' : 'text-red-700'}`}>Bs. {profit.toFixed(2)}</td>
                                            <td className={`px-4 py-2 text-right font-semibold ${margin >= 0 ? 'text-green-700' : 'text-red-700'}`}>{margin.toFixed(1)}%</td>
                                            <td className="px-4 py-2 text-right font-bold text-lg">{p.stock}</td>
                                        </tr>
                                   );
                               })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {selectedProduct && (
                <ProductDetailPanel 
                    key={selectedProduct.id || 'new'}
                    product={selectedProduct} 
                    categories={categories}
                    onClose={handleClosePanel}
                    isNew={isNewProduct}
                />
            )}
        </div>
    );
};

export default InventoryHub;