
import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { CartItem, Product, User, Order, Address, ChatMessage, Discount, Driver, FulfillmentStatus, StockMovement, Expense, Return, OrderStatus, Category } from '../types';
import * as authService from '../api/authService';
import * as orderService from '../api/orderService';
import * as addressService from '../api/addressService';
import * as aiService from '../api/aiService';
import * as productService from '../api/productService';
import * as driverService from '../api/driverService';
import * as financialService from '../api/financialService';

// =============================================
// CONTEXT DEFINITIONS
// =============================================

interface MapModalConfig {
  onSelect: (address: Partial<Address> & { fullAddress: string }) => void;
}

// --- UI Context ---
interface UIContextType {
    isLoginModalOpen: boolean;
    isMapModalOpen: boolean;
    isChatModalOpen: boolean;
    openLoginModal: () => void;
    closeLoginModal: () => void;
    openMapModal: (config: MapModalConfig) => void;
    closeMapModal: () => void;
    openChatModal: () => void;
    closeChatModal: () => void;
    getMapModalConfig: () => MapModalConfig | null;
}
const UIContext = createContext<UIContextType | undefined>(undefined);


// --- Auth Context ---
interface AuthContextType {
    user: User | null;
    authLoading: boolean;
    authError: string | null;
    login: (email: string) => Promise<void>;
    register: (userData: Omit<User, 'id'>) => Promise<void>;
    logout: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);


// --- Cart Context ---
interface CartContextType {
    cart: CartItem[];
    cartDiscount: Discount | null;
    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    applyPromoCode: (code: string) => void;
    clearPromoCode: () => void;
    calculateLineItemTotal: (item: CartItem) => number;
    cartTotal: number;
    deliveryFee: number;
    serviceFee: number;
    checkoutTotal: number;
    cartCount: number;
}
const CartContext = createContext<CartContextType | undefined>(undefined);

// --- Data Context ---
interface DataContextType {
    orders: Order[];
    addresses: Address[];
    deliveryAddress: Address | null;
    drivers: Driver[];
    allProducts: Product[];
    categories: Category[]; // Now managed here
    stockMovements: StockMovement[];
    allUsers: User[];
    expenses: Expense[];
    returns: Return[];
    chatHistory: ChatMessage[];
    chatLoading: boolean;
    chatError: string | null;
    
    setDeliveryAddress: (address: Address | null) => void;
    placeOrder: (address: Address) => Promise<void>;
    addAddress: (addressData: Omit<Address, 'id' | 'userId'>) => Promise<Address>;
    deleteAddress: (addressId: string) => Promise<void>;
    sendChatMessage: (message: string) => Promise<void>;
    assignOrderToDispatcher: (orderId: string, dispatcherId: string) => Promise<void>;
    updateOrderFulfillmentStatus: (orderId: string, status: FulfillmentStatus) => Promise<void>;
    assignOrderToRepartidor: (orderId: string, repartidorId: string) => Promise<void>;
    updateDriverStatus: (driverId: string, status: Driver['status']) => Promise<void>;
    updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
    receiveStock: (productId: string, quantity: number, reason?: string) => Promise<void>;
    makeStockAdjustment: (productId: string, quantity: number, reason: string) => Promise<void>;
    getProductMovements: (productId: string) => Promise<StockMovement[]>;
    processProductImport: (products: Product[]) => Promise<void>;
    updateProduct: (product: Product) => Promise<void>;
    createProduct: (productData: Omit<Product, 'id' | 'stock'>) => Promise<void>;
    addExpense: (expenseData: Omit<Expense, 'id' | 'date'>) => Promise<void>;
    createReturn: (returnData: Omit<Return, 'id' | 'date'>) => Promise<void>;
    getOrderById: (orderId: string) => Promise<Order | undefined>;
    fetchAllData: () => Promise<void>;
}
const DataContext = createContext<DataContextType | undefined>(undefined);


// =============================================
// HELPER FUNCTIONS
// =============================================
const calculateLineItemTotal = (item: CartItem): number => {
    const singlePrice = item.discountPercent ? item.price * (1 - item.discountPercent / 100) : item.price;

    if (!item.bundleOffers || item.bundleOffers.length === 0) {
        return item.quantity * singlePrice;
    }

    const sortedBundles = [...item.bundleOffers].sort((a, b) => b.quantity - a.quantity);
    let remainingQuantity = item.quantity;
    let itemTotal = 0;

    for (const bundle of sortedBundles) {
        if (remainingQuantity >= bundle.quantity) {
            const numBundles = Math.floor(remainingQuantity / bundle.quantity);
            itemTotal += numBundles * bundle.price;
            remainingQuantity %= bundle.quantity;
        }
    }
    
    itemTotal += remainingQuantity * singlePrice;
    return itemTotal;
};


