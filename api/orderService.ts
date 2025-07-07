import { Order, Address, CartItem, OrderStatus, Discount, FulfillmentStatus } from '../types';

const FAKE_DB_ORDERS_KEY = 'guadalupana_orders';

// Helper to get orders from localStorage
const getOrdersFromStorage = (): Order[] => {
    const ordersStr = localStorage.getItem(FAKE_DB_ORDERS_KEY);
    return ordersStr ? JSON.parse(ordersStr) : [];
};

// Helper to save orders to localStorage
const saveOrdersToStorage = (orders: Order[]) => {
    localStorage.setItem(FAKE_DB_ORDERS_KEY, JSON.stringify(orders));
};

interface CreateOrderData {
    userId: string;
    items: CartItem[];
    subtotal: number;
    deliveryFee: number;
    serviceFee: number;
    total: number;
    deliveryAddress: Address;
    channel: 'Online' | 'POS';
    deliveryNotes?: string;
    discount?: Discount;
}

export const createOrder = (orderData: CreateOrderData): Promise<Order> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const allOrders = getOrdersFromStorage();
            const newOrder: Order = {
                id: `order_${Date.now()}`,
                userId: orderData.userId,
                items: orderData.items, // These items now include the cost
                subtotal: orderData.subtotal,
                deliveryFee: orderData.deliveryFee,
                serviceFee: orderData.serviceFee,
                total: orderData.total,
                discount: orderData.discount,
                deliveryAddress: orderData.deliveryAddress,
                status: 'Recibido',
                fulfillmentStatus: 'No preparado',
                date: new Date().toISOString(),
                channel: orderData.channel,
                deliveryNotes: orderData.deliveryNotes,
                earnings: 0,
                tip: 0,
            };
            allOrders.unshift(newOrder); // Add to the beginning of the array
            saveOrdersToStorage(allOrders);
            resolve(newOrder);
        }, 100);
    });
};

export const getOrders = (userId: string): Promise<Order[]> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const allOrders = getOrdersFromStorage();
            const userOrders = allOrders
                .filter(order => order.userId === userId)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            resolve(userOrders);
        }, 300);
    });
};

export const getAllOrders = (page: number = 1, limit: number = 50): Promise<{orders: Order[], total: number}> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const allOrders = getOrdersFromStorage().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            const paginatedOrders = allOrders.slice((page - 1) * limit, page * limit);
            resolve({ orders: paginatedOrders, total: allOrders.length });
        }, 300);
    });
};

export const getOrderById = (orderId: string): Promise<Order | undefined> => {
     return new Promise(resolve => {
        setTimeout(() => {
            const allOrders = getOrdersFromStorage();
            resolve(allOrders.find(o => o.id === orderId));
        }, 100);
    });
}

export const updateOrderStatus = (orderId: string, status: OrderStatus): Promise<Order> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const allOrders = getOrdersFromStorage();
            const orderIndex = allOrders.findIndex(o => o.id === orderId);

            if (orderIndex === -1) {
                return reject(new Error("Pedido no encontrado."));
            }

            const updatedOrder: Order = { ...allOrders[orderIndex], status };
            allOrders[orderIndex] = updatedOrder;

            saveOrdersToStorage(allOrders);
            resolve(updatedOrder);
        }, 100);
    });
};

export const assignOrderToDispatcher = (orderId: string, dispatcherId: string): Promise<Order> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const allOrders = getOrdersFromStorage();
            const orderIndex = allOrders.findIndex(o => o.id === orderId);

            if (orderIndex === -1) {
                return reject(new Error("Pedido no encontrado."));
            }

            const updatedOrder: Order = { 
                ...allOrders[orderIndex], 
                fulfillmentStatus: 'En preparación',
                despachadorId: dispatcherId 
            };
            allOrders[orderIndex] = updatedOrder;

            saveOrdersToStorage(allOrders);
            resolve(updatedOrder);
        }, 100);
    });
};

export const updateOrderFulfillmentStatus = (orderId: string, status: FulfillmentStatus): Promise<Order> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const allOrders = getOrdersFromStorage();
            const orderIndex = allOrders.findIndex(o => o.id === orderId);

            if (orderIndex === -1) {
                return reject(new Error("Pedido no encontrado."));
            }

            const updatedOrder: Order = { ...allOrders[orderIndex], fulfillmentStatus: status };
            
            if (status === 'Listo para despacho') {
                updatedOrder.status = 'Listo para recoger';
            } else if (status === 'En ruta') {
                updatedOrder.status = 'En camino';
                updatedOrder.pickedUpAt = new Date().toISOString();
            } else if (status === 'Entregado') {
                updatedOrder.status = 'Entregado';
                updatedOrder.deliveredAt = new Date().toISOString();
            }

            allOrders[orderIndex] = updatedOrder;
            saveOrdersToStorage(allOrders);
            resolve(updatedOrder);
        }, 100);
    });
};

export const assignOrderToRepartidor = (orderId: string, repartidorId: string): Promise<Order> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const allOrders = getOrdersFromStorage();
            const orderIndex = allOrders.findIndex(o => o.id === orderId);

            if (orderIndex === -1) {
                return reject(new Error("Pedido no encontrado."));
            }
            
            if (allOrders[orderIndex].status !== 'Listo para recoger' && allOrders[orderIndex].fulfillmentStatus !== 'Listo con faltantes') {
                return reject(new Error("El pedido no está listo para recoger."));
            }

            const updatedOrder: Order = { 
                ...allOrders[orderIndex], 
                status: 'En camino',
                fulfillmentStatus: 'En ruta',
                repartidorId: repartidorId 
            };
            allOrders[orderIndex] = updatedOrder;

            saveOrdersToStorage(allOrders);
            resolve(updatedOrder);
        }, 100);
    });
};

export const getOrdersForPickup = (): Promise<Order[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const allOrders = getOrdersFromStorage();
            const pickupOrders = allOrders.filter(o => (o.fulfillmentStatus === 'Listo para despacho' || o.fulfillmentStatus === 'Listo con faltantes') && !o.repartidorId);
            resolve(pickupOrders);
        }, 300);
    });
};

export const getRepartidorOrders = (repartidorId: string): Promise<Order[]> => {
     return new Promise(resolve => {
        setTimeout(() => {
            const allOrders = getOrdersFromStorage();
            const repartidorOrders = allOrders.filter(o => o.repartidorId === repartidorId && o.status === 'En camino');
            resolve(repartidorOrders);
        }, 300);
    });
};


// --- BATCH OPERATIONS FOR OFFLINE POS ---

/**
 * Creates multiple orders in a single batch operation.
 * Used by the POS to sync its offline sales.
 */
export const createOrdersBatch = (ordersData: CreateOrderData[]): Promise<boolean> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const allOrders = getOrdersFromStorage();
            const newOrders: Order[] = ordersData.map(orderData => ({
                id: `order_${Date.now()}_${Math.random()}`,
                 ...orderData, // Contains items with cost
                status: 'Entregado', // POS sales are delivered instantly
                fulfillmentStatus: 'Entregado',
                date: new Date().toISOString(),
                earnings: 0,
                tip: 0,
            }));
            
            const updatedOrders = [...newOrders, ...allOrders];
            saveOrdersToStorage(updatedOrders);
            resolve(true);
        }, 500);
    });
};