import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Product, CartItem, Category, Discount, Address, User, Order } from '../types';
import * as posSyncService from '../api/posSyncService';
import { useData, useCart } from '../context/AppContext';
import {
    ArrowLeftIcon, SearchIcon, PlusIcon, MinusIcon, TrashIcon, LoaderIcon,
    XCircleIcon, UserPlusIcon, TagSolidIcon, XIcon,
    BarcodeIcon, PauseIcon, PlayIcon, PlusCircleIcon, UndoIcon,
} from './icons/InterfaceIcons';
import DiscountModal from './DiscountModal';
import CloseDayModal from './CloseDayModal';
import ManualEntryModal from './ManualEntryModal';
import PaymentModal from './PaymentModal';
import CompletionModal from './CompletionModal';


// =================================================================
// Return Modal Component
// =================================================================
const ReturnModal: React.FC<{
    onClose: () => void;
}> = ({ onClose }) => {
    const { getOrderById, createReturn } = useData();
    const [orderId, setOrderId] = useState('');
    const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [itemsToReturn, setItemsToReturn] = useState<Map<string, number>>(new Map());
    const [restock, setRestock] = useState(true);

    const handleSearchOrder = async () => {
        if (!orderId) return;
        setLoading(true);
        setError('');
        setSearchedOrder(null);
        try {
            const foundOrder = await getOrderById(orderId);
            if(foundOrder) {
                if (foundOrder.channel === 'POS') {
                     setSearchedOrder(foundOrder);
                     setItemsToReturn(new Map(foundOrder.items.map(i => [i.id, 0])));
                } else {
                    setError("Solo se pueden procesar devoluciones de ventas POS en esta terminal.");
                }
            } else {
                setError("No se encontró ninguna venta con ese ID.");
            }
        } catch (e) {
            setError("Error al buscar la venta.");
        } finally {
            setLoading(false);
        }
    };

    const updateReturnQuantity = (itemId: string, direction: 1 | -1) => {
        const currentQty = itemsToReturn.get(itemId) || 0;
        const originalItem = searchedOrder?.items.find(i => i.id === itemId);
        const maxQty = originalItem?.quantity || 0;
        const newQty = Math.max(0, Math.min(maxQty, currentQty + direction));
        setItemsToReturn(new Map(itemsToReturn.set(itemId, newQty)));
    };

    const handleProcessReturn = async () => {
        if (!searchedOrder) return;

        const returnedItems: CartItem[] = [];
        let refundAmount = 0;

        itemsToReturn.forEach((quantity, itemId) => {
            if (quantity > 0) {
                const originalItem = searchedOrder.items.find(i => i.id === itemId);
                if (originalItem) {
                    const itemToReturn: CartItem = { ...originalItem, quantity };
                    returnedItems.push(itemToReturn);
                    // Pro-rate the refund based on the original line item total
                    const originalLineTotal = (originalItem.price * originalItem.quantity); // simplified, ignores bundles for now
                    refundAmount += (originalLineTotal / originalItem.quantity) * quantity;
                }
            }
        });
        
        if (returnedItems.length === 0) {
            alert("Seleccione al menos un artículo para devolver.");
            return;
        }

        await createReturn({
            orderId: searchedOrder.id,
            returnedItems,
            reason: 'Devolución en tienda',
            restocked: restock,
            refundAmount,
            channel: 'POS'
        });

        alert(`Devolución procesada por Bs. ${refundAmount.toFixed(2)}.`);
        onClose();
    };

    return (
        <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col animate-fade-in-up max-h-[80vh]">
                <header className="p-4 border-b flex items-center justify-between">
                    <h2 className="text-xl font-bold">Procesar Devolución</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XIcon /></button>
                </header>
                <div className="p-6 space-y-4 flex-grow overflow-y-auto">
                    {!searchedOrder ? (
                        <div>
                            <label className="font-semibold">ID de la Venta (Ticket)</label>
                            <div className="flex gap-2 mt-1">
                                <input
                                    type="text"
                                    value={orderId}
                                    onChange={e => setOrderId(e.target.value)}
                                    placeholder="Ej: order_167..."
                                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg py-2 px-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button onClick={handleSearchOrder} disabled={loading} className="px-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-400">
                                    {loading ? <LoaderIcon /> : "Buscar"}
                                </button>
                            </div>
                            {error && <p className="text-red-500 mt-2">{error}</p>}
                        </div>
                    ) : (
                        <div>
                            <h3 className="font-bold text-lg mb-2">Venta #{searchedOrder.id.slice(-6)}</h3>
                             <p className="mb-4 text-sm text-gray-600">Seleccione los artículos y la cantidad a devolver.</p>
                             <div className="space-y-2">
                                {searchedOrder.items.map(item => (
                                    <div key={item.id} className="p-2 border rounded-lg flex items-center gap-3">
                                        <img src={item.image} alt={item.name} className="w-12 h-12 object-contain rounded"/>
                                        <div className="flex-grow">
                                            <p className="font-semibold">{item.name}</p>
                                            <p className="text-xs text-gray-500">Comprado: {item.quantity}</p>
                                        </div>
                                        <div className="flex items-center border rounded-lg h-10 w-28">
                                            <button onClick={() => updateReturnQuantity(item.id, -1)} className="px-3 h-full"><MinusIcon /></button>
                                            <span className="px-2 font-bold flex-grow text-center">{itemsToReturn.get(item.id)}</span>
                                            <button onClick={() => updateReturnQuantity(item.id, 1)} className="px-3 h-full"><PlusIcon /></button>
                                        </div>
                                    </div>
                                ))}
                             </div>
                             <div className="mt-4">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" checked={restock} onChange={e => setRestock(e.target.checked)} className="h-5 w-5 rounded"/>
                                    <span className="font-semibold">¿Re-ingresar productos al stock?</span>
                                </label>
                                <p className="text-xs text-gray-500 ml-7">Marque esta opción si los productos están en buen estado para la venta.</p>
                             </div>
                        </div>
                    )}
                </div>
                {searchedOrder && (
                     <footer className="p-4 bg-gray-50 border-t">
                        <button onClick={handleProcessReturn} className="w-full py-3 rounded-lg bg-primary text-white font-bold">Procesar Devolución</button>
                    </footer>
                )}
            </div>
        </div>
    );
};