// =============================================
// MAIN PROVIDER COMPONENT
// =============================================

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // State declarations
    const [cart, setCart] = useState<CartItem[]>([]);
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [deliveryAddress, setDeliveryAddressState] = useState<Address | null>(null);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [returns, setReturns] = useState<Return[]>([]);
    const [isLoginModalOpen, setLoginModalOpen] = useState(false);
    const [isMapModalOpen, setMapModalOpen] = useState(false);
    const [mapModalConfig, setMapModalConfig] = useState<MapModalConfig | null>(null);
    const [isChatModalOpen, setChatModalOpen] = useState(false);
    const [authLoading, setAuthLoading] = useState(true); // Start true
    const [authError, setAuthError] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [chatLoading, setChatLoading] = useState(false);
    const [chatError, setChatError] = useState<string | null>(null);
    const [cartDiscount, setCartDiscount] = useState<Discount | null>(null);
    const [drivers, setDrivers] = useState<Driver[]>([]);

    // --- Data Fetching ---
    const fetchAllData = useCallback(async () => {
        const [productsResponse, categoriesData, ordersData, driversData, usersData, expensesData, returnsData, movementsData] = await Promise.all([
            productService.getProducts(),
            productService.getCategories(),
            orderService.getAllOrders(),
            driverService.getDrivers(),
            authService.getAllUsers(),
            financialService.getExpenses(),
            financialService.getReturns(),
            productService.getAllMovements(),
        ]);
        setAllProducts(productsResponse.products);
        setCategories(categoriesData);
        setOrders(ordersData.orders);
        setDrivers(driversData);
        setAllUsers(usersData);
        setExpenses(expensesData);
        setReturns(returnsData);
        setStockMovements(movementsData);
    }, []);

    // --- Initial Load Effect ---
    useEffect(() => {
        const checkSessionAndFetch = async () => {
            setAuthLoading(true);
            const loggedInUser = await authService.getCurrentUser(); // Now async
            if (loggedInUser) {
                setUser(loggedInUser);
                const userAddresses = await addressService.getAddresses(loggedInUser.id);
                setAddresses(userAddresses);
                const savedDeliveryAddress = addressService.getCurrentDeliveryAddress();
                if (savedDeliveryAddress) {
                    setDeliveryAddressState(savedDeliveryAddress)
                } else if(userAddresses.length > 0) {
                    setDeliveryAddressState(userAddresses[0]);
                }
            }
            await fetchAllData();
            setAuthLoading(false);
        };
        checkSessionAndFetch();
    }, [fetchAllData]);

    // --- Memoized Context Values ---

    const uiContextValue = useMemo(() => ({
        isLoginModalOpen, isMapModalOpen, isChatModalOpen,
        openLoginModal: () => setLoginModalOpen(true),
        closeLoginModal: () => { setLoginModalOpen(false); setAuthError(null); },
        openMapModal: (config: MapModalConfig) => { setMapModalConfig(config); setMapModalOpen(true); },
        closeMapModal: () => setMapModalOpen(false),
        getMapModalConfig: () => mapModalConfig,
        openChatModal: () => {
            if(chatHistory.length === 0) {
                setChatHistory([{ role: 'assistant', content: "¡Hola! Soy Guada, tu asistente de compras. ¿En qué puedo ayudarte hoy?"}])
            }
            setChatModalOpen(true);
        },
        closeChatModal: () => setChatModalOpen(false),
    }), [isLoginModalOpen, isMapModalOpen, isChatModalOpen, mapModalConfig, chatHistory]);

    const authContextValue = useMemo(() => {
        const login = async (email: string) => {
            setAuthLoading(true);
            setAuthError(null);
            try {
                const loggedInUser = await authService.login(email);
                setUser(loggedInUser);
                const userAddresses = await addressService.getAddresses(loggedInUser.id);
                setAddresses(userAddresses);
                if(userAddresses.length > 0) {
                  setDeliveryAddressState(userAddresses[0]);
                  addressService.setCurrentDeliveryAddress(userAddresses[0]);
                }
                uiContextValue.closeLoginModal();
            } catch (error: any) {
                setAuthError(error.message);
                throw error;
            } finally {
                setAuthLoading(false);
            }
        };

        const register = async (userData: Omit<User, 'id'>) => {
            setAuthLoading(true);
            setAuthError(null);
            try {
                const newUser = await authService.register(userData);
                setUser(newUser);
                setOrders([]);
                setAddresses([]);
                setDeliveryAddressState(null);
                addressService.setCurrentDeliveryAddress(null);
                uiContextValue.closeLoginModal();
            } catch (error: any) {
                setAuthError(error.message);
                throw error;
            } finally {
                setAuthLoading(false);
            }
        };

        const logout = () => {
            authService.logout();
            setUser(null);
            setOrders([]);
            setAddresses([]);
            setCart([]);
            setDeliveryAddressState(null);
            addressService.setCurrentDeliveryAddress(null);
        };

        return { user, authLoading, authError, login, register, logout };
    }, [user, authLoading, authError, uiContextValue]);

    const cartContextValue = useMemo(() => {
        const cartTotal = cart.reduce((total, item) => total + calculateLineItemTotal(item), 0);
        const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
        const DELIVERY_FEE = 10.00;
        const SERVICE_FEE_PERCENT = 0.02;
        const deliveryFee = (cart.length > 0 ? DELIVERY_FEE : 0);
        const serviceFee = cartTotal * SERVICE_FEE_PERCENT;
        const checkoutTotal = cartTotal + deliveryFee + serviceFee - (cartDiscount?.amount || 0);

        const addToCart = (product: Product) => {
            setCart(prevCart => {
                const existingItem = prevCart.find(item => item.id === product.id);
                if (existingItem) {
                    return prevCart.map(item =>
                        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                    );
                }
                return [...prevCart, { ...product, quantity: 1, cost: product.cost || product.price * 0.7 }];
            });
        };
        const removeFromCart = (productId: string) => {
            setCart(prevCart => prevCart.filter(item => item.id !== productId));
        };
        const updateQuantity = (productId: string, quantity: number) => {
            if (quantity <= 0) {
                removeFromCart(productId);
            } else {
                setCart(prevCart =>
                    prevCart.map(item =>
                        item.id === productId ? { ...item, quantity } : item
                    )
                );
            }
        };
        const clearCart = () => {
            setCart([]);
            setCartDiscount(null);
        };
        const applyPromoCode = (code: string) => {
            if (code.toUpperCase() === 'PROMO10') {
                const discountAmount = cartTotal * 0.10;
                setCartDiscount({ code: 'PROMO10', amount: discountAmount });
            } else {
                alert("Código promocional no válido.");
                setCartDiscount(null);
            }
        };
        const clearPromoCode = () => setCartDiscount(null);

        return {
            cart, cartDiscount, addToCart, removeFromCart, updateQuantity, clearCart,
            applyPromoCode, clearPromoCode, calculateLineItemTotal,
            cartTotal, deliveryFee, serviceFee, checkoutTotal, cartCount
        };
    }, [cart, cartDiscount]);
    
    const dataContextValue = useMemo(() => {
        
        const setDeliveryAddress = (address: Address | null) => {
            setDeliveryAddressState(address);
            addressService.setCurrentDeliveryAddress(address);
        };
        
        const addAddress = async (addressData: Omit<Address, 'id' | 'userId'>): Promise<Address> => {
            if (!user) throw new Error("User not logged in");
            const newAddress = await addressService.addAddress(user.id, addressData);
            setAddresses(prev => [...prev, newAddress]);
            if (addresses.length === 0) {
                setDeliveryAddress(newAddress);
            }
            return newAddress;
        };

        const deleteAddress = async (addressId: string) => {
          if (!user) return;
          await addressService.deleteAddress(addressId, user.id);
          const updatedAddresses = await addressService.getAddresses(user.id);
          setAddresses(updatedAddresses);
          if (deliveryAddress?.id === addressId) {
            setDeliveryAddress(updatedAddresses.length > 0 ? updatedAddresses[0] : null);
          }
        };
        
        const placeOrder = async (orderDeliveryAddress: Address) => {
            if (!user || cart.length === 0) return;
            const newOrder = await orderService.createOrder({
                userId: user.id,
                items: cart,
                subtotal: cartContextValue.cartTotal,
                deliveryFee: cartContextValue.deliveryFee,
                serviceFee: cartContextValue.serviceFee,
                total: cartContextValue.checkoutTotal,
                discount: cartDiscount || undefined,
                deliveryAddress: orderDeliveryAddress,
                channel: 'Online',
                deliveryNotes: orderDeliveryAddress.reference
            });
            for (const item of cart) {
                await productService.updateProductStock(item.id, -item.quantity, 'sale-online', `Pedido #${newOrder.id.slice(-6)}`);
            }
            await fetchAllData();
            cartContextValue.clearCart();
        };
        
        const sendChatMessage = async (message: string) => {
            if (!message.trim()) return;
            const newUserMessage: ChatMessage = { role: 'user', content: message };
            setChatHistory(prev => [...prev, newUserMessage]);
            setChatLoading(true);
            setChatError(null);
            try {
                const assistantResponse = await aiService.getChatResponse([...chatHistory, newUserMessage], allProducts);
                setChatHistory(prev => [...prev, assistantResponse]);
            } catch (error: any) {
                setChatError("Lo siento, no pude procesar tu solicitud.");
            } finally {
                setChatLoading(false);
            }
        };
        
        const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
            await orderService.updateOrderStatus(orderId, status);
            await fetchAllData();
        };

        const createReturn = async (returnData: Omit<Return, 'id' | 'date'>) => {
            if (returnData.restocked) {
                for (const item of returnData.returnedItems) {
                    await productService.updateProductStock(item.id, item.quantity, 'return', `Devolución Pedido #${returnData.orderId.slice(-6)}`);
                }
            } else {
                for (const item of returnData.returnedItems) {
                    await productService.updateProductStock(item.id, -item.quantity, 'adjustment', `Dañado en Devolución #${returnData.orderId.slice(-6)}`);
                }
            }
            await financialService.createReturn(returnData);
            await orderService.updateOrderStatus(returnData.orderId, 'Devuelto');
            await fetchAllData();
        };

        return {
            orders, addresses, deliveryAddress, drivers, allProducts, categories, stockMovements, allUsers, expenses, returns, chatHistory, chatLoading, chatError,
            setDeliveryAddress, placeOrder, addAddress, deleteAddress, sendChatMessage,
            assignOrderToDispatcher: async (orderId: string, dispatcherId: string) => {
                await orderService.assignOrderToDispatcher(orderId, dispatcherId);
                await fetchAllData();
            },
            updateOrderFulfillmentStatus: async (orderId: string, status: FulfillmentStatus) => {
                await orderService.updateOrderFulfillmentStatus(orderId, status);
                await fetchAllData();
            },
            assignOrderToRepartidor: async (orderId: string, repartidorId: string) => {
                await orderService.assignOrderToRepartidor(orderId, repartidorId);
                await fetchAllData();
            },
            updateDriverStatus: async (driverId: string, status: Driver['status']) => {
                await driverService.updateDriverStatus(driverId, status);
                await fetchAllData();
            },
            updateOrderStatus,
            receiveStock: async (productId: string, quantity: number, reason?: string) => {
                await productService.updateProductStock(productId, quantity, 'reception', reason);
                await fetchAllData();
            },
            makeStockAdjustment: async (productId: string, quantity: number, reason: string) => {
                await productService.updateProductStock(productId, -quantity, 'adjustment', reason);
                await fetchAllData();
            },
            getProductMovements: productService.getProductMovements,
            processProductImport: async (products: Product[]) => {
                await productService.processCSVImport(products);
                await fetchAllData();
            },
            updateProduct: async (product: Product) => {
                await productService.updateProduct(product);
                await fetchAllData();
            },
            createProduct: async (productData: Omit<Product, 'id' | 'stock'>) => {
                await productService.createProduct(productData);
                await fetchAllData();
            },
            addExpense: async (expenseData: Omit<Expense, 'id' | 'date'>) => {
                await financialService.addExpense(expenseData);
                await fetchAllData();
            },
            createReturn,
            getOrderById: orderService.getOrderById,
            fetchAllData,
        };
    }, [
        user, addresses, deliveryAddress, allProducts, categories, fetchAllData, cart, 
        cartContextValue, cartDiscount, chatHistory, orders, drivers, 
        stockMovements, allUsers, expenses, returns,
    ]);


    return (
        <UIContext.Provider value={uiContextValue}>
            <AuthContext.Provider value={authContextValue}>
                <CartContext.Provider value={cartContextValue}>
                    <DataContext.Provider value={dataContextValue}>
                        {children}
                    </DataContext.Provider>
                </CartContext.Provider>
            </AuthContext.Provider>
        </UIContext.Provider>
    );
};

// =============================================
// HOOKS
// =============================================
export const useUI = () => {
    const context = useContext(UIContext);
    if (context === undefined) throw new Error('useUI must be used within an AppProvider');
    return context;
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AppProvider');
    return context;
};
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) throw new Error('useCart must be used within an AppProvider');
    return context;
};
export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error('useData must be used within an AppProvider');
    return context;
};
