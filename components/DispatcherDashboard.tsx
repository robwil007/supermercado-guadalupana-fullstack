

import React, { useState, useEffect } from 'react';
import { Order, FulfillmentStatus, CartItem } from '../types';
import { useData } from '../context/AppContext';
import { LoaderIcon, ArrowLeftIcon, MoreVerticalIcon } from './icons/InterfaceIcons';

// Mock dispatcher ID
const MOCK_DISPATCHER_ID = 'dispatcher_01';


const ItemWithOptions: React.FC<{
    item: CartItem;
    orderId: string;
    isPicked: boolean;
    isNotFound: boolean;
    onTogglePick: (item: CartItem) => void;
    onMarkNotFound: (item: CartItem) => void;
}> = ({ item, orderId, isPicked, isNotFound, onTogglePick, onMarkNotFound }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className={`border p-3 rounded-lg flex items-center gap-4 transition-all ${
            isPicked ? 'bg-green-100 border-green-400' 
            : isNotFound ? 'bg-red-100 border-red-400' 
            : 'bg-white'
        }`}>
            <div 
                onClick={() => !isNotFound && onTogglePick(item)} 
                className={`w-16 h-16 rounded-md p-1 border flex-shrink-0 flex items-center justify-center cursor-pointer ${
                    isPicked ? 'bg-white' : 'bg-gray-50'
                }`}
            >
                <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
            </div>
            <div onClick={() => !isNotFound && onTogglePick(item)} className="flex-grow cursor-pointer">
                <p className={`font-semibold text-gray-800 ${isPicked || isNotFound ? 'line-through' : ''}`}>{item.name}</p>
                <p className="text-sm text-gray-500">Código: {item.id}</p>
                {isNotFound && <p className="text-red-700 font-bold text-sm">MARCADO COMO FALTANTE</p>}
            </div>
            <div className="text-center px-2">
                <p className="text-xs text-gray-500">Cantidad</p>
                <p className={`font-bold text-3xl ${isPicked ? 'text-green-600' : isNotFound ? 'text-red-600' : 'text-primary'}`}>{item.quantity}</p>
            </div>
            <div className="relative">
                <button onClick={() => setIsMenuOpen(prev => !prev)} className="p-2 rounded-full hover:bg-gray-200" aria-label="Opciones de artículo">
                    <MoreVerticalIcon />
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 bg-white shadow-lg rounded-md z-10 w-40">
                         <button 
                             onClick={() => { onMarkNotFound(item); setIsMenuOpen(false); }} 
                             className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                         >
                            Marcar como Faltante
                         </button>
                    </div>
                )}
            </div>
        </div>
    );
};


const DispatcherDashboard: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { orders, updateOrderFulfillmentStatus, makeStockAdjustment } = useData();
    const [assignedOrders, setAssignedOrders] = useState<Order[]>([]);
    const [activeOrder, setActiveOrder] = useState<Order | null>(null);
    const [pickedItems, setPickedItems] = useState<Set<string>>(new Set());
    const [notFoundItems, setNotFoundItems] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        setLoading(true);
        const myOrders = orders.filter(o => o.despachadorId === MOCK_DISPATCHER_ID && o.fulfillmentStatus === 'En preparación');
        setAssignedOrders(myOrders);
        setLoading(false);
    }, [orders]);

    const handleSelectOrder = (order: Order) => {
        setActiveOrder(order);
        setPickedItems(new Set());
        setNotFoundItems(new Set());
    };

    const handleToggleItem = (item: CartItem) => {
        const itemKey = `${activeOrder?.id}-${item.id}`;
        const newPickedItems = new Set(pickedItems);
        if (newPickedItems.has(itemKey)) {
            newPickedItems.delete(itemKey);
        } else {
            newPickedItems.add(itemKey);
        }
        setPickedItems(newPickedItems);
    };

    const handleMarkNotFound = (item: CartItem) => {
        const itemKey = `${activeOrder?.id}-${item.id}`;
        const newNotFoundItems = new Set(notFoundItems);
        const newPickedItems = new Set(pickedItems);

        // If item was picked, un-pick it
        if (newPickedItems.has(itemKey)) {
            newPickedItems.delete(itemKey);
        }
        
        if (newNotFoundItems.has(itemKey)) {
             newNotFoundItems.delete(itemKey); // Allow un-marking
        } else {
            newNotFoundItems.add(itemKey);
        }
        
        setPickedItems(newPickedItems);
        setNotFoundItems(newNotFoundItems);
    };

    const handleCompletePicking = async () => {
        if (!activeOrder) return;
        
        // Adjust stock for any items marked as not found
        for (const item of activeOrder.items) {
            const itemKey = `${activeOrder.id}-${item.id}`;
            if (notFoundItems.has(itemKey)) {
                // Register a negative stock adjustment
                await makeStockAdjustment(item.id, item.quantity, `Faltante en Picking Pedido #${activeOrder.id.slice(-6)}`);
            }
        }

        const finalStatus: FulfillmentStatus = notFoundItems.size > 0 ? 'Listo con faltantes' : 'Listo para despacho';
        await updateOrderFulfillmentStatus(activeOrder.id, finalStatus);
        
        setActiveOrder(null);
        setPickedItems(new Set());
        setNotFoundItems(new Set());
    };

    const allItemsProcessed = activeOrder ? activeOrder.items.length === (pickedItems.size + notFoundItems.size) : false;

    if (loading) {
        return <div className="flex items-center justify-center h-screen"><LoaderIcon className="text-primary h-10 w-10"/></div>
    }

    if (activeOrder) {
        return (
            <main className="max-w-lg mx-auto px-4 py-6">
                <div className="flex items-center mb-6">
                    <button onClick={() => setActiveOrder(null)} className="text-gray-700 hover:text-primary p-2 -ml-2 mr-2">
                        <ArrowLeftIcon />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Preparando Pedido #{activeOrder.id.slice(-6)}</h1>
                </div>
                 <div className="space-y-3">
                    {activeOrder.items.map(item => {
                        const itemKey = `${activeOrder.id}-${item.id}`;
                        return (
                            <ItemWithOptions
                                key={itemKey}
                                item={item}
                                orderId={activeOrder.id}
                                isPicked={pickedItems.has(itemKey)}
                                isNotFound={notFoundItems.has(itemKey)}
                                onTogglePick={handleToggleItem}
                                onMarkNotFound={handleMarkNotFound}
                            />
                        )
                    })}
                </div>
                 <div className="mt-8">
                    <button 
                        onClick={handleCompletePicking}
                        disabled={!allItemsProcessed}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-lg transition disabled:bg-gray-400">
                        Pedido Listo para Recoger
                    </button>
                </div>
            </main>
        )
    }

    return (
        <main className="max-w-lg mx-auto px-4 py-6">
             <div className="flex items-center mb-6">
                <button onClick={onBack} className="text-gray-700 hover:text-primary p-2 -ml-2 mr-2">
                    <ArrowLeftIcon />
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Panel de Despacho</h1>
            </div>
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Pedidos por Preparar ({assignedOrders.length})</h2>
                {assignedOrders.length > 0 ? (
                    assignedOrders.map(order => (
                        <div key={order.id} onClick={() => handleSelectOrder(order)} className="bg-white p-4 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                            <p className="font-bold">Pedido #{order.id.slice(-6)}</p>
                            <p className="text-sm text-gray-600">{order.items.length} artículos</p>
                            <p className="text-xs text-gray-500 mt-1">Recibido: {new Date(order.date).toLocaleTimeString()}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500 py-8">No hay pedidos asignados.</p>
                )}
            </div>
        </main>
    );
};

export default DispatcherDashboard;