// =================================================================
// Customer Search Modal Component
// =================================================================
const CustomerSearchModal: React.FC<{
    onClose: () => void;
    onSelectCustomer: (customer: User) => void;
}> = ({ onClose, onSelectCustomer }) => {
    const { allUsers } = useData();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredUsers = useMemo(() => {
        if (!searchTerm) return allUsers;
        return allUsers.filter(u =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, allUsers]);

    return (
        <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col animate-fade-in-up max-h-[70vh]">
                <header className="p-4 border-b flex items-center justify-between flex-shrink-0">
                    <h2 className="text-xl font-bold">Buscar Cliente</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><XIcon /></button>
                </header>
                <div className="p-4 flex-shrink-0">
                    <input
                        type="text"
                        placeholder="Buscar por nombre o email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg py-2 px-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="p-4 pt-0 space-y-2 flex-grow overflow-y-auto">
                    {filteredUsers.map(user => (
                        <button key={user.id} onClick={() => { onSelectCustomer(user); onClose(); }} className="w-full text-left p-3 border rounded-lg hover:bg-gray-100 flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{user.name}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                        </button>
                    ))}
                    {filteredUsers.length === 0 && <p className="text-center text-gray-500 p-4">No se encontraron clientes.</p>}
                </div>
            </div>
        </div>
    );
};


// =================================================================
// Main POS View Component - OFFLINE FIRST
// =================================================================

const POSView: React.FC<{ onBack: () => void; allProducts: Product[] }> = ({ onBack, allProducts: initialProducts }) => {
    
    // Core state
    const [cart, setCart] = useState<CartItem[]>([]);
    const [suspendedSales, setSuspendedSales] = useState<CartItem[][]>([]);
    const [discount, setDiscount] = useState<{ type: 'percentage' | 'fixed'; value: number }>({ type: 'percentage', value: 0 });
    const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
    
    // Data state
    const [localProducts, setLocalProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState<posSyncService.SyncStatus>('syncing');
    
    // Search State
    const [searchTerm, setSearchTerm] = useState('');
    const { calculateLineItemTotal } = useCart();
    const searchResults = useMemo(() => {
        if (!searchTerm) return [];
        return localProducts.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 7);
    }, [searchTerm, localProducts]);


    // UI State
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isCompletionOpen, setIsCompletionOpen] = useState(false);
    const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
    const [isCloseDayModalOpen, setIsCloseDayModalOpen] = useState(false);
    const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);
    const [isSuspendedListOpen, setIsSuspendedListOpen] = useState(false);
    const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const lastSaleTotal = useRef(0);
    
    // Barcode scanning state
    const scanBuffer = useRef('');
    const lastScanTime = useRef(0);
    const SCAN_TIMEOUT = 50; // ms

    // --- Cart Management ---
    const addToCart = useCallback((product: Product) => {
        setCart(prevCart => {
            const existing = prevCart.find(i => i.id === product.id);
            if (existing) {
                return prevCart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
             // CRITICAL: Snapshot the cost when adding to cart in POS
            return [...prevCart, { ...product, quantity: 1, cost: product.cost || product.price * 0.7 }];
        });
    }, []);
    
    const addManualItemToCart = useCallback((name: string, price: number) => {
        const manualProduct: Product = {
            id: `manual_${Date.now()}`,
            name: name || 'Artículo Manual',
            price,
            cost: 0, // Manual items have no cost for profit calc
            stock: 999,
            image: 'https://i.ibb.co/9gT5y1S/placeholder-product.png',
            category: 'Manual',
        };
        addToCart(manualProduct);
    }, [addToCart]);

    const removeFromCart = useCallback((productId: string) => {
        setCart(prev => prev.filter(i => i.id !== productId));
    }, []);

    const updateQuantity = useCallback((productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            setCart(prev => prev.map(i => i.id === productId ? { ...i, quantity } : i));
        }
    }, [removeFromCart]);
    
    const clearCart = useCallback(() => {
        setCart([]);
        setDiscount({ type: 'percentage', value: 0 });
        setSelectedCustomer(null);
    }, []);
    
    const handleApplyDiscount = (type: 'percentage' | 'fixed', value: number) => {
        setDiscount({ type, value });
    };
    
    const suspendSale = () => {
        if (cart.length === 0) return;
        setSuspendedSales(prev => [cart, ...prev]);
        clearCart();
    };
    
    const resumeSale = (index: number) => {
        const saleToResume = suspendedSales[index];
        const remainingSuspended = suspendedSales.filter((_, i) => i !== index);
        setCart(saleToResume);
        setSuspendedSales(remainingSuspended);
        setIsSuspendedListOpen(false);
    };

    // --- Computed Values for POS ---
    const subtotal = useMemo(() => cart.reduce((total, item) => total + calculateLineItemTotal(item), 0), [cart, calculateLineItemTotal]);
    
    const discountAmount = useMemo(() => {
        if (discount.value === 0) return 0;
        if (discount.type === 'percentage') {
            return subtotal * (discount.value / 100);
        }
        return Math.min(discount.value, subtotal);
    }, [subtotal, discount]);

    const total = useMemo(() => subtotal - discountAmount, [subtotal, discountAmount]);


    // --- Sale Finalization ---
    const handleFinalizeSale = async (paymentMethod: 'cash' | 'card' | 'qr') => {
        if (cart.length === 0) return;
        
        const finalSubtotal = subtotal; 
        const finalDiscountAmount = discountAmount;
        const finalTotal = total;

        const discountObject: Discount | undefined = finalDiscountAmount > 0 ? {
            code: discount.type === 'percentage' ? `Descuento ${discount.value}%` : `Monto Fijo`,
            amount: finalDiscountAmount
        } : undefined;

        const dummyAddress: Address = { id: 'pos', userId: 'pos_user', street: 'Venta en Tienda', city: 'N/A', reference: 'N/A' };

        await posSyncService.queueSale({
            userId: selectedCustomer?.id || 'pos_user',
            items: cart,
            subtotal: finalSubtotal,
            deliveryFee: 0,
            serviceFee: 0,
            total: finalTotal,
            deliveryAddress: dummyAddress,
            channel: 'POS',
            discount: discountObject,
            paymentMethod: paymentMethod,
        });

        lastSaleTotal.current = finalTotal;
        setIsPaymentOpen(false);
        setIsCompletionOpen(true);
    };
    
    const handleNextCustomer = () => {
        clearCart();
        setIsCompletionOpen(false);
    };

    const handleSelectProductFromSearch = (product: Product) => {
        addToCart(product);
        setSearchTerm('');
    };

    const handleBarcodeScan = useCallback((barcode: string) => {
        const product = localProducts.find(p => p.id === barcode);
        if (product) {
            addToCart(product);
        } else {
            alert(`Producto con código "${barcode}" no encontrado.`);
        }
    }, [localProducts, addToCart]);
    
    // --- Data and Synchronization Logic ---
    useEffect(() => {
        const initAndSync = async () => {
            setIsLoading(true);
            try {
                await posSyncService.initDB((status) => setSyncStatus(status));
                const products = await posSyncService.syncProducts(initialProducts);
                setLocalProducts(products);
            } catch (error) {
                console.error("Failed to initialize or sync POS data:", error);
                setSyncStatus('offline');
                setLocalProducts(initialProducts);
            }
            setIsLoading(false);
        };
        initAndSync();
    }, [initialProducts]);
    
    // --- Global Barcode Scanner Listener ---
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (isPaymentOpen || isManualEntryOpen || isCloseDayModalOpen || isCustomerSearchOpen || document.activeElement?.tagName === 'INPUT') return;
            
            const currentTime = Date.now();
            const timeSinceLastScan = currentTime - lastScanTime.current;
            lastScanTime.current = currentTime;
            
            if (timeSinceLastScan > SCAN_TIMEOUT) {
                scanBuffer.current = ''; // Reset buffer if typing is too slow
            }

            if (event.key === 'Enter') {
                if (scanBuffer.current.length > 2) {
                    handleBarcodeScan(scanBuffer.current);
                }
                scanBuffer.current = '';
                return;
            }

            if (event.key.length === 1 && /[a-zA-Z0-9\-]/.test(event.key)) {
                scanBuffer.current += event.key;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleBarcodeScan, isPaymentOpen, isManualEntryOpen, isCloseDayModalOpen, isCustomerSearchOpen]);


    if (isLoading) {
        return <div className="h-screen bg-gray-100 flex flex-col items-center justify-center"><LoaderIcon className="text-primary h-12 w-12" /><p className="mt-4 text-lg font-semibold">Iniciando terminal POS...</p></div>;
    }

    return (
        <div className="h-screen bg-gray-100 flex font-sans relative overflow-hidden">
            {/* Action Sidebar */}
            <aside className="bg-gray-800 text-white w-24 flex-shrink-0 flex flex-col">
                 <div className="h-16 flex items-center justify-center border-b border-gray-700">
                    <button onClick={onBack} className="p-2 rounded-lg hover:bg-gray-700">
                        <ArrowLeftIcon />
                    </button>
                 </div>
                 <nav className="flex-grow flex flex-col items-center p-2 space-y-2">
                    <button onClick={() => setIsCustomerSearchOpen(true)} className="w-full flex flex-col items-center p-2 rounded-lg hover:bg-gray-700"><UserPlusIcon /><span className="text-xs mt-1">Cliente</span></button>
                    <button onClick={() => setIsManualEntryOpen(true)} className="w-full flex flex-col items-center p-2 rounded-lg hover:bg-gray-700"><PlusCircleIcon /><span className="text-xs mt-1">Manual</span></button>
                    <button onClick={() => setIsDiscountModalOpen(true)} className="w-full flex flex-col items-center p-2 rounded-lg hover:bg-gray-700"><TagSolidIcon /><span className="text-xs mt-1">Descuento</span></button>
                    <button onClick={suspendSale} disabled={cart.length === 0} className="w-full flex flex-col items-center p-2 rounded-lg hover:bg-gray-700 disabled:opacity-50"><PauseIcon /><span className="text-xs mt-1">Suspender</span></button>
                    <button onClick={() => setIsSuspendedListOpen(true)} className="w-full flex flex-col items-center p-2 rounded-lg hover:bg-gray-700 relative">
                        <PlayIcon />
                        <span className="text-xs mt-1">Reanudar</span>
                        {suspendedSales.length > 0 && <span className="absolute top-1 right-1 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{suspendedSales.length}</span>}
                    </button>
                    <button onClick={() => setIsReturnModalOpen(true)} className="w-full flex flex-col items-center p-2 rounded-lg hover:bg-gray-700"><UndoIcon /><span className="text-xs mt-1">Devolución</span></button>
                 </nav>
                 <div className="p-2 border-t border-gray-700">
                    <button onClick={() => setIsCloseDayModalOpen(true)} className="w-full flex flex-col items-center p-2 rounded-lg hover:bg-gray-700"><span className="text-lg font-bold">Cerrar Turno</span></button>
                 </div>
            </aside>
            
            <main className="flex-grow grid grid-cols-12 gap-4 p-4">
                {/* Active Cart & Search */}
                <section className="col-span-12 lg:col-span-7 bg-white rounded-xl shadow-md flex flex-col relative">
                     {/* Search Bar */}
                     <div className="p-3 border-b">
                         <div className="relative">
                             <input
                                type="text"
                                placeholder="Buscar por nombre o código de barras..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-gray-50 border-2 border-gray-200 rounded-lg py-3 pl-12 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><SearchIcon /></div>
                         </div>
                     </div>

                     {/* Search Results */}
                     {searchTerm && (
                         <div className="absolute top-[85px] left-0 right-0 bg-white shadow-lg rounded-b-xl z-10 max-h-96 overflow-y-auto">
                            <ul>
                                {searchResults.length > 0 ? searchResults.map(p => (
                                    <li key={p.id}>
                                        <button onClick={() => handleSelectProductFromSearch(p)} className="w-full flex items-center gap-4 p-3 text-left hover:bg-blue-50 transition-colors border-b">
                                            <img src={p.image} alt={p.name} className="w-10 h-10 object-contain flex-shrink-0" />
                                            <p className="flex-grow font-semibold">{p.name}</p>
                                            <p className="font-bold">Bs. {p.price.toFixed(2)}</p>
                                        </button>
                                    </li>
                                )) : (
                                    <li className="p-4 text-center text-gray-500">No se encontraron productos.</li>
                                )}
                            </ul>
                        </div>
                     )}

                    <div className="flex-grow overflow-y-auto">
                        {cart.length === 0 ? (
                             <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <BarcodeIcon className="w-16 h-16 text-gray-300"/>
                                <p className="mt-2 font-medium">Escanea un producto para empezar</p>
                            </div>
                        ) : (
                            <table className="w-full">
                                <tbody>
                                {cart.map(item => {
                                    const lineTotal = calculateLineItemTotal(item);
                                    // Find the next available bundle offer that hasn't been met yet.
                                    const availableOffer = item.bundleOffers
                                        ?.sort((a,b) => a.quantity - b.quantity)
                                        .find(o => item.quantity < o.quantity);

                                    return (
                                    <tr key={item.id} className="border-b last:border-none">
                                        <td className="p-3 w-16"><img src={item.image} alt={item.name} className="w-12 h-12 object-contain" /></td>
                                        <td className="p-3">
                                            <p className="font-semibold text-gray-800">{item.name}</p>
                                            <p className="text-sm text-gray-500">Bs. {item.price.toFixed(2)}</p>
                                            {availableOffer && (
                                                <button 
                                                    onClick={() => updateQuantity(item.id, availableOffer.quantity)} 
                                                    className="mt-1 bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded-md hover:bg-red-200 transition-transform hover:scale-105"
                                                    title={`Aplicar oferta: ${availableOffer.quantity} por Bs. ${availableOffer.price}`}
                                                >
                                                    ¡Oferta! Lleva {availableOffer.quantity} por Bs. {availableOffer.price}
                                                </button>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center border rounded-lg h-10 w-28">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 h-full"><MinusIcon /></button>
                                                <span className="px-2 font-bold flex-grow text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 h-full"><PlusIcon /></button>
                                            </div>
                                        </td>
                                        <td className="p-3 text-lg font-bold text-right w-32">Bs. {lineTotal.toFixed(2)}</td>
                                        <td className="p-3 w-12 text-center"><button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 p-2"><TrashIcon /></button></td>
                                    </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        )}
                    </div>
                </section>

                {/* Summary & Payment */}
                <section className="col-span-12 lg:col-span-5 bg-white rounded-xl shadow-md flex flex-col">
                     {selectedCustomer && (
                        <div className="p-3 bg-blue-50 border-b-2 border-dashed flex justify-between items-center">
                            <div>
                                <p className="text-xs text-blue-800 font-semibold">CLIENTE</p>
                                <p className="font-bold text-blue-900">{selectedCustomer.name}</p>
                            </div>
                            <button onClick={() => setSelectedCustomer(null)} className="text-blue-700 hover:text-blue-900 p-1"><XCircleIcon/></button>
                        </div>
                    )}
                    <div className="p-4 flex-grow flex flex-col">
                         <div className="flex justify-between items-baseline text-lg">
                            <span className="font-medium text-gray-600">Subtotal</span>
                            <span className="font-semibold text-gray-800">Bs. {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-baseline text-lg">
                             <span className="font-medium text-green-600 flex items-center gap-2">
                                Descuentos
                                {discount.value > 0 && (
                                    <button onClick={() => setDiscount({type: 'percentage', value: 0})} className="text-red-500 hover:text-red-700">
                                        <XCircleIcon />
                                    </button>
                                )}
                            </span>
                            <span className="font-semibold text-green-600">- Bs. {discountAmount.toFixed(2)}</span>
                        </div>
                    </div>
                     <div className="mt-auto p-4 border-t-2 border-dashed">
                        <div className="flex justify-between items-center text-3xl font-bold text-gray-900">
                            <span >TOTAL</span>
                            <span>Bs. {total.toFixed(2)}</span>
                        </div>
                        <button onClick={() => setIsPaymentOpen(true)} disabled={cart.length === 0} className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold text-2xl py-4 rounded-xl shadow-lg transition-all disabled:bg-gray-300 disabled:shadow-none">
                            PAGAR
                        </button>
                    </div>
                </section>
            </main>
            
            {/* Modals Layer */}
            {isPaymentOpen && <PaymentModal total={total} onClose={() => setIsPaymentOpen(false)} onFinalize={handleFinalizeSale} />}
            {isCompletionOpen && <CompletionModal onNext={handleNextCustomer} total={lastSaleTotal.current} />}
            {isDiscountModalOpen && <DiscountModal onClose={() => setIsDiscountModalOpen(false)} applyPosDiscount={handleApplyDiscount} clearPosDiscount={() => setDiscount({type: 'percentage', value: 0})} posDiscount={discount}/>}
            {isManualEntryOpen && <ManualEntryModal onClose={() => setIsManualEntryOpen(false)} onConfirm={addManualItemToCart} />}
            {isCloseDayModalOpen && <CloseDayModal onClose={() => setIsCloseDayModalOpen(false)} />}
            {isCustomerSearchOpen && <CustomerSearchModal onClose={() => setIsCustomerSearchOpen(false)} onSelectCustomer={setSelectedCustomer} />}
            {isReturnModalOpen && <ReturnModal onClose={() => setIsReturnModalOpen(false)} />}
            {isSuspendedListOpen && (
                <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col animate-fade-in-up">
                        <header className="p-4 border-b flex items-center justify-between">
                            <h2 className="text-xl font-bold">Ventas en Espera</h2>
                             <button onClick={() => setIsSuspendedListOpen(false)} className="p-1 rounded-full hover:bg-gray-200"><XIcon /></button>
                        </header>
                        <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                            {suspendedSales.map((sale, index) => (
                                <button key={index} onClick={() => resumeSale(index)} className="w-full text-left p-3 border rounded-lg hover:bg-gray-100 flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold">Venta #{suspendedSales.length - index}</p>
                                        <p className="text-sm text-gray-500">{sale.length} artículo(s)</p>
                                    </div>
                                    <p className="font-bold text-lg">Bs. {sale.reduce((t, i) => t + calculateLineItemTotal(i), 0).toFixed(2)}</p>
                                </button>
                            ))}
                            {suspendedSales.length === 0 && <p className="text-center text-gray-500 p-4">No hay ventas en espera.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default POSView;